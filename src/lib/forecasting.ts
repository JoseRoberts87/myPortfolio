/**
 * Time-series forecasting for the predictive-maintenance demo.
 *
 * Pure, deterministic functions: a seeded PRNG synthesizes realistic degrading
 * sensor data, Holt's linear method (double exponential smoothing) projects it
 * forward with a confidence cone, and a threshold crossing gives an estimated
 * remaining-useful-life (RUL). No model download / network — it runs in-browser.
 */

/** Deterministic PRNG (mulberry32) so a seed reproduces the same machine. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SensorPreset {
  id: string;
  label: string;
  unit: string;
  /** Healthy baseline reading. */
  baseline: number;
  /** Reading at which the machine is considered failed. */
  threshold: number;
  /** Mean upward drift per day (degradation). */
  trendPerDay: number;
  /** Weekly seasonal amplitude. */
  seasonalAmp: number;
  /** Random noise amplitude. */
  noiseAmp: number;
}

export const SENSOR_PRESETS: SensorPreset[] = [
  {
    id: 'vibration',
    label: 'Bearing Vibration',
    unit: 'mm/s',
    baseline: 2.0,
    threshold: 8.0,
    trendPerDay: 0.08,
    seasonalAmp: 0.25,
    noiseAmp: 0.3,
  },
  {
    id: 'temperature',
    label: 'Motor Temperature',
    unit: '°C',
    baseline: 62,
    threshold: 95,
    trendPerDay: 0.45,
    seasonalAmp: 1.5,
    noiseAmp: 1.2,
  },
  {
    id: 'pressure',
    label: 'Hydraulic Pressure',
    unit: 'bar',
    baseline: 120,
    threshold: 165,
    trendPerDay: 0.6,
    seasonalAmp: 2.0,
    noiseAmp: 1.8,
  },
];

export interface SeriesPoint {
  day: number;
  value: number;
}

/** Synthesize `historyDays` of a degrading sensor: baseline + trend + weekly season + noise. */
export function generateSensorSeries(
  preset: SensorPreset,
  historyDays: number,
  seed: number,
): SeriesPoint[] {
  const rand = mulberry32(seed);
  const points: SeriesPoint[] = [];
  for (let d = 0; d < historyDays; d++) {
    const trend = preset.trendPerDay * d;
    const seasonal = preset.seasonalAmp * Math.sin((2 * Math.PI * d) / 7);
    const noise = preset.noiseAmp * (rand() * 2 - 1);
    const value = preset.baseline + trend + seasonal + noise;
    points.push({ day: d, value: Math.round(value * 100) / 100 });
  }
  return points;
}

export interface ForecastPoint {
  day: number;
  forecast: number;
  lower: number;
  upper: number;
}

export interface ForecastResult {
  forecast: ForecastPoint[];
  /** Std dev of one-step-ahead residuals over the fitted history. */
  residualStd: number;
  level: number;
  trend: number;
}

/**
 * Holt's linear trend (double exponential smoothing).
 * Fits level + trend over history, then projects `horizon` steps ahead with a
 * confidence cone that widens as sqrt(h) * residualStd * z.
 */
export function holtForecast(
  history: number[],
  horizon: number,
  alpha = 0.5,
  beta = 0.3,
  z = 1.96,
): ForecastResult {
  if (history.length < 2) {
    const base = history[0] ?? 0;
    const forecast: ForecastPoint[] = [];
    for (let h = 1; h <= horizon; h++) {
      forecast.push({ day: history.length - 1 + h, forecast: base, lower: base, upper: base });
    }
    return { forecast, residualStd: 0, level: base, trend: 0 };
  }

  let level = history[0];
  let trend = history[1] - history[0];
  const residuals: number[] = [];

  for (let t = 1; t < history.length; t++) {
    const prevLevel = level;
    const prevTrend = trend;
    residuals.push(history[t] - (prevLevel + prevTrend)); // one-step-ahead error
    level = alpha * history[t] + (1 - alpha) * (prevLevel + prevTrend);
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
  }

  const mean = residuals.reduce((s, r) => s + r, 0) / residuals.length;
  const variance =
    residuals.reduce((s, r) => s + (r - mean) ** 2, 0) / Math.max(1, residuals.length - 1);
  const residualStd = Math.sqrt(variance);

  const lastDay = history.length - 1;
  const forecast: ForecastPoint[] = [];
  for (let h = 1; h <= horizon; h++) {
    const f = level + h * trend;
    const width = z * residualStd * Math.sqrt(h);
    forecast.push({
      day: lastDay + h,
      forecast: Math.round(f * 100) / 100,
      lower: Math.round((f - width) * 100) / 100,
      upper: Math.round((f + width) * 100) / 100,
    });
  }
  return { forecast, residualStd: Math.round(residualStd * 1000) / 1000, level, trend };
}

/**
 * Estimated remaining useful life: number of days ahead until the forecast
 * (or, conservatively, its upper confidence bound) first crosses the threshold.
 * Returns null if no crossing within the forecast horizon.
 */
export function estimateRemainingUsefulLife(
  forecast: ForecastPoint[],
  threshold: number,
  band: 'forecast' | 'upper' = 'forecast',
): number | null {
  for (let i = 0; i < forecast.length; i++) {
    const value = band === 'upper' ? forecast[i].upper : forecast[i].forecast;
    if (value >= threshold) return i + 1; // days ahead (h)
  }
  return null;
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

/** Map an RUL estimate to a health status for the headline indicator. */
export function healthStatus(rulDays: number | null): HealthStatus {
  if (rulDays === null) return 'healthy';
  if (rulDays <= 7) return 'critical';
  if (rulDays <= 21) return 'warning';
  return 'healthy';
}
