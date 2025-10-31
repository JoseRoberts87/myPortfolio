import { DetectedObject } from '@/hooks/useObjectDetection';

export interface DrawOptions {
  lineWidth?: number;
  font?: string;
  textPadding?: number;
  minConfidence?: number;
}

const defaultOptions: DrawOptions = {
  lineWidth: 2,
  font: '16px sans-serif',
  textPadding: 4,
  minConfidence: 0.5,
};

// Get color based on object class (for variety)
function getColorForClass(className: string): string {
  const colors: Record<string, string> = {
    person: '#FF6B6B',
    car: '#4ECDC4',
    truck: '#45B7D1',
    bus: '#96CEB4',
    bicycle: '#FECA57',
    motorcycle: '#FF9FF3',
    bottle: '#54A0FF',
    cup: '#48DBFB',
    laptop: '#1DD1A1',
    'cell phone': '#5F27CD',
    book: '#00D2D3',
    clock: '#FF6348',
    chair: '#FFA502',
    'dining table': '#FF6348',
    dog: '#2ED573',
    cat: '#FFA502',
    bird: '#1E90FF',
  };

  return colors[className] || '#A855F7'; // Default purple
}

export function drawBoundingBoxes(
  canvas: HTMLCanvasElement,
  detections: DetectedObject[],
  options: DrawOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Filter by confidence
  const filteredDetections = detections.filter(
    (det) => det.score >= (opts.minConfidence || 0.5)
  );

  // Draw each detection
  filteredDetections.forEach((detection) => {
    const [x, y, width, height] = detection.bbox;
    const color = getColorForClass(detection.class);
    const label = `${detection.class} ${Math.round(detection.score * 100)}%`;

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    ctx.font = opts.font || '16px sans-serif';
    const textMetrics = ctx.measureText(label);
    const textWidth = textMetrics.width;
    const textHeight = 16; // Approximate font size
    const padding = opts.textPadding || 4;

    ctx.fillStyle = color;
    ctx.fillRect(
      x,
      y - textHeight - padding * 2,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x + padding, y - padding);
  });

  return filteredDetections.length;
}

export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
