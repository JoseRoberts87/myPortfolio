'use client';

import { MODEL_METRICS, DATASET_INFO, MODEL_INFO } from '@/lib/mlModelData';

export default function ModelMetrics() {
  const metrics = [
    {
      label: 'Accuracy',
      value: MODEL_METRICS.accuracy,
      description: 'Overall correctness of predictions',
    },
    {
      label: 'Precision (Weighted)',
      value: MODEL_METRICS.precision.weighted,
      description: 'Ratio of correct positive predictions',
    },
    {
      label: 'Recall (Weighted)',
      value: MODEL_METRICS.recall.weighted,
      description: 'Ratio of actual positives correctly identified',
    },
    {
      label: 'F1 Score (Weighted)',
      value: MODEL_METRICS.f1Score.weighted,
      description: 'Harmonic mean of precision and recall',
    },
  ];

  const classMetrics = [
    {
      class: 'Positive',
      precision: MODEL_METRICS.precision.positive,
      recall: MODEL_METRICS.recall.positive,
      f1Score: MODEL_METRICS.f1Score.positive,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      class: 'Negative',
      precision: MODEL_METRICS.precision.negative,
      recall: MODEL_METRICS.recall.negative,
      f1Score: MODEL_METRICS.f1Score.negative,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Model Performance</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Evaluation metrics on the Stanford Sentiment Treebank (SST-2) test set.
        </p>
      </div>

      {/* Overall Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{metric.label}</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {(metric.value * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Per-Class Metrics */}
      <div>
        <h3 className="text-xl font-bold mb-4">Per-Class Performance</h3>
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Precision</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Recall</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">F1 Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
              {classMetrics.map((classMetric) => (
                <tr key={classMetric.class} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className={`px-6 py-4 font-medium ${classMetric.color}`}>{classMetric.class}</td>
                  <td className="px-6 py-4">{(classMetric.precision * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">{(classMetric.recall * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4">{(classMetric.f1Score * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Information */}
      <div>
        <h3 className="text-xl font-bold mb-4">Dataset Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Counts */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Sample Distribution</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Samples</span>
                <span className="font-medium">{DATASET_INFO.totalSamples.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Training</span>
                <span className="font-medium">{DATASET_INFO.trainingSamples.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Validation</span>
                <span className="font-medium">{DATASET_INFO.validationSamples.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Test</span>
                <span className="font-medium">{DATASET_INFO.testSamples.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Model Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Architecture</span>
                <span className="font-medium">{MODEL_INFO.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Parameters</span>
                <span className="font-medium">{MODEL_INFO.parameters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Framework</span>
                <span className="font-medium">{MODEL_INFO.framework}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Task</span>
                <span className="font-medium">{MODEL_INFO.task}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Distribution Visualization */}
      <div>
        <h3 className="text-xl font-bold mb-4">Class Distribution</h3>
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-600 dark:text-green-400 font-medium">Positive</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {(DATASET_INFO.classDistribution.positive * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 dark:bg-green-400 transition-all"
                  style={{ width: `${DATASET_INFO.classDistribution.positive * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-600 dark:text-red-400 font-medium">Negative</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {(DATASET_INFO.classDistribution.negative * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 dark:bg-red-400 transition-all"
                  style={{ width: `${DATASET_INFO.classDistribution.negative * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
