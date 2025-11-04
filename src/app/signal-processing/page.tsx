import { Section, Badge } from '@/components/ui';
import Image from 'next/image';

export default function SignalProcessingPage() {
  const technologies = [
    'NumPy',
    'SciPy',
    'FFT',
    'Wavelets',
    'Audio Processing',
    'Python',
    'Signal Analysis',
    'Frequency Domain'
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Signal Processing
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Digital signal analysis, frequency domain transforms, and audio processing with NumPy, SciPy, and advanced DSP techniques
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {technologies.map((tech) => (
                <Badge key={tech} variant="purple">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Digital Signal Processing Expertise
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Leveraging advanced signal processing techniques to analyze, transform, and extract meaningful information from time-series data.
              Specializing in frequency domain analysis, filtering, and real-time audio processing applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">FFT</div>
                <p className="text-gray-400 text-sm">Fast Fourier Transform Analysis</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">Wavelets</div>
                <p className="text-gray-400 text-sm">Time-Frequency Decomposition</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">Real-time</div>
                <p className="text-gray-400 text-sm">Audio Processing Pipeline</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Technical Implementation */}
      <Section variant="dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Technical Implementation
          </h2>

          <div className="space-y-8">
            {/* Frequency Domain Analysis */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">
                📊 Frequency Domain Analysis
              </h3>
              <p className="text-gray-300 mb-4">
                Utilizing NumPy's FFT implementation for efficient frequency spectrum analysis.
                Transform time-domain signals to identify dominant frequencies, harmonics, and spectral patterns.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Capabilities:</h4>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>Fast Fourier Transform (FFT) and inverse FFT (IFFT)</li>
                  <li>Power spectral density estimation</li>
                  <li>Spectrogram generation for time-frequency visualization</li>
                  <li>Frequency filtering and band-pass operations</li>
                </ul>
              </div>
            </div>

            {/* Wavelet Transform */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">
                🌊 Wavelet Transform Analysis
              </h3>
              <p className="text-gray-300 mb-4">
                Implementing discrete and continuous wavelet transforms using PyWavelets and SciPy for
                multi-resolution signal analysis. Ideal for non-stationary signals where frequency content changes over time.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Applications:</h4>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>Transient signal detection and analysis</li>
                  <li>Multi-scale feature extraction</li>
                  <li>Signal denoising with wavelet thresholding</li>
                  <li>Time-frequency localization for event detection</li>
                </ul>
              </div>
            </div>

            {/* Digital Filtering */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">
                🔊 Digital Filtering & Audio Processing
              </h3>
              <p className="text-gray-300 mb-4">
                Designing and implementing IIR and FIR filters using SciPy.signal for noise reduction,
                frequency isolation, and signal conditioning. Real-time audio processing pipelines for streaming data.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Filter Types:</h4>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>Butterworth, Chebyshev, and Elliptic filters</li>
                  <li>Band-pass, band-stop, low-pass, and high-pass filters</li>
                  <li>Adaptive filtering for noise cancellation</li>
                  <li>Real-time convolution and FIR filtering</li>
                </ul>
              </div>
            </div>

            {/* Signal Analysis Tools */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">
                🔬 Signal Analysis & Feature Extraction
              </h3>
              <p className="text-gray-300 mb-4">
                Extracting meaningful features from signals for classification, anomaly detection, and pattern recognition.
                Statistical and spectral features for machine learning pipelines.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Features & Techniques:</h4>
                <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                  <li>Statistical moments (mean, variance, skewness, kurtosis)</li>
                  <li>Spectral features (centroid, rolloff, flux, bandwidth)</li>
                  <li>Zero-crossing rate and autocorrelation analysis</li>
                  <li>Mel-frequency cepstral coefficients (MFCC) for audio</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Use Cases */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Real-World Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">🎵 Audio Analysis</h3>
              <p className="text-gray-400 text-sm">
                Music information retrieval, pitch detection, tempo estimation, and audio fingerprinting
                for content identification and recommendation systems.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">📈 Financial Time-Series</h3>
              <p className="text-gray-400 text-sm">
                Trend analysis, cycle detection, and noise filtering for stock market data.
                Spectral analysis for identifying periodic patterns in trading signals.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">🏥 Biomedical Signals</h3>
              <p className="text-gray-400 text-sm">
                ECG and EEG signal processing for healthcare applications. Filtering artifacts,
                detecting anomalies, and extracting diagnostic features from physiological data.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">📡 Communication Systems</h3>
              <p className="text-gray-400 text-sm">
                Modulation/demodulation, channel equalization, and interference mitigation.
                Implementing software-defined radio (SDR) techniques for signal transmission.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Technology Stack Details */}
      <Section variant="dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Core Libraries</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">NumPy</span>
                    <p className="text-gray-400 text-sm">Array operations and FFT implementation</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">SciPy.signal</span>
                    <p className="text-gray-400 text-sm">Filter design and signal processing algorithms</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">PyWavelets</span>
                    <p className="text-gray-400 text-sm">Wavelet transform implementation</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Visualization</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">Matplotlib</span>
                    <p className="text-gray-400 text-sm">Time-domain and frequency-domain plots</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">Plotly</span>
                    <p className="text-gray-400 text-sm">Interactive spectrograms and 3D visualizations</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <div>
                    <span className="text-white font-medium">Librosa</span>
                    <p className="text-gray-400 text-sm">Audio feature extraction and visualization</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interested in Signal Processing Solutions?
          </h2>
          <p className="text-gray-300 mb-8">
            Let's discuss how digital signal processing can enhance your data analysis and audio processing needs.
          </p>
          <a
            href="/#contact"
            className="inline-block bg-white text-purple-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
