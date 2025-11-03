'use client';

import { CONFUSION_MATRIX } from '@/lib/mlModelData';

export default function ConfusionMatrix() {
  // Calculate totals
  const totalPredictions = CONFUSION_MATRIX.reduce((sum, item) => sum + item.count, 0);

  // Calculate percentages for each cell
  const matrixData = CONFUSION_MATRIX.map((item) => ({
    ...item,
    percentage: (item.count / totalPredictions) * 100,
  }));

  // Create 2x2 matrix structure
  const matrix = [
    [
      matrixData.find((d) => d.actual === 'Positive' && d.predicted === 'Positive')!,
      matrixData.find((d) => d.actual === 'Positive' && d.predicted === 'Negative')!,
    ],
    [
      matrixData.find((d) => d.actual === 'Negative' && d.predicted === 'Positive')!,
      matrixData.find((d) => d.actual === 'Negative' && d.predicted === 'Negative')!,
    ],
  ];

  // Get cell color based on correctness and intensity
  const getCellColor = (isCorrect: boolean, percentage: number) => {
    if (isCorrect) {
      // True positives/negatives - green shades
      if (percentage > 40) return 'bg-green-600 text-white';
      if (percentage > 30) return 'bg-green-500 text-white';
      if (percentage > 20) return 'bg-green-400 text-white';
      return 'bg-green-300 text-gray-900';
    } else {
      // False positives/negatives - red shades
      if (percentage > 10) return 'bg-red-600 text-white';
      if (percentage > 5) return 'bg-red-500 text-white';
      if (percentage > 2) return 'bg-red-400 text-gray-900';
      return 'bg-red-300 text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Confusion Matrix</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualization of prediction accuracy showing true positives, true negatives, false positives, and false
          negatives.
        </p>
      </div>

      {/* Matrix Visualization */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 overflow-x-auto">
        <div className="flex items-center justify-center">
          <div className="space-y-4">
            {/* Labels */}
            <div className="flex items-center gap-4">
              <div className="w-32"></div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-2">Predicted</p>
                <div className="flex gap-4">
                  <div className="w-32 text-sm text-green-600 dark:text-green-400 font-medium">Positive</div>
                  <div className="w-32 text-sm text-red-600 dark:text-red-400 font-medium">Negative</div>
                </div>
              </div>
            </div>

            {/* Matrix Rows */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold mb-2">Actual</p>
                <div className="space-y-4">
                  <div className="h-32 flex items-center justify-end pr-4 text-sm text-green-600 dark:text-green-400 font-medium">
                    Positive
                  </div>
                  <div className="h-32 flex items-center justify-end pr-4 text-sm text-red-600 dark:text-red-400 font-medium">
                    Negative
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {matrix.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4">
                    {row.map((cell, colIndex) => {
                      const isCorrect = cell.actual === cell.predicted;
                      return (
                        <div
                          key={colIndex}
                          className={`w-32 h-32 rounded-lg flex flex-col items-center justify-center ${getCellColor(
                            isCorrect,
                            cell.percentage
                          )} transition-all hover:scale-105`}
                        >
                          <p className="text-3xl font-bold">{cell.count}</p>
                          <p className="text-sm opacity-90">{cell.percentage.toFixed(1)}%</p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend and Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legend */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
              <span className="text-sm">
                <span className="font-medium">True Positive/Negative:</span> Correct predictions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
              <span className="text-sm">
                <span className="font-medium">False Positive/Negative:</span> Incorrect predictions
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Color intensity indicates the percentage of total predictions.
            </p>
          </div>
        </div>

        {/* Key Metrics from Matrix */}
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Matrix Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">True Positives</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {matrix[0][0].count} ({matrix[0][0].percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">True Negatives</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {matrix[1][1].count} ({matrix[1][1].percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">False Positives</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {matrix[1][0].count} ({matrix[1][0].percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">False Negatives</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {matrix[0][1].count} ({matrix[0][1].percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-700 flex justify-between font-semibold">
              <span>Total Predictions</span>
              <span>{totalPredictions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
