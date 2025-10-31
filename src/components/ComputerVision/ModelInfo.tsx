'use client';

import { useState } from 'react';
import { Card, Badge } from '@/components/ui';

const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
  'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
  'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

export default function ModelInfo() {
  const [showAllClasses, setShowAllClasses] = useState(false);

  return (
    <Card variant="bordered" padding="lg">
      <h2 className="text-2xl font-semibold mb-4">About COCO-SSD Model</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-purple-400 mb-2">Model Details</h3>
          <p className="text-gray-400 mb-3">
            COCO-SSD (Single Shot MultiBox Detection) is a pre-trained object detection model
            that can identify and locate 80 different object categories in real-time.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/50 p-3 rounded">
              <div className="text-sm text-gray-400">Object Classes</div>
              <div className="text-xl font-bold text-white">80</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded">
              <div className="text-sm text-gray-400">Framework</div>
              <div className="text-xl font-bold text-white">TensorFlow.js</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-purple-400">Detectable Objects</h3>
            <button
              onClick={() => setShowAllClasses(!showAllClasses)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showAllClasses ? 'Show Less' : `View All (${COCO_CLASSES.length})`}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(showAllClasses ? COCO_CLASSES : COCO_CLASSES.slice(0, 20)).map((className) => (
              <Badge key={className} variant="primary" size="sm">
                {className}
              </Badge>
            ))}
            {!showAllClasses && (
              <Badge variant="warning" size="sm">
                +{COCO_CLASSES.length - 20} more
              </Badge>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-purple-400 mb-2">Features</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Real-time detection on modern devices</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Runs entirely in browser (no server required)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Bounding box visualization with confidence scores</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Adjustable confidence threshold for filtering</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <h3 className="text-lg font-medium text-purple-400 mb-2">Privacy</h3>
          <p className="text-gray-400 text-sm">
            All processing happens locally in your browser. No video or images are sent to any server.
            Your camera feed is private and secure.
          </p>
        </div>
      </div>
    </Card>
  );
}
