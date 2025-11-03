import { DetectedFace } from '@/hooks/useFaceDetection';

export interface DrawFaceOptions {
  drawBox?: boolean;
  boxColor?: string;
  textColor?: string;
  lineWidth?: number;
}

const defaultOptions: DrawFaceOptions = {
  drawBox: true,
  boxColor: '#00ff00',
  textColor: '#00ff00',
  lineWidth: 2,
};

export function drawFaceOverlays(
  canvas: HTMLCanvasElement,
  faces: DetectedFace[],
  displaySize: { width: number; height: number },
  options: DrawFaceOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set canvas size to match display size
  if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
  }

  faces.forEach((face) => {
    const { boundingBox, score } = face;

    // Convert normalized coordinates to pixel coordinates
    const x = (boundingBox.xCenter - boundingBox.width / 2) * displaySize.width;
    const y = (boundingBox.yCenter - boundingBox.height / 2) * displaySize.height;
    const width = boundingBox.width * displaySize.width;
    const height = boundingBox.height * displaySize.height;

    // Draw bounding box
    if (opts.drawBox) {
      ctx.strokeStyle = opts.boxColor!;
      ctx.lineWidth = opts.lineWidth!;
      ctx.strokeRect(x, y, width, height);
    }

    // Draw confidence score
    const textX = x;
    const textY = y - 10;

    ctx.font = '14px Arial';
    ctx.fillStyle = opts.textColor!;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 3;

    const confidenceText = `Face ${Math.round(score * 100)}%`;
    ctx.strokeText(confidenceText, textX, textY);
    ctx.fillText(confidenceText, textX, textY);
  });
}

export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
