'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card, Badge } from '@/components/ui';
import {
  SENSOR_PRESETS,
  generateSensorSeries,
  holtForecast,
  estimateRemainingUsefulLife,
  healthStatus,
} from '@/lib/forecasting';

const HISTORY_DAYS = 60;

interface TooltipProps {
  active?: boolean;
  label?: number;
  unit: string;
  payload?: Array<{ dataKey: string; value: number | number[]; color: string }>;
}

const ForecastTooltip = ({ active, label, payload, unit }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const actual = payload.find((p) => p.dataKey === 'actual')?.value as number | undefined;
  const forecast = payload.find((p) => p.dataKey === 'forecast')?.value as number | undefined;
  const range = payload.find((p) => p.dataKey === 'range')?.value as number[] | undefined;
  return (
    <div className="bg-surface border border-subtle rounded-lg p-3 shadow-xl text-sm">
      <p className="text-foreground font-semibold mb-1">Day {label}</p>
      {actual !== undefined && (
        <p className="text-accent">Observed: {actual}{unit}</p>
      )}
      {forecast !== undefined && (
        <p className="text-accent">Forecast: {forecast}{unit}</p>
      )}
      {range && (
        <p className="text-muted text-xs">95% CI: {range[0]}–{range[1]}{unit}</p>
      )}
    </div>
  );
};

const STATUS_META = {
  healthy: { label: 'Healthy', emoji: '✅', badge: 'success' as const, ring: 'border-green-500/40' },
  warning: { label: 'Maintenance soon', emoji: '⚠️', badge: 'warning' as const, ring: 'border-yellow-500/40' },
  critical: { label: 'Maintenance required', emoji: '🔴', badge: 'error' as const, ring: 'border-red-500/40' },
};

export default function PredictiveMaintenance() {
  const [presetId, setPresetId] = useState(SENSOR_PRESETS[0].id);
  const [horizon, setHorizon] = useState(21);
  const [seed, setSeed] = useState(1);

  const preset = SENSOR_PRESETS.find((p) => p.id === presetId) ?? SENSOR_PRESETS[0];

  const { chartData, rul, status } = useMemo(() => {
    const history = generateSensorSeries(preset, HISTORY_DAYS, seed);
    const values = history.map((p) => p.value);
    const fc = holtForecast(values, horizon);
    const rulDays = estimateRemainingUsefulLife(fc.forecast, preset.threshold, 'forecast');

    const lastDay = history[history.length - 1].day;
    const lastVal = history[history.length - 1].value;

    const data: Array<Record<string, number | number[]>> = history.map((p) => ({
      day: p.day,
      actual: p.value,
    }));
    // Anchor the forecast at the last observed point so the dashed line connects.
    data[data.length - 1] = { day: lastDay, actual: lastVal, forecast: lastVal, range: [lastVal, lastVal] };
    for (const f of fc.forecast) {
      data.push({ day: f.day, forecast: f.forecast, range: [f.lower, f.upper] });
    }

    return { chartData: data, rul: rulDays, status: healthStatus(rulDays) };
  }, [preset, horizon, seed]);

  const meta = STATUS_META[status];

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Predictive Maintenance Forecasting</h2>
        <p className="text-muted max-w-3xl">
          Time-series forecasting (Holt&apos;s double exponential smoothing) projects live sensor
          degradation to predict equipment failure before it happens — the approach behind an
          83% downtime reduction at Amazon Robotics and $2M in energy savings at Evonik.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end mb-6">
        <div>
          <span className="block text-sm text-muted mb-2">Sensor</span>
          <div className="flex flex-wrap gap-2">
            {SENSOR_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                aria-pressed={p.id === presetId}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  p.id === presetId
                    ? 'bg-purple-600 text-white'
                    : 'bg-track text-body hover:bg-slate-300 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[200px]">
          <label htmlFor="horizon" className="block text-sm text-muted mb-2">
            Forecast horizon: <span className="text-foreground font-medium">{horizon} days</span>
          </label>
          <input
            id="horizon"
            type="range"
            min={7}
            max={30}
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="w-full h-2 bg-track rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        <button
          onClick={() => setSeed((s) => s + 1)}
          className="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-purple-600 text-accent hover:bg-purple-600 hover:text-white transition-colors"
        >
          Simulate new machine
        </button>
      </div>

      {/* Remaining-useful-life status */}
      <div className={`rounded-lg border ${meta.ring} bg-surface p-4 mb-6`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-muted">Estimated time to maintenance</div>
            <div className="text-3xl font-bold text-foreground">
              {rul === null ? `> ${horizon} days` : `~${rul} days`}
            </div>
          </div>
          <Badge variant={meta.badge} size="lg">
            {meta.emoji} {meta.label}
          </Badge>
        </div>
        <p className="text-sm text-muted mt-2">
          {rul === null
            ? `${preset.label} stays below its ${preset.threshold}${preset.unit} failure threshold across the ${horizon}-day forecast.`
            : `${preset.label} is projected to reach its ${preset.threshold}${preset.unit} failure threshold in ~${rul} days — schedule maintenance to avoid unplanned downtime.`}
        </p>
      </div>

      {/* Forecast chart */}
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
          <XAxis
            dataKey="day"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            label={{ value: 'Day', position: 'insideBottom', offset: -4, fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            domain={['auto', 'auto']}
            width={56}
            unit={preset.unit}
          />
          <Tooltip content={<ForecastTooltip unit={preset.unit} />} />
          <ReferenceLine
            y={preset.threshold}
            stroke="#ef4444"
            strokeDasharray="6 4"
            label={{
              value: `Failure threshold`,
              fill: '#ef4444',
              fontSize: 11,
              position: 'insideTopRight',
            }}
          />
          <Area dataKey="range" fill="#a855f7" fillOpacity={0.12} stroke="none" name="95% CI" />
          <Line dataKey="actual" stroke="#a855f7" strokeWidth={2} dot={false} name="Observed" connectNulls={false} />
          <Line
            dataKey="forecast"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Forecast"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="primary">Holt&apos;s Linear Trend</Badge>
        <Badge variant="primary">Double Exponential Smoothing</Badge>
        <Badge variant="primary">95% Confidence Interval</Badge>
        <Badge variant="primary">Remaining Useful Life</Badge>
      </div>
    </Card>
  );
}
