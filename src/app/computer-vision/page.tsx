'use client';

import { Section, Card, Badge } from '@/components/ui';
import ObjectDetector from '@/components/ComputerVision/ObjectDetector';
import ModelInfo from '@/components/ComputerVision/ModelInfo';
import ImageUploadDetector from '@/components/ComputerVision/ImageUploadDetector';

export default function ComputerVisionPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Computer Vision
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time object detection using webcam with bounding box visualization powered by TensorFlow.js.
          </p>
        </div>
      </Section>

      {/* Main Object Detector */}
      <Section padding="lg">
        <ObjectDetector />
      </Section>

      {/* Model Information */}
      <Section padding="lg" background="subtle">
        <ModelInfo />
      </Section>

      {/* YOLO Image Upload Detector */}
      <Section padding="lg">
        <ImageUploadDetector />
      </Section>

      {/* Technology Stack */}
      <Section padding="lg">
        <h2 className="text-3xl font-bold mb-8">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">TensorFlow.js</h3>
            <p className="text-gray-400 mb-4">
              Machine learning library that runs in the browser, enabling real-time inference without server calls.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">TensorFlow.js</Badge>
              <Badge variant="primary">COCO-SSD</Badge>
              <Badge variant="primary">WebGL</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">WebRTC & Canvas</h3>
            <p className="text-gray-400 mb-4">
              Browser APIs for camera access and real-time graphics rendering for bounding box visualization.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">WebRTC</Badge>
              <Badge variant="primary">Canvas API</Badge>
              <Badge variant="primary">MediaDevices</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">React Hooks</h3>
            <p className="text-gray-400 mb-4">
              Custom hooks for managing camera state, model loading, and detection lifecycle with performance optimization.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">React 19</Badge>
              <Badge variant="primary">TypeScript</Badge>
              <Badge variant="primary">Custom Hooks</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Performance</h3>
            <p className="text-gray-400 mb-4">
              Real-time FPS monitoring, confidence threshold filtering, and optimized rendering for smooth detection.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">~30 FPS</Badge>
              <Badge variant="primary">Client-side</Badge>
              <Badge variant="primary">No Server</Badge>
            </div>
          </Card>

          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">YOLOv8 (Server-Side)</h3>
            <p className="text-gray-400 mb-4">
              Advanced object detection using YOLOv8 on the backend for higher accuracy and more robust detection.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">YOLOv8</Badge>
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">FastAPI</Badge>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
}
