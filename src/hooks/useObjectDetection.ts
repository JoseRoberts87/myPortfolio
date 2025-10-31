import { useEffect, useRef, useState, useCallback } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface DetectionStats {
  fps: number;
  objectCount: number;
  detections: DetectedObject[];
}

export function useObjectDetection() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [stats, setStats] = useState<DetectionStats>({
    fps: 0,
    objectCount: 0,
    detections: [],
  });

  const detectionIntervalRef = useRef<number | null>(null);
  const fpsIntervalRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // Load the COCO-SSD model
  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        setModelError(null);
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setModelError('Failed to load detection model. Please refresh the page.');
        setIsModelLoading(false);
      }
    }

    loadModel();

    return () => {
      // Cleanup on unmount
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
      if (fpsIntervalRef.current) {
        window.clearInterval(fpsIntervalRef.current);
      }
    };
  }, []);

  // Calculate FPS
  const updateFPS = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastTimeRef.current) / 1000; // seconds
    const fps = Math.round(frameCountRef.current / elapsed);

    setStats((prev) => ({
      ...prev,
      fps,
    }));

    frameCountRef.current = 0;
    lastTimeRef.current = now;
  }, []);

  // Start FPS counter
  useEffect(() => {
    if (isDetecting) {
      fpsIntervalRef.current = window.setInterval(updateFPS, 1000);
      lastTimeRef.current = Date.now();
      frameCountRef.current = 0;
    } else {
      if (fpsIntervalRef.current) {
        window.clearInterval(fpsIntervalRef.current);
        fpsIntervalRef.current = null;
      }
    }

    return () => {
      if (fpsIntervalRef.current) {
        window.clearInterval(fpsIntervalRef.current);
      }
    };
  }, [isDetecting, updateFPS]);

  // Detect objects in video element
  const detectObjects = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!model || !isDetecting) return;

      try {
        const predictions = await model.detect(videoElement);

        const detections: DetectedObject[] = predictions.map((pred) => ({
          class: pred.class,
          score: pred.score,
          bbox: pred.bbox,
        }));

        setStats((prev) => ({
          ...prev,
          objectCount: detections.length,
          detections,
        }));

        frameCountRef.current += 1;
      } catch (error) {
        console.error('Detection error:', error);
      }
    },
    [model, isDetecting]
  );

  // Start continuous detection
  const startDetection = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (!model) {
        console.warn('Model not loaded yet');
        return;
      }

      setIsDetecting(true);

      // Run detection at ~30fps
      detectionIntervalRef.current = window.setInterval(() => {
        detectObjects(videoElement);
      }, 33); // ~30fps
    },
    [model, detectObjects]
  );

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);

    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    setStats({
      fps: 0,
      objectCount: 0,
      detections: [],
    });
  }, []);

  // Detect on single image
  const detectImage = useCallback(
    async (imageElement: HTMLImageElement) => {
      if (!model) {
        throw new Error('Model not loaded');
      }

      const predictions = await model.detect(imageElement);

      const detections: DetectedObject[] = predictions.map((pred) => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox,
      }));

      return detections;
    },
    [model]
  );

  return {
    model,
    isModelLoading,
    modelError,
    isDetecting,
    stats,
    startDetection,
    stopDetection,
    detectImage,
  };
}
