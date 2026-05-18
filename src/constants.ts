import { SpiroPattern, type PatternData } from './types';

export const DATASETS: Record<SpiroPattern, PatternData> = {
  [SpiroPattern.NORMAL]: {
    theme: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    metrics: {
      fev1: '4.00 L',
      fvc: '5.00 L',
      ratio: '80 %',
      pef: '8.2 L/s',
      notes: 'Morfología conservada. Flujo máximo rápido, descenso lineal. Relación FEV1/FVC normal (>70%).',
    },
    staticVols: { vri: '3.0 L', vt: '0.5 L', vre: '1.2 L', vr: '1.2 L' },
    staticCaps: { tlc: '5.9 L', vc: '4.7 L', frc: '2.4 L', ic: '3.5 L' },
    fv: [
      { x: 0, y: 0 }, { x: 0.1, y: 3 }, { x: 0.3, y: 7.5 }, { x: 0.6, y: 8.2 },
      { x: 1.5, y: 6.0 }, { x: 2.5, y: 4.0 }, { x: 3.5, y: 2.0 }, { x: 4.5, y: 0.5 }, { x: 5.0, y: 0 },
      { x: 4.5, y: -2 }, { x: 3.0, y: -4 }, { x: 1.5, y: -3.5 }, { x: 0.5, y: -1.5 }, { x: 0, y: 0 }
    ],
    vt: [
      { x: 0, y: 0 }, { x: 0.2, y: 1.2 }, { x: 0.5, y: 2.8 }, { x: 1.0, y: 4.0 },
      { x: 2.0, y: 4.7 }, { x: 3.0, y: 4.9 }, { x: 4.0, y: 4.95 }, { x: 5.0, y: 5.0 }, { x: 6.0, y: 5.0 }
    ],
    spiro: [
      { x: 0, y: 2.4 }, { x: 1, y: 2.9 }, { x: 2, y: 2.4 }, { x: 3, y: 2.9 }, { x: 4, y: 2.4 },
      { x: 5.5, y: 5.9 }, { x: 8.0, y: 1.2 }, { x: 9.5, y: 2.4 }, { x: 10.5, y: 2.9 }, { x: 11.5, y: 2.4 }
    ],
    lines: { tlc: 5.9, rv: 1.2 }
  },
  [SpiroPattern.OBSTRUCTIVE]: {
    theme: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
    metrics: {
      fev1: '1.80 L',
      fvc: '4.20 L',
      ratio: '42 %',
      pef: '4.5 L/s',
      notes: '<strong class="text-rose-400">Patrón Obstructivo:</strong> Atrapamiento de aire evidente en pestaña de volúmenes (VR elevado).',
    },
    staticVols: { vri: '1.9 L', vt: '0.6 L', vre: '1.0 L', vr: '3.5 L' },
    staticCaps: { tlc: '7.0 L', vc: '3.5 L', frc: '4.5 L', ic: '2.5 L' },
    fv: [
      { x: 0, y: 0 }, { x: 0.1, y: 2.0 }, { x: 0.4, y: 4.5 },
      { x: 0.8, y: 2.5 }, { x: 1.5, y: 1.2 }, { x: 2.5, y: 0.6 }, { x: 3.5, y: 0.2 }, { x: 4.2, y: 0 },
      { x: 3.5, y: -1.5 }, { x: 2.0, y: -2.5 }, { x: 0.8, y: -1.5 }, { x: 0, y: 0 }
    ],
    vt: [
      { x: 0, y: 0 }, { x: 0.5, y: 1.1 }, { x: 1.0, y: 1.8 },
      { x: 2.0, y: 2.7 }, { x: 3.0, y: 3.3 }, { x: 4.0, y: 3.8 }, { x: 5.0, y: 4.0 }, { x: 6.0, y: 4.2 }
    ],
    spiro: [
      { x: 0, y: 4.5 }, { x: 1, y: 5.1 }, { x: 2, y: 4.5 }, { x: 3, y: 5.1 }, { x: 4, y: 4.5 },
      { x: 5.5, y: 7.0 }, { x: 8.5, y: 3.5 }, { x: 10, y: 4.5 }, { x: 11, y: 5.1 }, { x: 12, y: 4.5 }
    ],
    lines: { tlc: 7.0, rv: 3.5 }
  },
  [SpiroPattern.RESTRICTIVE]: {
    theme: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
    metrics: {
      fev1: '2.50 L',
      fvc: '2.80 L',
      ratio: '89 %',
      pef: '5.5 L/s',
      notes: '<strong class="text-indigo-400">Patrón Restrictivo:</strong> Curva "en miniatura". Reducción proporcional de CPT, CV y VR indicativo de pulmón rígido o pequeño.',
    },
    staticVols: { vri: '1.8 L', vt: '0.3 L', vre: '0.6 L', vr: '0.8 L' },
    staticCaps: { tlc: '3.5 L', vc: '2.7 L', frc: '1.4 L', ic: '2.1 L' },
    fv: [
      { x: 0, y: 0 }, { x: 0.1, y: 3.0 }, { x: 0.3, y: 5.5 },
      { x: 0.8, y: 4.0 }, { x: 1.5, y: 2.0 }, { x: 2.2, y: 0.5 }, { x: 2.8, y: 0 },
      { x: 2.2, y: -2 }, { x: 1.4, y: -3 }, { x: 0.6, y: -1.5 }, { x: 0, y: 0 }
    ],
    vt: [
      { x: 0, y: 0 }, { x: 0.3, y: 1.8 }, { x: 0.6, y: 2.3 }, { x: 1.0, y: 2.5 },
      { x: 2.0, y: 2.7 }, { x: 3.0, y: 2.8 }, { x: 4.0, y: 2.8 }, { x: 5.0, y: 2.8 }, { x: 6.0, y: 2.8 }
    ],
    spiro: [
      { x: 0, y: 1.4 }, { x: 1, y: 1.7 }, { x: 2, y: 1.4 }, { x: 3, y: 1.7 }, { x: 4, y: 1.4 },
      { x: 5.5, y: 3.5 }, { x: 7.5, y: 0.8 }, { x: 9, y: 1.4 }, { x: 10, y: 1.7 }, { x: 11, y: 1.4 }
    ],
    lines: { tlc: 3.5, rv: 0.8 }
  }
};
