import { Harmonic, SignalData, Metrics, PhasorData, Phasor } from '../types';

const TWO_PI = 2 * Math.PI;

export function generateSignal(
  harmonics: Harmonic[],
  f0: number,
  mode: 'single' | 'three_phase',
  time: number,
  fundamentalPhases?: { phaseA: number; phaseB: number; phaseC: number }
): SignalData {
  const periods = 3;
  const samplesPerPeriod = 500;
  const totalSamples = periods * samplesPerPeriod;
  const T = 1 / f0;
  const omega0 = TWO_PI * f0;

  const t = Array.from({ length: totalSamples }, (_, i) => (i / samplesPerPeriod) * T);
  const ia = new Array(totalSamples).fill(0);
  const ib = new Array(totalSamples).fill(0);
  const ic = new Array(totalSamples).fill(0);
  const inArray = new Array(totalSamples).fill(0);

  harmonics.forEach(h => {
    if (!h.enabled) return;

    const amplitude = h.amp;
    const phase = h.phase;

    for (let i = 0; i < totalSamples; i++) {
      const angle = h.k * omega0 * (t[i] + time) + phase;

      ia[i] += amplitude * Math.sin(angle);

      if (mode === 'three_phase') {
        // Pour les harmoniques triplens (multiples de 3), pas de déphasage
        // car 3 × 120° = 360° = 0° (les trois phases sont en phase)
        if (h.k % 3 === 0) {
          ib[i] += amplitude * Math.sin(angle);
          ic[i] += amplitude * Math.sin(angle);
        } else {
          // Pour la fondamentale (k=1), utiliser les phases individuelles si fournies
          if (h.k === 1 && fundamentalPhases) {
            ib[i] += amplitude * Math.sin(angle + (fundamentalPhases.phaseB * Math.PI / 180));
            ic[i] += amplitude * Math.sin(angle + (fundamentalPhases.phaseC * Math.PI / 180));
          } else {
            ib[i] += amplitude * Math.sin(angle - (TWO_PI / 3) * h.k);
            ic[i] += amplitude * Math.sin(angle + (TWO_PI / 3) * h.k);
          }
        }
      }
    }
  });

  if (mode === 'three_phase') {
    for (let i = 0; i < totalSamples; i++) {
      inArray[i] = ia[i] + ib[i] + ic[i];
    }
  }

  return {
    t,
    ia,
    ib: mode === 'three_phase' ? ib : [],
    ic: mode === 'three_phase' ? ic : [],
    in: mode === 'three_phase' ? inArray : [],
  };
}

function calculateRMS(signal: number[]): number {
  const sumSquares = signal.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(sumSquares / signal.length);
}

function calculatePeak(signal: number[]): number {
  return Math.max(...signal.map(Math.abs));
}

export function calculateMetrics(
  harmonics: Harmonic[],
  signalData: SignalData,
  mode: 'single' | 'three_phase'
): Metrics {
  const rmsIa = calculateRMS(signalData.ia);
  const rmsIb = mode === 'three_phase' ? calculateRMS(signalData.ib) : 0;
  const rmsIc = mode === 'three_phase' ? calculateRMS(signalData.ic) : 0;
  const rmsIn = mode === 'three_phase' ? calculateRMS(signalData.in) : 0;

  const peakIa = calculatePeak(signalData.ia);
  const peakIb = mode === 'three_phase' ? calculatePeak(signalData.ib) : 0;
  const peakIc = mode === 'three_phase' ? calculatePeak(signalData.ic) : 0;
  const peakIn = mode === 'three_phase' ? calculatePeak(signalData.in) : 0;

  const fundamentalAmp = harmonics.find(h => h.k === 1 && h.enabled)?.amp || 1;

  let sumSquaresHarmonics = 0;
  harmonics.forEach(h => {
    if (h.enabled && h.k > 1) {
      sumSquaresHarmonics += h.amp * h.amp;
    }
  });

  const thdIa = fundamentalAmp > 0 ? (Math.sqrt(sumSquaresHarmonics) / fundamentalAmp) * 100 : 0;
  const thdIb = thdIa;
  const thdIc = thdIa;

  let sumSquaresTriplen = 0;
  harmonics.forEach(h => {
    if (h.enabled && h.k % 3 === 0) {
      sumSquaresTriplen += (3 * h.amp) * (3 * h.amp);
    }
  });

  const thdIn = fundamentalAmp > 0 ? (Math.sqrt(sumSquaresTriplen) / fundamentalAmp) * 100 : 0;

  return {
    thdIa,
    thdIb,
    thdIc,
    thdIn,
    rmsIa,
    rmsIb,
    rmsIc,
    rmsIn,
    peakIa,
    peakIb,
    peakIc,
    peakIn,
  };
}

