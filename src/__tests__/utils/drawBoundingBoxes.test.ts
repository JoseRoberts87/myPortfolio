// The util imports a *type* from the object-detection hook; stub the module so
// no tfjs/model code is pulled in if the type import isn't elided.
jest.mock('@/hooks/useObjectDetection', () => ({}));

import { drawBoundingBoxes, clearCanvas } from '@/utils/drawBoundingBoxes';

function makeCtx() {
  return {
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
    fillRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    strokeStyle: '',
    fillStyle: '',
    font: '',
    lineWidth: 0,
  };
}

function makeCanvas(ctx: ReturnType<typeof makeCtx> | null, width = 640, height = 480) {
  return { width, height, getContext: jest.fn(() => ctx) } as unknown as HTMLCanvasElement;
}

const person = { class: 'person', score: 0.9, bbox: [10, 20, 100, 50] };
const lowConfidence = { class: 'car', score: 0.3, bbox: [0, 0, 10, 10] };

describe('drawBoundingBoxes', () => {
  it('clears the canvas and draws only confident detections', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    const count = drawBoundingBoxes(canvas, [person, lowConfidence] as never);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
    expect(count).toBe(1); // 0.3 filtered out by the 0.5 default threshold
    expect(ctx.strokeRect).toHaveBeenCalledTimes(1);
    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 100, 50);
  });

  it('computes the label text and its background/text coordinates', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    drawBoundingBoxes(canvas, [person] as never);

    // label text at (x + padding, y - padding) = (14, 16)
    expect(ctx.fillText).toHaveBeenCalledWith('person 90%', 14, 16);
    // label background at (x, y - textHeight - padding*2, textWidth + padding*2, textHeight + padding*2)
    // = (10, 20 - 16 - 8, 50 + 8, 16 + 8) = (10, -4, 58, 24)
    expect(ctx.fillRect).toHaveBeenCalledWith(10, -4, 58, 24);
  });

  it('honors a custom minConfidence', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    const count = drawBoundingBoxes(canvas, [person] as never, { minConfidence: 0.95 });

    expect(count).toBe(0);
    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  it('returns undefined when the canvas has no 2d context', () => {
    const canvas = makeCanvas(null);
    expect(drawBoundingBoxes(canvas, [person] as never)).toBeUndefined();
  });
});

describe('clearCanvas', () => {
  it('clears the entire canvas', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx, 320, 240);
    clearCanvas(canvas);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 320, 240);
  });
});
