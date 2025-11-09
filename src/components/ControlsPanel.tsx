import { useEngineStore } from '../store/useEngineStore';
import { getSequenceType } from '../utils/fourierEngine';
import { Play, Pause, Download, Upload } from 'lucide-react';

export function ControlsPanel() {
  const {
    f0,
    kMax,
    harmonics,
    mode,
    sequenceFilter,
    playing,
    phasorMode,
    phasorRank,
    setF0,
    setKMax,
    updateHarmonic,
    setMode,
    setSequenceFilter,
    setPlaying,
    setPhasorMode,
    setPhasorRank,
    loadPreset,
    exportConfig,
    importConfig,
  } = useEngineStore();

  const handleExport = () => {
    const config = exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fourier-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          importConfig(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 overflow-y-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Fourier Analysis</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Frequency (Hz)
          </label>
          <input
            type="number"
            value={f0}
            onChange={(e) => setF0(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Harmonic Order
          </label>
          <input
            type="number"
            value={kMax}
            onChange={(e) => setKMax(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="49"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'single' | 'three_phase')}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single Phase</option>
            <option value="three_phase">Three Phase + Neutral</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sequence Filter
          </label>
          <select
            value={sequenceFilter}
            onChange={(e) => setSequenceFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Harmonics</option>
            <option value="triplen">Triplen Only (0)</option>
            <option value="positive">Positive (+)</option>
            <option value="negative">Negative (−)</option>
          </select>
        </div>

        {mode === 'three_phase' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phasor View
            </label>
            <select
              value={phasorMode}
              onChange={(e) => setPhasorMode(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fundamental">Fundamental Only</option>
              <option value="rank">Selected Harmonic</option>
              <option value="resultant">Resultant (All)</option>
            </select>
            {phasorMode === 'rank' && (
              <input
                type="number"
                value={phasorRank}
                onChange={(e) => setPhasorRank(Number(e.target.value))}
                className="w-full px-3 py-2 mt-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={kMax}
                placeholder="Harmonic rank"
              />
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Presets</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => loadPreset('square')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Square Wave
          </button>
          <button
            onClick={() => loadPreset('rectifier6')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            6-Pulse Rectifier
          </button>
          <button
            onClick={() => loadPreset('triplen')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            Triplen Dominant
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Harmonics</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {harmonics.map((h) => {
            const seqType = getSequenceType(h.k);
            const seqColor = seqType === 'triplen' ? 'border-orange-500' : seqType === 'positive' ? 'border-blue-500' : seqType === 'negative' ? 'border-green-500' : 'border-gray-600';

            return (
              <div key={h.k} className={`p-3 bg-gray-800 rounded-lg border-2 ${h.enabled ? seqColor : 'border-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHarmonic(h.k, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white font-medium">H{h.k}</span>
                    {seqType === 'triplen' && (
                      <span className="text-xs px-2 py-1 bg-orange-900 text-orange-200 rounded">TRIPLEN</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-400">Amplitude: {h.amp.toFixed(1)}A</label>
                    <input
                      type="range"
                      value={h.amp}
                      onChange={(e) => updateHarmonic(h.k, { amp: Number(e.target.value) })}
                      min="0"
                      max="200"
                      step="1"
                      disabled={!h.enabled}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400">Phase: {(h.phase * 180 / Math.PI).toFixed(0)}°</label>
                    <input
                      type="range"
                      value={h.phase}
                      onChange={(e) => updateHarmonic(h.k, { phase: Number(e.target.value) })}
                      min={-Math.PI}
                      max={Math.PI}
                      step="0.01"
                      disabled={!h.enabled}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-700">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
          {playing ? 'Pause' : 'Play'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Upload size={20} />
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