export function calculatePhasors(
  harmonics: Harmonic[],
  mode: 'fundamental' | 'rank' | 'resultant' | 'sequence_direct' | 'sequence_inverse' | 'sequence_homopolar',
  selectedRank: number,
  time: number,
  f0: number,
  fundamentalPhases?: { phaseA: number; phaseB: number; phaseC: number }
): PhasorData {
  const omega0 = TWO_PI * f0;

  let iaReal = 0, iaImag = 0;
  let ibReal = 0, ibImag = 0;
  let icReal = 0, icImag = 0;

  const filteredHarmonics = harmonics.filter(h => {
    if (!h.enabled) return false;
    if (mode === 'fundamental') return h.k === 1;
    if (mode === 'rank') return h.k === selectedRank;
    if (mode === 'sequence_direct') return h.k % 3 === 1;      // 1, 4, 7, 10...
    if (mode === 'sequence_inverse') return h.k % 3 === 2;     // 2, 5, 8, 11...
    if (mode === 'sequence_homopolar') return h.k % 3 === 0;   // 3, 6, 9, 12...
    return true; // mode === 'resultant'
  });

  filteredHarmonics.forEach(h => {
    const angle = h.k * omega0 * time + h.phase;
    const amplitude = h.amp;

    iaReal += amplitude * Math.cos(angle);
    iaImag += amplitude * Math.sin(angle);

    // Pour les harmoniques triplens (multiples de 3), pas de déphasage
    // car 3 × 120° = 360° = 0° (les trois phases sont en phase)
    if (h.k % 3 === 0) {
      ibReal += amplitude * Math.cos(angle);
      ibImag += amplitude * Math.sin(angle);
      icReal += amplitude * Math.cos(angle);
      icImag += amplitude * Math.sin(angle);
    } else {
      // Pour la fondamentale (k=1), utiliser les phases individuelles si fournies
      if (h.k === 1 && fundamentalPhases) {
        const angleBFund = angle + (fundamentalPhases.phaseB * Math.PI / 180);
        const angleCFund = angle + (fundamentalPhases.phaseC * Math.PI / 180);
        ibReal += amplitude * Math.cos(angleBFund);
        ibImag += amplitude * Math.sin(angleBFund);
        icReal += amplitude * Math.cos(angleCFund);
        icImag += amplitude * Math.sin(angleCFund);
      } else {
        const angleB = angle - (TWO_PI / 3) * h.k;
        ibReal += amplitude * Math.cos(angleB);
        ibImag += amplitude * Math.sin(angleB);

        const angleC = angle + (TWO_PI / 3) * h.k;
        icReal += amplitude * Math.cos(angleC);
        icImag += amplitude * Math.sin(angleC);
      }
    }
  });

  const inReal = iaReal + ibReal + icReal;
  const inImag = iaImag + ibImag + icImag;

  const result: PhasorData = {
    ia: {
      magnitude: Math.sqrt(iaReal * iaReal + iaImag * iaImag),
      angle: Math.atan2(iaImag, iaReal),
    },
    ib: {
      magnitude: Math.sqrt(ibReal * ibReal + ibImag * ibImag),
      angle: Math.atan2(ibImag, ibReal),
    },
    ic: {
      magnitude: Math.sqrt(icReal * icReal + icImag * icImag),
      angle: Math.atan2(icImag, icReal),
    },
    in: {
      magnitude: Math.sqrt(inReal * inReal + inImag * inImag),
      angle: Math.atan2(inImag, inReal),
    },
  };

  // Ajouter les séquences si mode "resultant"
  if (mode === 'resultant') {
    result.sequences = calculateSequences(harmonics, time, f0, fundamentalPhases);
  }

  return result;
}

export function getSequenceType(k: number): 'triplen' | 'positive' | 'negative' | 'none' {
  if (k % 3 === 0) return 'triplen';
  if (k % 6 === 1) return 'positive';
  if (k % 6 === 5) return 'negative';
  return 'none';
}

export function getSequenceTypeNew(k: number): 'direct' | 'inverse' | 'homopolar' {
  if (k % 3 === 0) return 'homopolar';  // 3, 6, 9, 12... (3n)
  if (k % 3 === 1) return 'direct';     // 1, 4, 7, 10... (3n+1)
  return 'inverse';                     // 2, 5, 8, 11... (3n+2)
}

export function calculateSequences(
  harmonics: Harmonic[],
  time: number,
  f0: number,
  fundamentalPhases?: { phaseA: number; phaseB: number; phaseC: number }
): { direct: Phasor; inverse: Phasor; homopolar: Phasor } {
  const omega0 = TWO_PI * f0;
  
  // Séquence directe (3n+1)
  let directReal = 0, directImag = 0;
  // Séquence inverse (3n+2)  
  let inverseReal = 0, inverseImag = 0;
  // Séquence homopolaire (3n)
  let homopolarReal = 0, homopolarImag = 0;

  harmonics.forEach(h => {
    if (!h.enabled) return;
    
    const angle = h.k * omega0 * time + h.phase;
    const amplitude = h.amp;
    
    const seqType = getSequenceTypeNew(h.k);
    
    if (seqType === 'direct') {
      // Séquence directe : rotation normale
      directReal += amplitude * Math.cos(angle);
      directImag += amplitude * Math.sin(angle);
    } else if (seqType === 'inverse') {
      // Séquence inverse : rotation inversée
      inverseReal += amplitude * Math.cos(angle);
      inverseImag += amplitude * Math.sin(angle);
    } else if (seqType === 'homopolar') {
      // Séquence homopolaire : pas de rotation, en phase
      homopolarReal += amplitude * Math.cos(angle);
      homopolarImag += amplitude * Math.sin(angle);
    }
  });

  return {
    direct: {
      magnitude: Math.sqrt(directReal * directReal + directImag * directImag),
      angle: Math.atan2(directImag, directReal),
    },
    inverse: {
      magnitude: Math.sqrt(inverseReal * inverseReal + inverseImag * inverseImag),
      angle: Math.atan2(inverseImag, inverseReal),
    },
    homopolar: {
      magnitude: Math.sqrt(homopolarReal * homopolarReal + homopolarImag * homopolarImag),
      angle: Math.atan2(homopolarImag, homopolarReal),
    },
  };
}

export function shouldShowHarmonic(k: number, filter: string): boolean {
  if (filter === 'all') return true;

  const seqType = getSequenceType(k);

  if (filter === 'triplen') return seqType === 'triplen';
  if (filter === 'positive') return seqType === 'positive';
  if (filter === 'negative') return seqType === 'negative';

  return false;
}
