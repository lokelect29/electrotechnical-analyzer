import { useEffect, useState } from 'react';
import { useEngineStore } from './store/useEngineStore';
import { generateSignal, calculateMetrics, calculatePhasors } from './utils/fourierEngine';
import { ControlsPanel } from './components/ControlsPanelMultilingual';
import { WaveformCanvas } from './components/WaveformCanvas';
import { PointByPointCanvas } from './components/PointByPointCanvas';
import { SpectrumChart } from './components/SpectrumChart';
import { PhasorDiagram } from './components/PhasorDiagram';
import { MetricsCards } from './components/MetricsCards';
import { SignalData, Metrics, PhasorData } from './types';
import { Camera } from 'lucide-react';
import { exportCanvasToPNG } from './utils/exportUtils';
import { getTranslation } from './i18n/translations';

function App() {
  const {
    f0,
    harmonics,
    mode,
    sequenceFilter,
    playing,
    phasorMode,
    phasorRank,
    animationSpeed,
    language,
    activeTab,
    setActiveTab,
    fundamentalPhases,
  } = useEngineStore();

  const t = (key: any) => getTranslation(language, key);

  const [time, setTime] = useState(0);
  const [signalData, setSignalData] = useState<SignalData>({ t: [], ia: [], ib: [], ic: [], in: [] });
  const [metrics, setMetrics] = useState<Metrics>({
    thdIa: 0,
    thdIb: 0,
    thdIc: 0,
    thdIn: 0,
    rmsIa: 0,
    rmsIb: 0,
    rmsIc: 0,
    rmsIn: 0,
    peakIa: 0,
    peakIb: 0,
    peakIc: 0,
    peakIn: 0,
  });
  const [phasorData, setPhasorData] = useState<PhasorData>({
    ia: { magnitude: 0, angle: 0 },
    ib: { magnitude: 0, angle: 0 },
    ic: { magnitude: 0, angle: 0 },
    in: { magnitude: 0, angle: 0 },
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (playing) {
        const delta = timestamp - lastTimestamp;
        if (delta >= 16) {
          setTime((t) => t + (delta / 1000) * animationSpeed);
          lastTimestamp = timestamp;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [playing, animationSpeed]);

  useEffect(() => {
    const signal = generateSignal(harmonics, f0, mode, time, fundamentalPhases);
    setSignalData(signal);

    const metricsData = calculateMetrics(harmonics, signal, mode);
    setMetrics(metricsData);

    if (mode === 'three_phase') {
      const phasors = calculatePhasors(harmonics, phasorMode, phasorRank, time, f0, fundamentalPhases);
      setPhasorData(phasors);
    }
  }, [harmonics, f0, mode, time, phasorMode, phasorRank, fundamentalPhases]);

  const handleExportWaveform = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportCanvasToPNG(canvas, 'waveform.png');
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ControlsPanel />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <button
              onClick={handleExportWaveform}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Camera size={20} />
              {t('exportImage')}
            </button>
          </div>

          <MetricsCards metrics={metrics} mode={mode} />

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('waveform')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'waveform'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t('waveform')}
            </button>
            <button
              onClick={() => setActiveTab('pointByPoint')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'pointByPoint'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t('pointByPoint')}
            </button>
          </div>

          {activeTab === 'waveform' && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t('waveform')}</h2>
              <div className="flex justify-center">
                <WaveformCanvas signalData={signalData} mode={mode} width={900} height={400} language={language} />
              </div>
            </div>
          )}

          {activeTab === 'pointByPoint' && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t('pointByPoint')}</h2>
              <p className="text-gray-400 mb-4 text-sm">
                {language === 'fr'
                  ? 'Déplacez votre souris sur le graphique pour voir la décomposition point par point'
                  : language === 'ar'
                  ? 'حرك الماوس على الرسم البياني لرؤية التحليل نقطة بنقطة'
                  : 'Move your mouse over the graph to see point-by-point decomposition'
                }
              </p>
              <div className="flex justify-center">
                <PointByPointCanvas
                  harmonics={harmonics}
                  f0={f0}
                  time={time}
                  width={900}
                  height={500}
                  language={language}
                />
              </div>
            </div>
          )}

          {mode === 'three_phase' && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('phasorDiagram')} - {phasorMode === 'fundamental' ? t('fundamental') : phasorMode === 'rank' ? `${t('selectedHarmonic')} ${phasorRank}` : t('resultant')}
              </h2>
              <div className="flex justify-center">
                <PhasorDiagram phasorData={phasorData} width={500} height={500} />
              </div>
            </div>
          )}

          <div className="h-96">
            <SpectrumChart harmonics={harmonics} sequenceFilter={sequenceFilter} />
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t('keyConcepts')}</h2>
            <div className="space-y-3 text-gray-300">
              <div>
                <h3 className="font-semibold text-white">{t('triplenConcept')}</h3>
                <p>{t('triplenDescription')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">{t('thdConcept')}</h3>
                <p>{t('thdDescription')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">{t('sequenceConcept')}</h3>
                <p>
                  <span className="text-orange-400">{t('sequenceZero')}</span>: {t('sequenceZeroDesc')}<br/>
                  <span className="text-blue-400">{t('sequencePositive')}</span>: {t('sequencePositiveDesc')}<br/>
                  <span className="text-green-400">{t('sequenceNegative')}</span>: {t('sequenceNegativeDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
