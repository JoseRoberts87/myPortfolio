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

  it('uses the class-specific color for a known class', () => {
    const ctx = makeCtx();
    drawBoundingBoxes(makeCanvas(ctx), [person] as never);
    // 'person' maps to #FF6B6B; strokeStyle is set to it and not overwritten.
    expect(ctx.strokeStyle).toBe('#FF6B6B');
  });

  it('falls back to the default purple for an unknown class', () => {
    const ctx = makeCtx();
    const alien = { class: 'ufo', score: 0.9, bbox: [1, 2, 3, 4] };
    drawBoundingBoxes(makeCanvas(ctx), [alien] as never);
    expect(ctx.strokeStyle).toBe('#A855F7');
  });

  it('treats minConfidence: 0 as the 0.5 default (falsy fallback)', () => {
    const ctx = makeCtx();
    // 0 is falsy, so `opts.minConfidence || 0.5` resolves to 0.5 — the 0.3
    // detection is still filtered out, only the 0.9 one is drawn.
    const count = drawBoundingBoxes(makeCanvas(ctx), [person, lowConfidence] as never, {
      minConfidence: 0,
    });
    expect(count).toBe(1);
  });

  it('falls back to default lineWidth/font/padding when passed falsy values', () => {
    const ctx = makeCtx();
    drawBoundingBoxes(makeCanvas(ctx), [person] as never, {
      lineWidth: 0,
      font: '',
      textPadding: 0,
    });
    // Falsy opts resolve to their defaults (lineWidth 2, font 16px sans-serif,
    // padding 4) — so the label background still uses padding 4: (10,-4,58,24).
    expect(ctx.lineWidth).toBe(2);
    expect(ctx.font).toBe('16px sans-serif');
    expect(ctx.fillRect).toHaveBeenCalledWith(10, -4, 58, 24);
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
