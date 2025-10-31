"""Computer Vision API endpoints using YOLO for object detection."""
import base64
import io
import logging
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import numpy as np
from ultralytics import YOLO
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# Load YOLO model (YOLOv8n - nano model for fast inference)
# Model will be downloaded on first use
try:
    model = YOLO('yolov8n.pt')
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    model = None


class Detection(BaseModel):
    """Single object detection."""
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]


class DetectionResponse(BaseModel):
    """Response model for object detection."""
    detections: List[Detection]
    image_width: int
    image_height: int
    annotated_image: str | None = None  # Base64 encoded image


@router.post("/detect/image", response_model=DetectionResponse)
async def detect_objects_in_image(
    file: UploadFile = File(...),
    confidence: float = 0.5,
    return_annotated: bool = True
):
    """
    Detect objects in an uploaded image using YOLOv8.

    Args:
        file: Image file (JPEG, PNG, etc.)
        confidence: Minimum confidence threshold (0.0-1.0)
        return_annotated: Whether to return annotated image with bounding boxes

    Returns:
        Detection results with bounding boxes and optionally annotated image
    """
    if not model:
        raise HTTPException(
            status_code=500,
            detail="YOLO model not loaded. Please try again later."
        )

    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image (JPEG, PNG, etc.)"
        )

    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Get image dimensions
        img_width, img_height = image.size

        # Run YOLO detection
        results = model(image, conf=confidence, verbose=False)

        # Extract detections
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get bounding box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Get class and confidence
                cls = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = model.names[cls]

                detections.append(Detection(
                    class_name=class_name,
                    confidence=conf,
                    bbox=[x1, y1, x2, y2]
                ))

        # Optionally generate annotated image
        annotated_image_b64 = None
        if return_annotated and detections:
            # Get annotated image from YOLO
            annotated = results[0].plot()  # Returns numpy array (BGR)

            # Convert BGR to RGB
            annotated_rgb = Image.fromarray(annotated[..., ::-1])

            # Convert to base64
            buffered = io.BytesIO()
            annotated_rgb.save(buffered, format="JPEG")
            annotated_image_b64 = base64.b64encode(buffered.getvalue()).decode()

        logger.info(f"Detected {len(detections)} objects in image")

        return DetectionResponse(
            detections=detections,
            image_width=img_width,
            image_height=img_height,
            annotated_image=annotated_image_b64
        )

    except Exception as e:
        logger.error(f"Error detecting objects: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@router.get("/models/info")
async def get_model_info():
    """Get information about the loaded YOLO model."""
    if not model:
        raise HTTPException(
            status_code=500,
            detail="YOLO model not loaded"
        )

    return {
        "model_name": "YOLOv8n",
        "model_type": "Object Detection",
        "num_classes": len(model.names),
        "classes": list(model.names.values()),
        "description": "YOLOv8 nano model - Fast and accurate object detection",
        "input_size": 640,
    }
