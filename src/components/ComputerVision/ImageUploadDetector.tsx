'use client';

import { useState, useRef } from 'react';
import { Card, Badge } from '@/components/ui';
import { detectObjectsInImage } from '@/lib/api';
import Image from 'next/image';

interface Detection {
  class_name: string;
  confidence: number;
  bbox: number[];
}

export default function ImageUploadDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnnotatedImageUrl(null);
    setDetections([]);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setError(null);

      const result = await detectObjectsInImage(selectedFile, {
        confidence,
        returnAnnotated: true,
      });

      setDetections(result.detections);

      // Set annotated image if available
      if (result.annotated_image) {
        setAnnotatedImageUrl(`data:image/jpeg;base64,${result.annotated_image}`);
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect objects');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnnotatedImageUrl(null);
    setDetections([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">YOLO Object Detection</h2>
        <Badge variant="primary">Server-Side</Badge>
      </div>

      <p className="text-gray-400 mb-6">
        Upload an image to detect objects using YOLOv8 - more accurate detection powered by our backend.
      </p>

      {/* File Upload Area */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors cursor-pointer text-center"
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-300 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, JPEG up to 10MB
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <Badge variant="error" className="mb-2">
            Error
          </Badge>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Preview and Results */}
      {(previewUrl || annotatedImageUrl) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Original Image */}
          {previewUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">Original Image</h3>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Original"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Annotated Image */}
          {annotatedImageUrl && (
            <div>
              <h3 className="text-lg font-medium mb-3">Detection Results</h3>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={annotatedImageUrl}
                  alt="Annotated"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confidence Slider */}
      {selectedFile && !isProcessing && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Threshold: {Math.round(confidence * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDetect}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              'Detect Objects'
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      )}

      {/* Detection Results List */}
      {detections.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Detected Objects ({detections.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detections
              .sort((a, b) => b.confidence - a.confidence)
              .map((detection, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded"
                >
                  <span className="text-gray-300 capitalize font-medium">
                    {detection.class_name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${detection.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right">
                      {Math.round(detection.confidence * 100)}%
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
          <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            This uses YOLOv8 nano model running on our backend server for more accurate detection.
            Images are processed securely and not stored.
          </p>
        </div>
      </div>
    </Card>
  );
}
