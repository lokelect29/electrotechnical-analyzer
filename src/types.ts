export interface Harmonic {
  k: number;
  amp: number;
  phase: number;
  enabled: boolean;
}

export interface EngineState {
  f0: number;
  kMax: number;
  harmonics: Harmonic[];
  mode: 'single' | 'three_phase';
  showComponents: boolean;
  sequenceFilter: 'all' | 'triplen' | 'positive' | 'negative';
  phasorMode: 'fundamental' | 'rank' | 'resultant' | 'sequence_direct' | 'sequence_inverse' | 'sequence_homopolar';
  phasorRank: number;
  phasorFrozen: boolean;
  phasorAngle: number;
  playing: boolean;
  animationSpeed: number;
  language: 'fr' | 'ar' | 'en';
  activeTab: 'waveform' | 'pointByPoint';
  fundamentalPhases: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  };
}

export interface SignalData {
  t: number[];
  ia: number[];
  ib: number[];
  ic: number[];
  in: number[];
}

export interface Metrics {
  thdIa: number;
  thdIb: number;
  thdIc: number;
  thdIn: number;
  rmsIa: number;
  rmsIb: number;
  rmsIc: number;
  rmsIn: number;
  peakIa: number;
  peakIb: number;
  peakIc: number;
  peakIn: number;
}

export interface Phasor {
  magnitude: number;
  angle: number;
}

export interface PhasorData {
  ia: Phasor;
  ib: Phasor;
  ic: Phasor;
  in: Phasor;
  sequences?: {
    direct: Phasor;    // Séquence directe (3n+1)
    inverse: Phasor;   // Séquence inverse (3n+2)
    homopolar: Phasor; // Séquence homopolaire (3n)
  };
}

export type Preset = 'pure' | 'square' | 'rectifier6' | 'triplen' | 'custom';
