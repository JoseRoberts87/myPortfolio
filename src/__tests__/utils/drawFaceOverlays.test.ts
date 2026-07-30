// The util imports a *type* from the face-detection hook; stub the module so
// no mediapipe code is pulled in if the type import isn't elided.
jest.mock('@/hooks/useFaceDetection', () => ({}));

import { drawFaceOverlays, clearCanvas } from '@/utils/drawFaceOverlays';

function makeCtx() {
  return {
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    strokeStyle: '',
    fillStyle: '',
    font: '',
    lineWidth: 0,
  };
}

function makeCanvas(ctx: ReturnType<typeof makeCtx> | null, width = 0, height = 0) {
  return { width, height, getContext: jest.fn(() => ctx) } as unknown as HTMLCanvasElement;
}

// Centered face occupying 40% x 60% of the frame, 80% confidence.
const face = {
  boundingBox: { xCenter: 0.5, yCenter: 0.5, width: 0.4, height: 0.6 },
  score: 0.8,
};

describe('drawFaceOverlays', () => {
  it('converts normalized coordinates to pixels and draws the box', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    drawFaceOverlays(canvas, [face] as never, { width: 200, height: 100 });

    // x = (0.5 - 0.2) * 200 = 60, y = (0.5 - 0.3) * 100 = 20, w = 80, h = 60
    expect(ctx.strokeRect).toHaveBeenCalledWith(60, 20, 80, 60);
    // resizes the canvas to the display size
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
  });

  it('draws the confidence label just above the box', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    drawFaceOverlays(canvas, [face] as never, { width: 200, height: 100 });

    // text at (x, y - 10) = (60, 10) — outlined then filled
    expect(ctx.strokeText).toHaveBeenCalledWith('Face 80%', 60, 10);
    expect(ctx.fillText).toHaveBeenCalledWith('Face 80%', 60, 10);
  });

  it('skips the box when drawBox is disabled but still labels', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx);

    drawFaceOverlays(canvas, [face] as never, { width: 200, height: 100 }, { drawBox: false });

    expect(ctx.strokeRect).not.toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('Face 80%', 60, 10);
  });

  it('returns early when the canvas has no 2d context', () => {
    const canvas = makeCanvas(null);
    expect(drawFaceOverlays(canvas, [face] as never, { width: 10, height: 10 })).toBeUndefined();
  });
});

describe('clearCanvas', () => {
  it('clears the entire canvas', () => {
    const ctx = makeCtx();
    const canvas = makeCanvas(ctx, 320, 240);
    clearCanvas(canvas);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 320, 240);
  });

  it('is a no-op when there is no 2d context', () => {
    const canvas = makeCanvas(null);
    expect(() => clearCanvas(canvas)).not.toThrow();
  });
});
