# Computer Vision Demo - Design Ideas

**Created**: 2025-10-30
**Status**: Planning Phase

## Overview
This document outlines potential implementations for the Computer Vision showcase page.

---

## Option 1: Client-Side TensorFlow.js (Recommended for Portfolio)

### Approach
Use pre-trained COCO-SSD model (TensorFlow.js) running entirely in the browser.

### Pros
- ✅ No backend required - runs entirely client-side
- ✅ Fast to implement (pre-trained model)
- ✅ Works offline after initial load
- ✅ Low cost (no server processing)
- ✅ Real-time inference on modern devices
- ✅ Privacy-friendly (no data sent to server)

### Cons
- ❌ Limited to models that run in browser
- ❌ Performance depends on user's device
- ❌ Model size affects initial load time

### Features
1. **Webcam Object Detection**
   - Request camera permission
   - Live video feed with canvas overlay
   - Bounding boxes with labels and confidence scores
   - FPS counter
   - Start/Stop detection toggle

2. **Image Upload Detection**
   - Upload image file
   - Run detection on static image
   - Display results with bounding boxes
   - Download annotated image

3. **Model Info**
   - Display model details (COCO-SSD)
   - Show detectable object classes (80 classes)
   - Performance metrics

### Tech Stack
- `@tensorflow/tfjs`
- `@tensorflow-models/coco-ssd`
- React hooks for camera/canvas management
- HTML5 Canvas for drawing bounding boxes

### Implementation Complexity
**Estimated Time**: 4-6 hours
- Low complexity
- Well-documented libraries
- Many examples available

---

## Option 2: Server-Side YOLO (More Advanced)

### Approach
Use YOLOv8 or YOLOv5 running on backend (FastAPI).

### Pros
- ✅ More accurate detection
- ✅ More model options (YOLOv8, custom models)
- ✅ Consistent performance
- ✅ Can handle larger models

### Cons
- ❌ Requires backend infrastructure
- ❌ Higher cost (GPU/CPU usage)
- ❌ Network latency for real-time
- ❌ Privacy concerns (video sent to server)

### Features
1. **Image Upload Detection**
   - Upload to backend
   - Process with YOLO
   - Return annotated image
   - Display detection results

2. **Video Processing**
   - Upload video file
   - Process frames on backend
   - Return annotated video
   - Progress bar

3. **Custom Model Training** (Future)
   - Upload training dataset
   - Fine-tune model
   - Deploy custom detector

### Tech Stack
- Backend: FastAPI + Ultralytics YOLO
- Frontend: React file upload
- Storage: S3 or Railway volumes
- Processing: Background tasks (Celery/RQ)

### Implementation Complexity
**Estimated Time**: 2-3 days
- Medium-high complexity
- Requires backend changes
- Need to handle video processing

---

## Option 3: Hybrid Approach

### Approach
Start with client-side TensorFlow.js, add server-side option for advanced features.

### Implementation
1. **Phase 1**: TensorFlow.js webcam detection (quick win)
2. **Phase 2**: Add image upload with YOLO backend (optional advanced mode)

### Benefits
- Quick initial implementation
- Showcase both client and server-side ML
- Progressive enhancement

---

## Recommended Approach: Option 1 (TensorFlow.js)

### Why?
1. **Portfolio-friendly**: Visitors can interact immediately without waiting for backend
2. **Fast to implement**: Pre-trained model, well-documented
3. **Impressive demo**: Real-time webcam detection is visually engaging
4. **Cost-effective**: No additional infrastructure needed

### MVP Features (v1)
- [ ] Webcam object detection with COCO-SSD
- [ ] Bounding boxes with labels and confidence scores
- [ ] FPS counter
- [ ] Start/Stop toggle
- [ ] Model information section
- [ ] Browser compatibility check

### Nice-to-Have (v2)
- [ ] Image upload detection
- [ ] Screenshot/download annotated frame
- [ ] Confidence threshold slider
- [ ] Toggle specific object classes
- [ ] Detection history/stats

---

## Design Mockup Structure

```
┌─────────────────────────────────────────┐
│   Computer Vision - Object Detection    │
│   Real-time object detection demo       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  [📹 Video Feed]                        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │   Webcam/Image Feed             │  │
│  │   with Bounding Boxes           │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [Start Detection] [Stop] [Upload]     │
│  FPS: 30 | Objects: 3 | Confidence: 0.5│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Detection Results                      │
│  • Person (0.95)                        │
│  • Laptop (0.87)                        │
│  • Cup (0.72)                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  About This Model                       │
│  COCO-SSD - 80 object classes          │
│  [View Detectable Objects]              │
└─────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── app/
│   └── computer-vision/
│       └── page.tsx                    # Main page
├── components/
│   └── ComputerVision/
│       ├── ObjectDetector.tsx          # Main detection component
│       ├── WebcamFeed.tsx             # Webcam component
│       ├── DetectionCanvas.tsx        # Canvas overlay
│       ├── DetectionResults.tsx       # Results list
│       ├── ModelInfo.tsx              # Model details
│       └── Controls.tsx               # Start/stop/settings
├── hooks/
│   └── useObjectDetection.ts          # TensorFlow.js logic
└── utils/
    └── drawBoundingBoxes.ts           # Canvas drawing utilities
```

---

## Questions for Discussion

1. **Model Choice**:
   - COCO-SSD (faster, 80 classes) or
   - MobileNet + Classifier (more flexible)?

2. **Scope**:
   - Start with just webcam, or include image upload in v1?

3. **Performance**:
   - Target FPS (15-30 fps)?
   - Minimum supported devices?

4. **UX**:
   - Auto-start detection or require user click?
   - Show camera permission instructions?

5. **Fallback**:
   - Demo video for browsers without camera support?

---

## Next Steps

1. ✅ Create design document
2. [ ] Discuss and finalize approach
3. [ ] Install TensorFlow.js dependencies
4. [ ] Build webcam component
5. [ ] Integrate COCO-SSD model
6. [ ] Add canvas drawing for bounding boxes
7. [ ] Create controls and UI
8. [ ] Test across browsers
9. [ ] Write tests
10. [ ] Deploy and demo!
