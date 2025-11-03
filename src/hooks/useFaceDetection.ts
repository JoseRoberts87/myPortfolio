import { useState, useEffect, useRef, useCallback } from 'react';

export interface DetectedFace {
  boundingBox: {
    xCenter: number;
    yCenter: number;
    width: number;
    height: number;
  };
  keypoints?: Array<{ x: number; y: number; z?: number }>;
  score: number;
}

export interface FaceDetectionStats {
  fps: number;
  faceCount: number;
  faces: DetectedFace[];
}

export function useFaceDetection() {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [stats, setStats] = useState<FaceDetectionStats>({
    fps: 0,
    faceCount: 0,
    faces: [],
  });

  const faceDetectionRef = useRef<any>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);

  // Load models dynamically (client-side only)
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);

        // Dynamically import MediaPipe (browser only)
        const { FaceDetection } = await import('@mediapipe/face_detection');

        const faceDetection = new FaceDetection({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          },
        });

        faceDetection.setOptions({
          model: 'short',
          minDetectionConfidence: 0.5,
        });

        faceDetectionRef.current = faceDetection;

        await faceDetection.initialize();

        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setModelError('Failed to load face detection models');
        setIsModelLoading(false);
      }
    };

    // Only load in browser environment
    if (typeof window !== 'undefined') {
      loadModels();
    }

    return () => {
      faceDetectionRef.current?.close();
    };
  }, []);

  const detectFaces = useCallback(async () => {
    const video = videoElementRef.current;
    const faceDetection = faceDetectionRef.current;

    if (!video || !faceDetection || isModelLoading || video.readyState !== 4) {
      return;
    }

    try {
      await faceDetection.send({ image: video });

      // Calculate FPS
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (delta > 0) {
        const currentFps = 1000 / delta;
        fpsCounterRef.current.push(currentFps);
        if (fpsCounterRef.current.length > 10) {
          fpsCounterRef.current.shift();
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    if (animationFrameRef.current !== null) {
      animationFrameRef.current = requestAnimationFrame(detectFaces);
    }
  }, [isModelLoading]);

  const startDetection = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (isModelLoading || !faceDetectionRef.current) {
        console.warn('Models still loading');
        return;
      }

      videoElementRef.current = videoElement;
      setIsDetecting(true);
      lastFrameTimeRef.current = performance.now();

      // Set up results listener
      faceDetectionRef.current.onResults((results: any) => {
        const faces: DetectedFace[] = (results.detections || []).map((detection: any) => {
          // MediaPipe stores the score in detection.V[0].ga
          const score = (detection.V && detection.V[0] && detection.V[0].ga) || 0;

          return {
            boundingBox: {
              xCenter: detection.boundingBox.xCenter,
              yCenter: detection.boundingBox.yCenter,
              width: detection.boundingBox.width,
              height: detection.boundingBox.height,
            },
            keypoints: detection.landmarks,
            score: score,
          };
        });

        const avgFps =
          fpsCounterRef.current.length > 0
            ? Math.round(
                fpsCounterRef.current.reduce((a, b) => a + b, 0) /
                  fpsCounterRef.current.length
              )
            : 0;

        setStats({
          fps: avgFps,
          faceCount: faces.length,
          faces,
        });
      });

      animationFrameRef.current = requestAnimationFrame(detectFaces);
    },
    [isModelLoading, detectFaces]
  );

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setStats({ fps: 0, faceCount: 0, faces: [] });
    fpsCounterRef.current = [];
  }, []);

  return {
    isModelLoading,
    modelError,
    isDetecting,
    stats,
    startDetection,
    stopDetection,
  };
}
