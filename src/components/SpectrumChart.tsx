import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Harmonic } from '../types';
import { getSequenceType, shouldShowHarmonic } from '../utils/fourierEngine';

interface SpectrumChartProps {
  harmonics: Harmonic[];
  sequenceFilter: string;
}

const COLORS = {
  triplen: '#f59e0b',
  positive: '#3b82f6',
  negative: '#22c55e',
  other: '#6b7280',
};

export function SpectrumChart({ harmonics, sequenceFilter }: SpectrumChartProps) {
  const data = useMemo(() => {
    return harmonics
      .filter(h => h.enabled && shouldShowHarmonic(h.k, sequenceFilter))
      .map(h => ({
        k: h.k,
        amplitude: h.amp,
        sequence: getSequenceType(h.k),
      }));
  }, [harmonics, sequenceFilter]);

  const getBarColor = (sequence: string) => {
    switch (sequence) {
      case 'triplen': return COLORS.triplen;
      case 'positive': return COLORS.positive;
      case 'negative': return COLORS.negative;
      default: return COLORS.other;
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg p-4 border border-gray-700">
      <h3 className="text-white text-lg font-semibold mb-4">Harmonic Spectrum</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="k"
            label={{ value: 'Harmonic Order (k)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis
            label={{ value: 'Amplitude (A)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
            formatter={(value: number, name: string, props: any) => [
              `${value.toFixed(2)} A`,
              `H${props.payload.k} (${props.payload.sequence})`
            ]}
          />
          <Bar dataKey="amplitude" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.sequence)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.triplen }}></div>
          <span className="text-sm text-gray-300">Triplen (0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.positive }}></div>
          <span className="text-sm text-gray-300">Positive (+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.negative }}></div>
          <span className="text-sm text-gray-300">Negative (−)</span>
        </div>
      </div>
    </div>
  );
}
