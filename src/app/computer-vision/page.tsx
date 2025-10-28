import { Section, Card, Badge } from '@/components/ui';

export default function ComputerVisionPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Computer Vision
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time object detection using webcam or video files with bounding box visualization.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Badge variant="warning" size="lg" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">Real-time Object Detection</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This section will feature a real-time object detection system using YOLO or TensorFlow.js,
              with webcam integration, bounding box visualization, confidence scores, and FPS monitoring
              for live video processing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge variant="primary">TensorFlow.js</Badge>
              <Badge variant="primary">YOLO</Badge>
              <Badge variant="primary">WebRTC</Badge>
              <Badge variant="primary">Canvas API</Badge>
              <Badge variant="primary">Real-time Processing</Badge>
            </div>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Webcam Integration</h3>
            <p className="text-gray-400">
              Live webcam feed processing with real-time object detection and classification.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Bounding Boxes</h3>
            <p className="text-gray-400">
              Visual bounding boxes around detected objects with labels and confidence scores.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Video Upload</h3>
            <p className="text-gray-400">
              Process uploaded video files with frame-by-frame object detection and analysis.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Performance Monitoring</h3>
            <p className="text-gray-400">
              Real-time FPS counter and performance metrics with model selection options.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
