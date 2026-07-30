import {
  mulberry32,
  generateSensorSeries,
  holtForecast,
  estimateRemainingUsefulLife,
  healthStatus,
  SENSOR_PRESETS,
  type SensorPreset,
} from '@/lib/forecasting';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('returns values in [0, 1)', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('generateSensorSeries', () => {
  const preset = SENSOR_PRESETS[0]; // vibration

  it('returns the requested number of points with incrementing days', () => {
    const series = generateSensorSeries(preset, 30, 1);
    expect(series).toHaveLength(30);
    expect(series[0].day).toBe(0);
    expect(series[29].day).toBe(29);
  });

  it('is deterministic for a given seed and varies by seed', () => {
    expect(generateSensorSeries(preset, 10, 5)).toEqual(generateSensorSeries(preset, 10, 5));
    expect(generateSensorSeries(preset, 10, 5)).not.toEqual(generateSensorSeries(preset, 10, 6));
  });

  it('trends upward over time (degradation)', () => {
    const series = generateSensorSeries(preset, 60, 1);
    const firstTen = series.slice(0, 10).reduce((s, p) => s + p.value, 0) / 10;
    const lastTen = series.slice(-10).reduce((s, p) => s + p.value, 0) / 10;
    expect(lastTen).toBeGreaterThan(firstTen);
  });

  it('starts near the preset baseline', () => {
    const series = generateSensorSeries(preset, 60, 1);
    // Day 0: baseline + 0 trend + 0 seasonal + bounded noise.
    expect(Math.abs(series[0].value - preset.baseline)).toBeLessThanOrEqual(preset.noiseAmp + 0.01);
  });
});

describe('holtForecast', () => {
  it('returns `horizon` forecast points with continuing day numbers', () => {
    const history = Array.from({ length: 20 }, (_, i) => i); // 0..19
    const { forecast } = holtForecast(history, 10);
    expect(forecast).toHaveLength(10);
    expect(forecast[0].day).toBe(20);
    expect(forecast[9].day).toBe(29);
  });

  it('projects a rising trend upward', () => {
    const history = Array.from({ length: 20 }, (_, i) => i); // steadily increasing
    const { forecast } = holtForecast(history, 5);
    expect(forecast[4].forecast).toBeGreaterThan(forecast[0].forecast);
    expect(forecast[0].forecast).toBeGreaterThan(history[history.length - 1]);
  });

  it('widens the confidence interval further into the future', () => {
    // Noisy series so residualStd > 0 and the cone actually widens.
    const history = Array.from({ length: 20 }, (_, i) => i + (i % 2 === 0 ? 1 : -1));
    const { forecast } = holtForecast(history, 10);
    const widthAt = (i: number) => forecast[i].upper - forecast[i].lower;
    expect(widthAt(9)).toBeGreaterThan(widthAt(0));
  });

  it('handles a history shorter than two points', () => {
    expect(holtForecast([5], 3).forecast).toHaveLength(3);
    expect(holtForecast([5], 3).forecast.every((f) => f.forecast === 5)).toBe(true);
  });
});

describe('estimateRemainingUsefulLife', () => {
  const forecast = [
    { day: 10, forecast: 5, lower: 4, upper: 6 },
    { day: 11, forecast: 7, lower: 5, upper: 9 },
    { day: 12, forecast: 9, lower: 6, upper: 12 },
  ];

  it('returns the days-ahead of the first threshold crossing (forecast band)', () => {
    expect(estimateRemainingUsefulLife(forecast, 8, 'forecast')).toBe(3); // day 12 (9 >= 8)
  });

  it('crosses earlier on the conservative upper band', () => {
    expect(estimateRemainingUsefulLife(forecast, 8, 'upper')).toBe(2); // day 11 (upper 9 >= 8)
  });

  it('returns null when the threshold is never reached', () => {
    expect(estimateRemainingUsefulLife(forecast, 100)).toBeNull();
  });
});

describe('healthStatus', () => {
  it('is healthy when no failure is predicted', () => {
    expect(healthStatus(null)).toBe('healthy');
  });
  it('is critical within a week', () => {
    expect(healthStatus(7)).toBe('critical');
    expect(healthStatus(1)).toBe('critical');
  });
  it('is a warning within three weeks', () => {
    expect(healthStatus(8)).toBe('warning');
    expect(healthStatus(21)).toBe('warning');
  });
  it('is healthy beyond three weeks', () => {
    expect(healthStatus(22)).toBe('healthy');
  });
});

describe('SENSOR_PRESETS', () => {
  it('each preset degrades toward a threshold above its baseline', () => {
    SENSOR_PRESETS.forEach((p: SensorPreset) => {
      expect(p.threshold).toBeGreaterThan(p.baseline);
      expect(p.trendPerDay).toBeGreaterThan(0);
    });
  });
});
