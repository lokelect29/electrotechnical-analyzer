import { Metrics } from '../types';

interface MetricsCardsProps {
  metrics: Metrics;
  mode: 'single' | 'three_phase';
}

export function MetricsCards({ metrics, mode }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">THD Ia</h4>
        <p className="text-2xl font-bold text-red-400">{metrics.thdIa.toFixed(2)}%</p>
        <p className="text-xs text-gray-500 mt-1">RMS: {metrics.rmsIa.toFixed(1)}A</p>
      </div>

      {mode === 'three_phase' && (
        <>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">THD Ib</h4>
            <p className="text-2xl font-bold text-blue-400">{metrics.thdIb.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">RMS: {metrics.rmsIb.toFixed(1)}A</p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">THD Ic</h4>
            <p className="text-2xl font-bold text-green-400">{metrics.thdIc.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">RMS: {metrics.rmsIc.toFixed(1)}A</p>
          </div>

          <div className="bg-gray-900 border border-orange-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">THD In (Neutral)</h4>
            <p className="text-2xl font-bold text-orange-400">{metrics.thdIn.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">RMS: {metrics.rmsIn.toFixed(1)}A</p>
          </div>
        </>
      )}
    </div>
  );
}
