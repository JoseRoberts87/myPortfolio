'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Badge } from '@/components/ui';
import { useObjectDetection } from '@/hooks/useObjectDetection';
import { drawBoundingBoxes, clearCanvas } from '@/utils/drawBoundingBoxes';

export default function ObjectDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState(0.5);

  const {
    isModelLoading,
    modelError,
    isDetecting,
    stats,
    startDetection,
    stopDetection,
  } = useObjectDetection();

  // Initialize webcam
  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);

          // Set canvas size to match video
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError(
        'Unable to access camera. Please ensure camera permissions are granted.'
      );
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Draw bounding boxes when detections update
  useEffect(() => {
    if (canvasRef.current && isDetecting) {
      drawBoundingBoxes(canvasRef.current, stats.detections, {
        minConfidence,
      });
    } else if (canvasRef.current && !isDetecting) {
      clearCanvas(canvasRef.current);
    }
  }, [stats.detections, isDetecting, minConfidence]);

  const handleStartDetection = () => {
    if (videoRef.current && cameraReady) {
      startDetection(videoRef.current);
    }
  };

  const handleStopDetection = () => {
    stopDetection();
    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold">Real-time Object Detection</h2>

        <div className="flex items-center gap-3">
          {!cameraReady ? (
            <button
              onClick={initializeCamera}
              disabled={isModelLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {isModelLoading ? 'Loading Model...' : 'Enable Camera'}
            </button>
          ) : isDetecting ? (
            <button
              onClick={handleStopDetection}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
            >
              Stop Detection
            </button>
          ) : (
            <button
              onClick={handleStartDetection}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
            >
              Start Detection
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {modelError && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <Badge variant="error" className="mb-2">
            Model Error
          </Badge>
          <p className="text-red-400">{modelError}</p>
        </div>
      )}

      {cameraError && (
        <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <Badge variant="warning" className="mb-2">
            Camera Error
          </Badge>
          <p className="text-yellow-400">{cameraError}</p>
        </div>
      )}

      {/* Video Feed with Canvas Overlay */}
      <div className="relative bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
          style={{ maxHeight: '480px' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Loading Overlay */}
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white">Loading AI Model...</p>
            </div>
          </div>
        )}

        {/* Camera Not Ready Overlay */}
        {!cameraReady && !isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center p-6">
              <svg
                className="w-16 h-16 text-gray-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400">Click "Enable Camera" to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.fps}</div>
          <div className="text-sm text-gray-400">FPS</div>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {stats.objectCount}
          </div>
          <div className="text-sm text-gray-400">Objects</div>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <Badge
            variant={isDetecting ? 'success' : 'warning'}
            size="lg"
            className="mb-1"
          >
            {isDetecting ? 'Active' : 'Idle'}
          </Badge>
          <div className="text-sm text-gray-400">Status</div>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(minConfidence * 100)}%
          </div>
          <div className="text-sm text-gray-400">Confidence</div>
        </div>
      </div>

      {/* Confidence Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Confidence Threshold
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={minConfidence}
          onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Detected Objects List */}
      {stats.detections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Detected Objects</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.detections
              .filter((det) => det.score >= minConfidence)
              .sort((a, b) => b.score - a.score)
              .map((detection, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-800/50 rounded"
                >
                  <span className="text-gray-300 capitalize">
                    {detection.class}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${detection.score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {Math.round(detection.score * 100)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
