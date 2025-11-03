'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MLModelState, SentimentPrediction, SentimentResult } from '@/types/ml';
import { MODEL_INFO } from '@/lib/mlModelData';

// Type definition for the pipeline
type Pipeline = any; // @xenova/transformers types aren't fully typed

export function useMLModel() {
  const [state, setState] = useState<MLModelState>({
    status: 'idle',
    error: null,
    modelName: MODEL_INFO.fullName,
    isLoading: false,
    isReady: false,
  });

  // Store the pipeline instance
  const pipelineRef = useRef<Pipeline | null>(null);

  // Load the model
  const loadModel = useCallback(async () => {
    if (pipelineRef.current) {
      // Model already loaded
      setState((prev) => ({ ...prev, status: 'ready', isReady: true }));
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', isLoading: true, error: null }));

    try {
      // Dynamically import transformers.js to avoid SSR issues
      const { pipeline } = await import('@xenova/transformers');

      // Load the sentiment analysis pipeline
      const classifier = await pipeline(
        'sentiment-analysis',
        MODEL_INFO.fullName
      );

      pipelineRef.current = classifier;

      setState((prev) => ({
        ...prev,
        status: 'ready',
        isLoading: false,
        isReady: true,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load model';
      setState((prev) => ({
        ...prev,
        status: 'error',
        isLoading: false,
        isReady: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Predict sentiment for given text
  const predict = useCallback(
    async (text: string): Promise<SentimentResult | null> => {
      if (!pipelineRef.current) {
        setState((prev) => ({
          ...prev,
          error: 'Model not loaded. Call loadModel() first.',
        }));
        return null;
      }

      if (!text.trim()) {
        return null;
      }

      try {
        const startTime = performance.now();

        // Run inference
        const result = await pipelineRef.current(text);

        const endTime = performance.now();
        const inferenceTime = endTime - startTime;

        // The model returns an array with one result
        const prediction = Array.isArray(result) ? result[0] : result;

        // Map the label to our format
        const label = prediction.label.toLowerCase() as 'positive' | 'negative';
        const score = prediction.score;

        // Create confidence scores for both classes
        const confidences = {
          positive: label === 'positive' ? score : 1 - score,
          neutral: 0, // SST-2 doesn't have neutral
          negative: label === 'negative' ? score : 1 - score,
        };

        const sentimentResult: SentimentResult = {
          text,
          prediction: {
            label: label === 'negative' ? 'negative' : 'positive',
            score,
          },
          confidences,
          inferenceTime,
        };

        return sentimentResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Prediction failed';
        setState((prev) => ({ ...prev, error: errorMessage }));
        return null;
      }
    },
    []
  );

  // Auto-load model on mount (optional - can be triggered manually instead)
  useEffect(() => {
    // You can uncomment this to auto-load the model on mount
    // loadModel();
  }, [loadModel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed (transformers.js handles most cleanup automatically)
      pipelineRef.current = null;
    };
  }, []);

  return {
    ...state,
    loadModel,
    predict,
  };
}
