import { create } from 'zustand';
import { EngineState, Harmonic, Preset } from '../types';

const createDefaultHarmonics = (kMax: number): Harmonic[] => {
  const harmonics: Harmonic[] = [];
  for (let k = 1; k <= kMax; k++) {
    harmonics.push({
      k,
      amp: k === 1 ? 100 : 0,
      phase: 0,
      enabled: k === 1,
    });
  }
  return harmonics;
};

interface EngineStore extends EngineState {
  setF0: (f0: number) => void;
  setKMax: (kMax: number) => void;
  updateHarmonic: (k: number, updates: Partial<Harmonic>) => void;
  setMode: (mode: 'single' | 'three_phase') => void;
  setShowComponents: (show: boolean) => void;
  setSequenceFilter: (filter: 'all' | 'triplen' | 'positive' | 'negative') => void;
  setPhasorMode: (mode: 'fundamental' | 'rank' | 'resultant' | 'sequence_direct' | 'sequence_inverse' | 'sequence_homopolar') => void;
  setPhasorRank: (rank: number) => void;
  setPhasorFrozen: (frozen: boolean) => void;
  setPhasorAngle: (angle: number) => void;
  setPlaying: (playing: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setLanguage: (language: 'fr' | 'ar' | 'en') => void;
  setActiveTab: (tab: 'waveform' | 'pointByPoint') => void;
  setFundamentalPhase: (phase: 'phaseA' | 'phaseB' | 'phaseC', value: number) => void;
  loadPreset: (preset: Preset) => void;
  exportConfig: () => string;
  importConfig: (json: string) => void;
}

export const useEngineStore = create<EngineStore>((set, get) => ({
  f0: 50,
  kMax: 25,
  harmonics: createDefaultHarmonics(25),
  mode: 'three_phase',
  showComponents: false,
  sequenceFilter: 'all',
  phasorMode: 'fundamental',
  phasorRank: 1,
  phasorFrozen: false,
  phasorAngle: 0,
  playing: true,
  animationSpeed: 1,
  language: 'fr',
  activeTab: 'waveform',
  fundamentalPhases: {
    phaseA: 0,
    phaseB: -120,
    phaseC: 120,
  },

  setF0: (f0) => set({ f0 }),

  setKMax: (kMax) => {
    const currentHarmonics = get().harmonics;
    const newHarmonics = createDefaultHarmonics(kMax);

    newHarmonics.forEach((h, idx) => {
      if (currentHarmonics[idx]) {
        h.amp = currentHarmonics[idx].amp;
        h.phase = currentHarmonics[idx].phase;
        h.enabled = currentHarmonics[idx].enabled;
      }
    });

    set({ kMax, harmonics: newHarmonics });
  },

  updateHarmonic: (k, updates) => {
    const harmonics = get().harmonics;
    const idx = harmonics.findIndex(h => h.k === k);
    if (idx !== -1) {
      harmonics[idx] = { ...harmonics[idx], ...updates };
      set({ harmonics: [...harmonics] });
    }
  },

  setMode: (mode) => set({ mode }),
  setShowComponents: (show) => set({ showComponents: show }),
  setSequenceFilter: (filter) => set({ sequenceFilter: filter }),
  setPhasorMode: (mode) => set({ phasorMode: mode }),
  setPhasorRank: (rank) => set({ phasorRank: rank }),
  setPhasorFrozen: (frozen) => set({ phasorFrozen: frozen }),
  setPhasorAngle: (angle) => set({ phasorAngle: angle }),
  setPlaying: (playing) => set({ playing }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setLanguage: (language) => set({ language }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFundamentalPhase: (phase, value) => {
    const fundamentalPhases = { ...get().fundamentalPhases };
    fundamentalPhases[phase] = value;
    set({ fundamentalPhases });
  },

  loadPreset: (preset) => {
    const harmonics = [...get().harmonics];

    harmonics.forEach(h => {
      h.enabled = false;
      h.amp = 0;
      h.phase = 0;
    });

    switch (preset) {
      case 'pure':
        harmonics[0].enabled = true;
        harmonics[0].amp = 100;
        harmonics[0].phase = 0;
        break;

      case 'square':
        harmonics.forEach(h => {
          if (h.k % 2 === 1) {
            h.enabled = true;
            h.amp = 100 / h.k;
            h.phase = 0;
          }
        });
        break;

      case 'rectifier6':
        [1, 5, 7, 11, 13, 17, 19, 23].forEach(k => {
          const idx = harmonics.findIndex(h => h.k === k);
          if (idx !== -1) {
            harmonics[idx].enabled = true;
            harmonics[idx].amp = 100 / k;
            harmonics[idx].phase = 0;
          }
        });
        break;

      case 'triplen':
        harmonics[0].enabled = true;
        harmonics[0].amp = 100;
        harmonics[0].phase = 0;

        const idx3 = harmonics.findIndex(h => h.k === 3);
        if (idx3 !== -1) {
          harmonics[idx3].enabled = true;
          harmonics[idx3].amp = 60;
          harmonics[idx3].phase = 0;
        }

        const idx9 = harmonics.findIndex(h => h.k === 9);
        if (idx9 !== -1) {
          harmonics[idx9].enabled = true;
          harmonics[idx9].amp = 20;
          harmonics[idx9].phase = 0;
        }
        break;
    }

    set({ harmonics: [...harmonics] });
  },

  exportConfig: () => {
    const state = get();
    return JSON.stringify({
      f0: state.f0,
      kMax: state.kMax,
      harmonics: state.harmonics,
      mode: state.mode,
    }, null, 2);
  },

  importConfig: (json) => {
    try {
      const config = JSON.parse(json);
      set({
        f0: config.f0,
        kMax: config.kMax,
        harmonics: config.harmonics,
        mode: config.mode,
      });
    } catch (e) {
      console.error('Failed to import config', e);
    }
  },
}));
