'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Badge } from '@/components/ui';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { drawFaceOverlays, clearCanvas } from '@/utils/drawFaceOverlays';

export default function FaceDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const {
    isModelLoading,
    modelError,
    isDetecting,
    stats,
    startDetection,
    stopDetection,
  } = useFaceDetection();

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

  // Draw face overlays when detections update
  useEffect(() => {
    if (canvasRef.current && videoRef.current && isDetecting) {
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };

      drawFaceOverlays(canvasRef.current, stats.faces, displaySize);
    } else if (canvasRef.current && !isDetecting) {
      clearCanvas(canvasRef.current);
    }
  }, [stats.faces, isDetecting]);

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
        <h2 className="text-2xl font-semibold">Real-time Face Detection</h2>

        <div className="flex items-center gap-3">
          {!cameraReady ? (
            <button
              onClick={initializeCamera}
              disabled={isModelLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {isModelLoading ? 'Loading Models...' : 'Enable Camera'}
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
              <p className="text-white">Loading AI Models...</p>
              <p className="text-sm text-gray-400 mt-2">
                Powered by Google MediaPipe
              </p>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{stats.fps}</div>
          <div className="text-sm text-gray-400">FPS</div>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {stats.faceCount}
          </div>
          <div className="text-sm text-gray-400">Faces</div>
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
      </div>

      {/* Detected Faces List */}
      {stats.faces.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Detected Faces ({stats.faceCount})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.faces.map((face, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded"
              >
                <span className="text-gray-300">Face {index + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${face.score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">
                    {Math.round(face.score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-400">
          <svg
            className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            This feature uses Google MediaPipe Face Detection running entirely
            in your browser. All processing happens locally - no video or images
            are sent to any server. Your privacy is fully protected.
          </p>
        </div>
      </div>
    </Card>
  );
}
