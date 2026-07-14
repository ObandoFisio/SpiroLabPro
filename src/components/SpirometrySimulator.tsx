import React, { useState, useMemo, useEffect } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Beaker, 
  FileText, 
  Info, 
  Wind, 
  Youtube, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  User, 
  Award, 
  ShieldAlert, 
  Heart,
  RefreshCw
} from 'lucide-react';
import { SpiroPattern, type DataPoint } from '../types';
import { DATASETS } from '../constants';
import { cn } from '../lib/utils';

type Tab = 'dinamica' | 'prueba' | 'estatica' | 'espirometria_estatica';

interface ClinicalCase {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  anamnesis: string;
  secretPattern: SpiroPattern;
  theoreticalFvc: number;
  theoreticalFev1: number;
  measuredFvc: number;
  measuredFev1: number;
  measuredRatio: number;
  measuredPef: number;
  goldStage: string;
}

const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case1',
    name: 'Don Carlos (Fumador de 58 años)',
    age: 58,
    gender: 'M',
    anamnesis: 'Paciente de 58 años con antecedente de tabaquismo pesado (35 paquetes/año). Reporta disnea de esfuerzo progresiva grado mMRC 2 y tos productiva matutina habitual de largo tiempo de evolución.',
    secretPattern: SpiroPattern.OBSTRUCTIVE,
    theoreticalFvc: 4.80,
    theoreticalFev1: 3.80,
    measuredFvc: 4.20,
    measuredFev1: 1.80,
    measuredRatio: 42,
    measuredPef: 4.5,
    goldStage: 'EPOC Moderado-Grave (Patrón Obstructivo con atrapamiento de aire)',
  },
  {
    id: 'case2',
    name: 'Sofía (Atleta de 24 años)',
    age: 24,
    gender: 'F',
    anamnesis: 'Paciente femenina de 24 años, corredora de maratón universitaria. Acude a evaluación cardiorrespiratoria de rutina. Niega disnea, tos o sibilancias.',
    secretPattern: SpiroPattern.NORMAL,
    theoreticalFvc: 5.00,
    theoreticalFev1: 4.00,
    measuredFvc: 5.00,
    measuredFev1: 4.00,
    measuredRatio: 80,
    measuredPef: 8.2,
    goldStage: 'Función Pulmonar Normal (Excelente condición aeróbica)',
  },
  {
    id: 'case3',
    name: 'Elena (Fibrosis de 45 años)',
    age: 45,
    gender: 'F',
    anamnesis: 'Paciente femenina de 45 años diagnosticada con Sarcoidosis pulmonar. Refiere tos seca persistente y opresión torácica con limitación marcada al ejercicio.',
    secretPattern: SpiroPattern.RESTRICTIVE,
    theoreticalFvc: 4.50,
    theoreticalFev1: 3.60,
    measuredFvc: 2.80,
    measuredFev1: 2.50,
    measuredRatio: 89,
    measuredPef: 5.5,
    goldStage: 'Restricción del Parénquima Pulmonar (Pulmón rígido con distensibilidad disminuida)',
  }
];

// Helper to interpolate points
const interpolate = (points: DataPoint[], xVal: number): number => {
  if (!points || points.length === 0) return 0;
  if (xVal <= points[0].x) return points[0].y;
  if (xVal >= points[points.length - 1].x) return points[points.length - 1].y;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (xVal >= p1.x && xVal <= p2.x) {
      const ratio = (xVal - p1.x) / (p2.x - p1.x);
      return p1.y + ratio * (p2.y - p1.y);
    }
  }
  return 0;
};

// Helper to calculate Knudson/ECCS equations for theoretical (predicted) adult values
const calculateTheoreticalFvc = (gender: 'M' | 'F', age: number, height: number): number => {
  if (gender === 'M') {
    return Math.max(1.0, parseFloat((0.0576 * height - 0.026 * age - 4.34).toFixed(2)));
  } else {
    return Math.max(1.0, parseFloat((0.0443 * height - 0.026 * age - 2.89).toFixed(2)));
  }
};

const calculateTheoreticalFev1 = (gender: 'M' | 'F', age: number, height: number): number => {
  if (gender === 'M') {
    return Math.max(0.8, parseFloat((0.043 * height - 0.029 * age - 2.49).toFixed(2)));
  } else {
    return Math.max(0.8, parseFloat((0.0395 * height - 0.025 * age - 2.6).toFixed(2)));
  }
};

const getRandomPatientData = (targetPattern: SpiroPattern) => {
  const maleNames = [
    'Carlos Ruiz', 'Juan Pérez', 'Alejandro Gómez', 'Miguel Ángel', 'Javier Fernández', 
    'Luis Martínez', 'Andrés Castro', 'Roberto Díaz', 'Héctor Jiménez', 'José Mendoza', 
    'Francisco Silva', 'Pedro Morales', 'Santiago Ortega', 'Diego Herrera', 'Manuel Salazar'
  ];
  const femaleNames = [
    'María González', 'Laura Rodríguez', 'Ana Belén', 'Sofía Herrera', 'Beatriz Flores', 
    'Elena Romero', 'Camila Vargas', 'Valentina Ortiz', 'Patricia Méndez', 'Isabel Delgado', 
    'Gabriela Solís', 'Lucía Torres', 'Carolina Peña', 'Daniela Medina', 'Rosa Espejo'
  ];
  
  const gender: 'M' | 'F' = Math.random() < 0.5 ? 'M' : 'F';
  const name = gender === 'M' 
    ? maleNames[Math.floor(Math.random() * maleNames.length)] 
    : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    
  let age = 45;
  let height = 170;
  let weight = 70;
  
  if (targetPattern === SpiroPattern.NORMAL) {
    age = Math.floor(20 + Math.random() * 35); // 20 - 54
    height = gender === 'M' ? Math.floor(168 + Math.random() * 16) : Math.floor(154 + Math.random() * 18);
    weight = gender === 'M' ? Math.floor(65 + Math.random() * 24) : Math.floor(50 + Math.random() * 24);
  } else if (targetPattern === SpiroPattern.OBSTRUCTIVE) {
    age = Math.floor(55 + Math.random() * 28); // 55 - 82 (EPOC/COPD is typically in older adults)
    height = gender === 'M' ? Math.floor(164 + Math.random() * 16) : Math.floor(152 + Math.random() * 16);
    weight = gender === 'M' ? Math.floor(58 + Math.random() * 32) : Math.floor(46 + Math.random() * 30);
  } else if (targetPattern === SpiroPattern.RESTRICTIVE) {
    age = Math.floor(45 + Math.random() * 34); // 45 - 78
    height = gender === 'M' ? Math.floor(165 + Math.random() * 15) : Math.floor(150 + Math.random() * 18);
    weight = gender === 'M' ? Math.floor(55 + Math.random() * 25) : Math.floor(45 + Math.random() * 23);
  }
  
  return { name, age, gender, height, weight };
};

const getCustomCaseValues = (
  name: string,
  age: number,
  gender: 'M' | 'F',
  height: number,
  weight: number,
  pattern: SpiroPattern,
  seed: number
) => {
  const theoreticalFvc = calculateTheoreticalFvc(gender, age, height);
  const theoreticalFev1 = calculateTheoreticalFev1(gender, age, height);
  
  // Deterministic factors based on seed (0 to 1)
  const fvcFactor = 0.82 + (seed * 0.12); // 0.82 to 0.94 of predicted
  
  let measuredFvc = theoreticalFvc;
  let measuredFev1 = theoreticalFev1;
  let measuredRatio = 80;
  let measuredPef = 8.0;
  let goldStage = '';

  if (pattern === SpiroPattern.NORMAL) {
    measuredFvc = parseFloat((theoreticalFvc * fvcFactor).toFixed(2));
    measuredRatio = Math.round(74 + (seed * 10)); // 74% to 84%
    measuredFev1 = parseFloat(((measuredFvc * measuredRatio) / 100).toFixed(2));
    measuredPef = parseFloat((7.0 + seed * 2.0).toFixed(1));
    goldStage = 'Función Pulmonar Normal (Caso Clínico Variable)';
  } else if (pattern === SpiroPattern.OBSTRUCTIVE) {
    measuredFvc = parseFloat((theoreticalFvc * (0.75 + seed * 0.15)).toFixed(2));
    measuredRatio = Math.round(42 + (seed * 18)); // 42% to 60%
    measuredFev1 = parseFloat(((measuredFvc * measuredRatio) / 100).toFixed(2));
    measuredPef = parseFloat((3.2 + seed * 1.8).toFixed(1));
    const fev1Percent = (measuredFev1 / theoreticalFev1) * 100;
    let severity = 'Leve';
    if (fev1Percent < 30) severity = 'Muy Grave';
    else if (fev1Percent < 50) severity = 'Grave';
    else if (fev1Percent < 80) severity = 'Moderado';
    goldStage = `Patrón Obstructivo ${severity} (Caso Clínico Variable)`;
  } else if (pattern === SpiroPattern.RESTRICTIVE) {
    measuredFvc = parseFloat((theoreticalFvc * (0.50 + seed * 0.20)).toFixed(2)); // 50% to 70% (Restringido)
    measuredRatio = Math.round(82 + (seed * 8)); // 82% to 90%
    measuredFev1 = parseFloat(((measuredFvc * measuredRatio) / 100).toFixed(2));
    measuredPef = parseFloat((4.8 + seed * 1.4).toFixed(1));
    goldStage = 'Patrón Restrictivo (Caso Clínico Variable)';
  }

  return {
    id: 'case4',
    name: name || 'Paciente de Análisis',
    age,
    gender,
    anamnesis: `Paciente ${gender === 'M' ? 'masculino' : 'femenina'} de ${age} años. Talla: ${height} cm, Peso: ${weight} kg. Caso dinámico generado aleatoriamente para análisis y simulación clínica.`,
    secretPattern: pattern,
    theoreticalFvc,
    theoreticalFev1,
    measuredFvc,
    measuredFev1,
    measuredRatio,
    measuredPef,
    goldStage,
  };
};

export default function SpirometrySimulator() {
  const [pattern, setPattern] = useState<SpiroPattern>(SpiroPattern.NORMAL);
  const [activeTab, setActiveTab] = useState<Tab>('dinamica');

  // Espirometría Estática States (Fourth Tab)
  const [estPattern, setEstPattern] = useState<'normal' | 'obstructive' | 'restrictive'>('normal');
  const [estVt, setEstVt] = useState<number>(0.50); // Liters
  const [estIrv, setEstIrv] = useState<number>(3.00); // Liters
  const [estErv, setEstErv] = useState<number>(1.20); // Liters
  const [estRv, setEstRv] = useState<number>(1.20); // Liters
  const [estFr, setEstFr] = useState<number>(12); // breaths per minute
  const [estVd, setEstVd] = useState<number>(0.15); // Liters (anatomical dead space, 150mL)

  // Sync default values when estPattern changes
  useEffect(() => {
    if (estPattern === 'normal') {
      setEstVt(0.50);
      setEstIrv(3.00);
      setEstErv(1.20);
      setEstRv(1.20);
      setEstFr(12);
      setEstVd(0.15);
    } else if (estPattern === 'obstructive') {
      setEstVt(0.50);
      setEstIrv(1.80);
      setEstErv(0.70);
      setEstRv(2.80);
      setEstFr(16);
      setEstVd(0.18);
    } else if (estPattern === 'restrictive') {
      setEstVt(0.35);
      setEstIrv(1.50);
      setEstErv(0.60);
      setEstRv(0.75);
      setEstFr(20);
      setEstVd(0.12);
    }
  }, [estPattern]);

  // Generate slow spirometry data points dynamically
  const estSpirogramData = useMemo(() => {
    const points: { x: number, y: number }[] = [];
    const fr = estFr;
    const vt = estVt;
    const irv = estIrv;
    const erv = estErv;
    const rv = estRv;
    
    const frc = erv + rv;
    const tlc = frc + vt + irv;
    const freqHz = fr / 60; // cycles per second
    
    // Generate points from t=0 to t=30 seconds, step = 0.2s (150 points)
    for (let t = 0; t <= 30; t += 0.2) {
      const timeVal = parseFloat(t.toFixed(1));
      let y = frc;
      
      if (timeVal < 8.0) {
        // Quiet breathing phase (Tidal)
        // Oscillates between FRC and FRC + VT
        const angle = 2 * Math.PI * freqHz * timeVal - Math.PI / 2;
        y = frc + (vt / 2) + (vt / 2) * Math.sin(angle);
      } else if (timeVal >= 8.0 && timeVal < 12.0) {
        // Transition and Deep Inspiration
        if (timeVal < 10.0) {
          const p = (timeVal - 8.0) / 2.0; // 0 to 1
          const smoothP = Math.sin(p * Math.PI / 2);
          y = frc + (tlc - frc) * smoothP;
        } else {
          y = tlc;
        }
      } else if (timeVal >= 12.0 && timeVal < 17.0) {
        // Deep Exhalation down to RV
        if (timeVal < 15.0) {
          const p = (timeVal - 12.0) / 3.0; // 0 to 1
          const smoothP = 0.5 * (1 - Math.cos(p * Math.PI));
          y = tlc - (tlc - rv) * smoothP;
        } else {
          y = rv;
        }
      } else if (timeVal >= 17.0 && timeVal < 20.0) {
        // Return to FRC
        if (timeVal < 19.0) {
          const p = (timeVal - 17.0) / 2.0; // 0 to 1
          const smoothP = Math.sin(p * Math.PI / 2);
          y = rv + (frc - rv) * smoothP;
        } else {
          y = frc;
        }
      } else {
        // Return to Quiet breathing
        const angle = 2 * Math.PI * freqHz * (timeVal - 20.0) - Math.PI / 2;
        y = frc + (vt / 2) + (vt / 2) * Math.sin(angle);
      }
      
      points.push({ x: timeVal, y: parseFloat(y.toFixed(3)) });
    }
    
    return points;
  }, [estVt, estIrv, estErv, estRv, estFr]);

  // Interactive Test States
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case1');
  const [testPhase, setTestPhase] = useState<'idle' | 'inhaling' | 'ready' | 'exhaling' | 'completed'>('idle');
  const [testTime, setTestTime] = useState<number>(0);
  const [inhaleProgress, setInhaleProgress] = useState<number>(0);
  const [liveVtPoints, setLiveVtPoints] = useState<DataPoint[]>([]);
  const [liveFvPoints, setLiveFvPoints] = useState<DataPoint[]>([]);
  
  // Custom/Randomized Case States
  const [customName, setCustomName] = useState('Paciente de Análisis');
  const [customAge, setCustomAge] = useState(45);
  const [customGender, setCustomGender] = useState<'M' | 'F'>('M');
  const [customHeight, setCustomHeight] = useState(170);
  const [customWeight, setCustomWeight] = useState(70);
  const [customPattern, setCustomPattern] = useState<SpiroPattern>(SpiroPattern.NORMAL);
  const [customRandomSeed, setCustomRandomSeed] = useState(0.45);

  // Evaluation States
  const [evalDiagnosis, setEvalDiagnosis] = useState<SpiroPattern | null>(null);
  const [evalRatioLow, setEvalRatioLow] = useState<boolean | null>(null);
  const [evalFvcLow, setEvalFvcLow] = useState<boolean | null>(null);
  const [evalFev1Low, setEvalFev1Low] = useState<boolean | null>(null);
  const [evalPbdIndicated, setEvalPbdIndicated] = useState<boolean | null>(null);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [evalScore, setEvalScore] = useState<number>(0);

  const currentData = useMemo(() => DATASETS[pattern], [pattern]);
  
  const activeCase = useMemo(() => {
    if (selectedCaseId === 'case4') {
      return getCustomCaseValues(
        customName, 
        customAge, 
        customGender, 
        customHeight, 
        customWeight, 
        customPattern, 
        customRandomSeed
      );
    }
    return CLINICAL_CASES.find(c => c.id === selectedCaseId)!;
  }, [selectedCaseId, customName, customAge, customGender, customHeight, customWeight, customPattern, customRandomSeed]);

  const patterns = [
    { id: SpiroPattern.NORMAL, label: 'Patrón Normal', color: 'emerald' },
    { id: SpiroPattern.OBSTRUCTIVE, label: 'Obstructivo (EPOC)', color: 'rose' },
    { id: SpiroPattern.RESTRICTIVE, label: 'Restrictivo (Fibrosis)', color: 'indigo' },
  ];

  // Motivational prompts during dynamic exhalation
  const getMotivationalPrompt = (t: number) => {
    if (t === 0) return '¡SOPLA CON FUERZA!';
    if (t < 1.0) return '¡MÁS FUERTE! ¡SOPLA!';
    if (t < 2.5) return '¡Sigue, sigue, sigue, sigue!';
    if (t < 4.0) return '¡No pares! ¡Vacía tus pulmones!';
    if (t < 5.5) return '¡Saca todo el aire! ¡Fuerza!';
    return '¡Último esfuerzo! ¡Listo!';
  };

  // Inhalation Guide Trigger
  const handleStartInhale = () => {
    setTestPhase('inhaling');
    setInhaleProgress(0);
    setTestTime(0);
    setLiveVtPoints([]);
    setLiveFvPoints([]);
    setIsEvaluated(false);
    setEvalDiagnosis(null);
    setEvalRatioLow(null);
    setEvalFvcLow(null);
    setEvalFev1Low(null);
    setEvalPbdIndicated(null);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setInhaleProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTestPhase('ready');
      }
    }, 80);
  };

  // Real-time Exhalation Simulator
  const handleStartExhale = () => {
    setTestPhase('exhaling');
    setTestTime(0);
    setLiveVtPoints([{ x: 0, y: 0 }]);
    setLiveFvPoints([{ x: 0, y: 0 }]);
    
    const originalFv = DATASETS[activeCase.secretPattern].fv;
    const originalVt = DATASETS[activeCase.secretPattern].vt;

    // Find the maximum x value (FVC) in the static dataset and filter all points up to that index
    let maxStaticX = 0;
    let maxStaticXIndex = 0;
    for (let i = 0; i < originalFv.length; i++) {
      if (originalFv[i].x > maxStaticX) {
        maxStaticX = originalFv[i].x;
        maxStaticXIndex = i;
      }
    }
    const exhalationFv = originalFv.slice(0, maxStaticXIndex + 1);

    // Dynamic scaling parameters to match activeCase metrics perfectly
    const staticFvc = originalVt[originalVt.length - 1].y;
    const staticFev1 = interpolate(originalVt, 1.0);
    const staticPef = Math.max(...exhalationFv.map(pt => pt.y));

    let t = 0;
    const interval = setInterval(() => {
      t = parseFloat((t + 0.1).toFixed(1));
      
      const v = interpolate(originalVt, t);
      
      // Scale volume to match activeCase FEV1 and FVC perfectly
      let scaledV = 0;
      if (t <= 1.0) {
        scaledV = staticFev1 > 0 ? v * (activeCase.measuredFev1 / staticFev1) : v;
      } else {
        const remainingStatic = staticFvc - staticFev1;
        scaledV = remainingStatic > 0 
          ? activeCase.measuredFev1 + (v - staticFev1) * ((activeCase.measuredFvc - activeCase.measuredFev1) / remainingStatic)
          : v;
      }
      
      // Interpolate flow and scale to match activeCase PEF perfectly
      const flow = interpolate(exhalationFv, v);
      const scaledFlow = staticPef > 0 ? flow * (activeCase.measuredPef / staticPef) : flow;
      
      setLiveVtPoints(prev => [...prev, { x: t, y: parseFloat(scaledV.toFixed(2)) }]);
      setLiveFvPoints(prev => [...prev, { x: parseFloat(scaledV.toFixed(2)), y: parseFloat(scaledFlow.toFixed(2)) }]);
      setTestTime(t);
      
      if (t >= 6.0) {
        clearInterval(interval);
        setTestPhase('completed');
      }
    }, 60); // Snappy simulation (6s inside 3.6s real-world time)
  };

  // Evaluate clinical diagnosis
  const handleConfirmEvaluation = () => {
    if (
      evalDiagnosis === null || 
      evalRatioLow === null || 
      evalFvcLow === null || 
      evalFev1Low === null || 
      evalPbdIndicated === null
    ) return;
    
    // Calculate correct values
    const correctRatioLow = activeCase.measuredRatio < 70;
    const correctFvcLow = ((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100) < 80;
    const correctFev1Low = ((activeCase.measuredFev1 / activeCase.theoreticalFev1) * 100) < 80;
    const correctPbdIndicated = activeCase.secretPattern === SpiroPattern.OBSTRUCTIVE;
    const correctDiagnosis = activeCase.secretPattern;

    let score = 0;
    if (evalDiagnosis === correctDiagnosis) score += 1;
    if (evalRatioLow === correctRatioLow) score += 1;
    if (evalFvcLow === correctFvcLow) score += 1;
    if (evalFev1Low === correctFev1Low) score += 1;
    if (evalPbdIndicated === correctPbdIndicated) score += 1;

    setEvalScore(score);
    setIsEvaluated(true);
  };

  const handleRandomizeCase = () => {
    const patternsToChoose = [SpiroPattern.NORMAL, SpiroPattern.OBSTRUCTIVE, SpiroPattern.RESTRICTIVE];
    const randomPattern = patternsToChoose[Math.floor(Math.random() * patternsToChoose.length)];
    setCustomPattern(randomPattern);
    setCustomRandomSeed(Math.random());
    
    // Randomize patient demographics matching the selected pattern
    const randomData = getRandomPatientData(randomPattern);
    setCustomName(randomData.name);
    setCustomAge(randomData.age);
    setCustomGender(randomData.gender);
    setCustomHeight(randomData.height);
    setCustomWeight(randomData.weight);
    
    // Also reset test phase to 'idle' so they have to run the spirometry test again with the new patient values!
    setTestPhase('idle');
    setTestTime(0);
    setLiveVtPoints([]);
    setLiveFvPoints([]);
    setIsEvaluated(false);
    setEvalDiagnosis(null);
    setEvalRatioLow(null);
    setEvalFvcLow(null);
    setEvalFev1Low(null);
    setEvalPbdIndicated(null);
  };

  const handleRandomizePatientDetails = () => {
    // Randomize patient demographics matching the current pattern
    const randomData = getRandomPatientData(customPattern);
    setCustomName(randomData.name);
    setCustomAge(randomData.age);
    setCustomGender(randomData.gender);
    setCustomHeight(randomData.height);
    setCustomWeight(randomData.weight);
    
    // Reset test phase so they can run the test with the new patient values
    setTestPhase('idle');
    setTestTime(0);
    setLiveVtPoints([]);
    setLiveFvPoints([]);
    setIsEvaluated(false);
    setEvalDiagnosis(null);
    setEvalRatioLow(null);
    setEvalFvcLow(null);
    setEvalFev1Low(null);
    setEvalPbdIndicated(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg text-xs shadow-2xl backdrop-blur-md">
          <p className="text-slate-400 font-medium">{`X (Vol/Tiempo): ${payload[0].value.toFixed(2)}`}</p>
          <p className="text-white font-bold font-mono">{`Y (Flujo/Vol): ${payload[1].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[90vh] md:max-h-[95vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-80 bg-slate-900/50 p-6 flex flex-col border-b md:border-b-0 md:border-r border-slate-800/50 overflow-y-auto shrink-0">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Wind className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">SpiroLab Pro</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold ml-11">
            Análisis de Función Pulmonar
          </p>
          <p className="text-[10px] text-emerald-400/80 font-medium ml-11 mt-1">
            Creado por Xavier Obando
          </p>
        </div>

        {activeTab === 'espirometria_estatica' ? (
          <div className="flex flex-col h-full space-y-5">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Patrón Fisiopatológico
            </h2>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setEstPattern('normal')}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-bold transition-all",
                  estPattern === 'normal' ? "bg-emerald-500/20 text-emerald-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setEstPattern('obstructive')}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-bold transition-all",
                  estPattern === 'obstructive' ? "bg-rose-500/20 text-rose-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Obstructivo
              </button>
              <button
                type="button"
                onClick={() => setEstPattern('restrictive')}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-bold transition-all",
                  estPattern === 'restrictive' ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Restrictivo
              </button>
            </div>

            <div className="space-y-4 pt-2 overflow-y-auto max-h-[50vh] pr-1">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-1">
                Volúmenes Pulmonares (L)
              </h3>
              
              {/* VC / VT */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Vol. Corriente (VC / VT)</span>
                  <span className="text-emerald-400 font-mono">{(estVt).toFixed(2)} L</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="1.50"
                  step="0.05"
                  value={estVt}
                  onChange={(e) => setEstVt(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500">Aire inspirado/espirado en respiración normal.</p>
              </div>

              {/* VRI / IRV */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Vol. Res. Inspiratoria (VRI)</span>
                  <span className="text-emerald-400 font-mono">{(estIrv).toFixed(2)} L</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="4.50"
                  step="0.10"
                  value={estIrv}
                  onChange={(e) => setEstIrv(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500">Aire adicional inspirado tras inspiración normal.</p>
              </div>

              {/* VRE / ERV */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Vol. Res. Espiratoria (VRE)</span>
                  <span className="text-emerald-400 font-mono">{(estErv).toFixed(2)} L</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="2.50"
                  step="0.05"
                  value={estErv}
                  onChange={(e) => setEstErv(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500">Aire adicional espirado tras espiración normal.</p>
              </div>

              {/* VR / RV */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Vol. Residual (VR)</span>
                  <span className="text-emerald-400 font-mono">{(estRv).toFixed(2)} L</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="4.00"
                  step="0.10"
                  value={estRv}
                  onChange={(e) => setEstRv(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500 text-rose-300">Aire que queda en pulmones tras espiración máxima.</p>
              </div>

              {/* Reset to Normal Button */}
              <button
                type="button"
                onClick={() => {
                  setEstPattern('normal');
                  setEstVt(0.50);
                  setEstIrv(3.00);
                  setEstErv(1.20);
                  setEstRv(1.20);
                  setEstFr(12);
                  setEstVd(0.15);
                }}
                className="w-full flex items-center justify-center gap-2 mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-xl border border-slate-800 transition-all shadow-md active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetear a Normal
              </button>

              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-1 pt-2">
                Parámetros Ventilatorios
              </h3>

              {/* FR */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Frec. Respiratoria (FR)</span>
                  <span className="text-emerald-400 font-mono">{estFr} rpm</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="1"
                  value={estFr}
                  onChange={(e) => setEstFr(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500">Ciclos respiratorios por minuto.</p>
              </div>

              {/* VD */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Espacio Muerto (VD)</span>
                  <span className="text-emerald-400 font-mono">{Math.round(estVd * 1000)} mL</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.01"
                  value={estVd}
                  onChange={(e) => setEstVd(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[9px] text-slate-500">Volumen de vías aéreas de conducción sin intercambio.</p>
              </div>
            </div>
          </div>
        ) : activeTab !== 'prueba' ? (
          <>
            <div className="space-y-4 mb-8">
              <h2 className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 px-1">
                Simulación Clínica
              </h2>
              {patterns.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPattern(p.id)}
                  className={cn(
                    "w-full group flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-300",
                    pattern === p.id 
                      ? `bg-${p.color}-500/10 border-${p.color}-500/30 text-${p.color}-300`
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                  )}
                >
                  <span className="text-sm font-medium">{p.label}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    pattern === p.id 
                      ? `bg-${p.color}-400 shadow-[0_0_10px_rgba(var(--${p.color}-rgb),0.5)]`
                      : "bg-slate-700 group-hover:bg-slate-500"
                  )} />
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800/50 shadow-inner">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {activeTab === 'dinamica' ? 'Métricas Dinámicas' : 'Volúmenes Pulmonares'}
                  </h2>
                  <Activity className="w-3 h-3 text-slate-600" />
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'dinamica' ? (
                    <motion.div 
                      key="dinamica-metrics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-4 mb-6"
                    >
                      <MetricItem label="FEV1" value={currentData.metrics.fev1} />
                      <MetricItem label="FVC" value={currentData.metrics.fvc} />
                      <MetricItem label="RELACIÓN" value={currentData.metrics.ratio} />
                      <MetricItem label="PEF" value={currentData.metrics.pef} />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="estatica-metrics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-2 gap-4 mb-6"
                    >
                      <MetricItem label="VRI" value={currentData.staticVols.vri} />
                      <MetricItem label="VT" value={currentData.staticVols.vt} />
                      <MetricItem label="VRE" value={currentData.staticVols.vre} />
                      <MetricItem label="VR" value={currentData.staticVols.vr} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                     <Info className="w-8 h-8 text-white" />
                   </div>
                   <div 
                    className="text-[11px] leading-relaxed text-slate-400 italic" 
                    dangerouslySetInnerHTML={{ __html: currentData.metrics.notes }} 
                   />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Pacientes Clínicos
            </h2>
            <div className="space-y-3 mb-6">
              {CLINICAL_CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setTestPhase('idle');
                    setTestTime(0);
                    setLiveVtPoints([]);
                    setLiveFvPoints([]);
                    setIsEvaluated(false);
                    setEvalDiagnosis(null);
                    setEvalRatioLow(null);
                    setEvalFvcLow(null);
                    setEvalFev1Low(null);
                    setEvalPbdIndicated(null);
                  }}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-300",
                    selectedCaseId === c.id
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/30"
                  )}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {c.name}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {c.anamnesis}
                  </p>
                </button>
              ))}

              {/* Case 4 Button */}
              <button
                onClick={() => {
                  setSelectedCaseId('case4');
                  setTestPhase('idle');
                  setTestTime(0);
                  setLiveVtPoints([]);
                  setLiveFvPoints([]);
                  setIsEvaluated(false);
                  setEvalDiagnosis(null);
                  setEvalRatioLow(null);
                  setEvalFvcLow(null);
                  setEvalFev1Low(null);
                  setEvalPbdIndicated(null);
                }}
                className={cn(
                  "w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-300",
                  selectedCaseId === 'case4'
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-transparent border-slate-800 text-slate-400 hover:bg-slate-800/30"
                )}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-200">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Caso Variable (Análisis Libre)
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  Configura los datos del paciente (nombre, edad, sexo, talla, peso) y obtén curvas y valores predichos/obtenidos variables al azar.
                </p>
              </button>
            </div>

            {selectedCaseId === 'case4' ? (
              <div className="mt-auto bg-slate-900/80 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Configurar Paciente
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Nombre</label>
                    <input 
                      type="text" 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Edad</label>
                      <input 
                        type="number" 
                        value={customAge}
                        min={18}
                        max={95}
                        onChange={(e) => setCustomAge(Math.max(1, Math.min(120, Number(e.target.value))))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Sexo</label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setCustomGender('M')}
                          className={cn(
                            "py-0.5 rounded text-[10px] font-bold transition-all",
                            customGender === 'M' ? "bg-amber-500/20 text-amber-300" : "text-slate-500 hover:text-slate-400"
                          )}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomGender('F')}
                          className={cn(
                            "py-0.5 rounded text-[10px] font-bold transition-all",
                            customGender === 'F' ? "bg-amber-500/20 text-amber-300" : "text-slate-500 hover:text-slate-400"
                          )}
                        >
                          F
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Talla (cm)</label>
                      <input 
                        type="number" 
                        value={customHeight}
                        min={100}
                        max={220}
                        onChange={(e) => setCustomHeight(Math.max(50, Math.min(250, Number(e.target.value))))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Peso (kg)</label>
                      <input 
                        type="number" 
                        value={customWeight}
                        min={30}
                        max={200}
                        onChange={(e) => setCustomWeight(Math.max(10, Math.min(300, Number(e.target.value))))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-800 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleRandomizePatientDetails}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    👤 Colocar Paciente al Azar
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomizeCase}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/20 active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" />
                    🎲 Simular Caso al Azar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-auto bg-slate-900/80 rounded-2xl p-4 border border-slate-800/50">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Historial del Caso
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-400 font-serif">
                  "{activeCase.anamnesis}"
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                  <span>Edad: {activeCase.age} años</span>
                  <span>Género: {activeCase.gender === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto bg-slate-950">
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex-wrap self-start">
            <button
              onClick={() => setActiveTab('dinamica')}
              className={cn(
                "px-4 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                activeTab === 'dinamica'
                  ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-slate-700"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Espirometría Dinámica
            </button>
            <button
              onClick={() => setActiveTab('estatica')}
              className={cn(
                "px-4 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                activeTab === 'estatica'
                  ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-slate-700"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Volúmenes Estáticos
            </button>
            <button
              onClick={() => setActiveTab('prueba')}
              className={cn(
                "px-4 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                activeTab === 'prueba'
                  ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-slate-700"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Evaluador de Casos
            </button>
            <button
              onClick={() => setActiveTab('espirometria_estatica')}
              className={cn(
                "px-4 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                activeTab === 'espirometria_estatica'
                  ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-slate-700"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Espirometría Estática
            </button>
          </div>
          
          <div className="flex items-center self-end sm:self-auto">
            <a 
              href="https://www.youtube.com/@ProfeX-27" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-rose-900/20 active:scale-95 group relative overflow-hidden"
            >
              <Youtube className="w-4 h-4" />
              <span>Suscríbete</span>
            </a>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dinamica' ? (
            <motion.div
              key="tab-dinamica"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-1 gap-8 max-w-4xl w-full mx-auto"
            >
              <ChartSection title="Curva Flujo - Volumen" subtitle="Relación instantánea entre flujo de aire y volumen pulmonar">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Volumen" 
                      unit="L" 
                      domain={[0, 7]} 
                      stroke="#475569" 
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Flujo" 
                      unit="L/s" 
                      domain={[-6, 10]} 
                      stroke="#475569" 
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter 
                      data={currentData.fv} 
                      fill={currentData.theme.bg} 
                      line={{ stroke: currentData.theme.color, strokeWidth: 3 }}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return <circle cx={cx} cy={cy} r={0} />;
                      }}
                      isAnimationActive
                    />
                    <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartSection>

              <ChartSection title="Curva Volumen - Tiempo" subtitle="Volumen acumulado exhalado durante una maniobra forzada de 6s">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Tiempo" 
                      unit="s" 
                      domain={[0, 6]} 
                      stroke="#475569" 
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Volumen" 
                      unit="L" 
                      domain={[0, 6]} 
                      stroke="#475569" 
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter 
                      data={currentData.vt} 
                      line={{ stroke: currentData.theme.color, strokeWidth: 3 }}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return <circle cx={cx} cy={cy} r={0} />;
                      }}
                      isAnimationActive
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartSection>
            </motion.div>
          ) : activeTab === 'espirometria_estatica' ? (
            <motion.div
              key="tab-espirometria-estatica"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-8 max-w-4xl w-full mx-auto"
            >
              {/* Espirograma Estático */}
              <ChartSection 
                title="Espirograma Estático Dinámico (Curva de Volúmenes)" 
                subtitle="Registro gráfico de la respiración tranquila seguida de una maniobra de capacidad vital lenta (inspiración y espiración máximas)"
              >
                <div className="relative h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        domain={[0, 30]} 
                        stroke="#475569" 
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: '#334155' }}
                        name="Tiempo"
                        unit="s"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        domain={[0, Math.max(8.5, parseFloat((estVt + estIrv + estErv + estRv + 1.0).toFixed(1)))]} 
                        stroke="#475569" 
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: '#334155' }}
                        name="Volumen"
                        unit="L"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* TLC Line */}
                      <ReferenceLine 
                        y={parseFloat((estVt + estIrv + estErv + estRv).toFixed(2))} 
                        stroke="#ef4444" 
                        strokeDasharray="4 4" 
                        label={{ value: `CPT (${(estVt + estIrv + estErv + estRv).toFixed(2)} L)`, fill: '#ef4444', fontSize: 10, position: 'right' }} 
                      />
                      
                      {/* FRC Line */}
                      <ReferenceLine 
                        y={parseFloat((estErv + estRv).toFixed(2))} 
                        stroke="#eab308" 
                        strokeDasharray="4 4" 
                        label={{ value: `CRF (${(estErv + estRv).toFixed(2)} L)`, fill: '#eab308', fontSize: 10, position: 'right' }} 
                      />
                      
                      {/* RV Line */}
                      <ReferenceLine 
                        y={parseFloat((estRv).toFixed(2))} 
                        stroke="#64748b" 
                        strokeDasharray="4 4" 
                        label={{ value: `VR (${(estRv).toFixed(2)} L)`, fill: '#64748b', fontSize: 10, position: 'right' }} 
                      />

                      <Scatter 
                        data={estSpirogramData} 
                        line={{ stroke: estPattern === 'normal' ? '#10b981' : estPattern === 'obstructive' ? '#f43f5e' : '#6366f1', strokeWidth: 3 }}
                        shape={(props: any) => {
                          const { cx, cy } = props;
                          return <circle cx={cx} cy={cy} r={0} />;
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Visual indicator for phases */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-[10px] uppercase font-mono tracking-wider text-slate-500 text-center">
                  <div className="p-1.5 bg-slate-900/50 rounded border border-slate-800/40">t: 0-8s<br/><span className="text-slate-400">Reposo</span></div>
                  <div className="p-1.5 bg-emerald-500/5 rounded border border-emerald-500/10">t: 8-12s<br/><span className="text-emerald-400">Inspiración Máx</span></div>
                  <div className="p-1.5 bg-rose-500/5 rounded border border-rose-500/10">t: 12-17s<br/><span className="text-rose-400">Espiración Máx</span></div>
                  <div className="p-1.5 bg-slate-900/50 rounded border border-slate-800/40">t: 17-30s<br/><span className="text-slate-400">Retorno Reposo</span></div>
                </div>
              </ChartSection>

              {/* Fisiología y Cálculos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cálculos de Ventilación */}
                <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm space-y-5">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Parámetros de Ventilación Pulmonar
                  </h3>

                  {/* Volumen Minuto */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">Volumen Minuto Respiratorio (VMR)</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Volumen total de aire movilizado por minuto.</p>
                      </div>
                      <span className="text-lg font-black font-mono text-emerald-400">{(estVt * estFr).toFixed(2)} L/min</span>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-900/80 flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">Fórmula: VMR = VT × FR</span>
                      <span className="font-mono text-slate-400">
                        Cálculo: {(estVt).toFixed(2)} L × {estFr} rpm = <strong className="text-emerald-300">{(estVt * estFr).toFixed(2)} L/min</strong>
                      </span>
                    </div>
                  </div>

                  {/* Ventilación Alveolar */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">Ventilación Alveolar (VA)</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Volumen real de aire fresco que alcanza los alvéolos por minuto.</p>
                      </div>
                      <span className="text-lg font-black font-mono text-cyan-400">{((estVt - estVd) * estFr).toFixed(2)} L/min</span>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-900/80 flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">Fórmula: VA = (VT - VD) × FR</span>
                      <span className="font-mono text-slate-400">
                        Cálculo: ({(estVt).toFixed(2)} L - {(estVd).toFixed(2)} L) × {estFr} rpm = <strong className="text-cyan-300">{((estVt - estVd) * estFr).toFixed(2)} L/min</strong>
                      </span>
                    </div>
                  </div>

                  {/* Fracción de Espacio Muerto */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">Fracción de Espacio Muerto (VD / VT)</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Proporción de cada respiración que no participa en el intercambio gaseoso.</p>
                      </div>
                      <span className="text-lg font-black font-mono text-amber-400">{((estVd / estVt) * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-900/80 flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-500">Fórmula: VD/VT = (VD ÷ VT) × 100</span>
                      <span className="font-mono text-slate-400">
                        Cálculo: ({(estVd * 1000).toFixed(0)} mL ÷ {(estVt * 1000).toFixed(0)} mL) × 100 = <strong className="text-amber-300">{((estVd / estVt) * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabla de Capacidades Estáticas Calculadas */}
                <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Análisis de Capacidades Estáticas
                    </h3>
                    
                    <div className="space-y-2.5 text-xs">
                      {/* CPT */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-300">Capacidad Pulmonar Total (CPT)</span>
                          <span className="block text-[10px] text-slate-500">VC + VRI + VRE + VR</span>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{(estVt + estIrv + estErv + estRv).toFixed(2)} L</span>
                      </div>

                      {/* CV */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-300">Capacidad Vital (CV)</span>
                          <span className="block text-[10px] text-slate-500">VC + VRI + VRE</span>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{(estVt + estIrv + estErv).toFixed(2)} L</span>
                      </div>

                      {/* CRF */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-300">Capacidad Residual Funcional (CRF)</span>
                          <span className="block text-[10px] text-slate-500">VRE + VR</span>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{(estErv + estRv).toFixed(2)} L</span>
                      </div>

                      {/* CI */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                        <div>
                          <span className="font-bold text-slate-300">Capacidad Inspiratoria (CI)</span>
                          <span className="block text-[10px] text-slate-500">VC + VRI</span>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">{(estVt + estIrv).toFixed(2)} L</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 text-[11px] leading-relaxed text-slate-400 mt-4">
                    <span className="font-bold text-slate-300 block mb-1">Análisis Fisiopatológico Teórico:</span>
                    {estPattern === 'normal' && (
                      <span>
                        En una condición <strong>Normal</strong>, la relación entre el espacio muerto y el volumen corriente (VD/VT) se mantiene baja (~30%), lo que garantiza que la mayor parte del aire movilizado ventila alvéolos activos para un óptimo intercambio gaseoso. Las capacidades pulmonares se encuentran equilibradas.
                      </span>
                    )}
                    {estPattern === 'obstructive' && (
                      <span>
                        En enfermedades <strong>Obstructivas</strong> (como el enfisema), el <strong>atrapamiento aéreo</strong> eleva drásticamente el Volumen Residual (VR) y la Capacidad Pulmonar Total (hiperinsuflación). La destrucción alveolar incrementa el espacio muerto fisiológico (VD), elevando la fracción VD/VT y reduciendo la eficiencia de la ventilación alveolar.
                      </span>
                    )}
                    {estPattern === 'restrictive' && (
                      <span>
                        En enfermedades <strong>Restrictivas</strong> (como la fibrosis pulmonar), el tejido pulmonar rígido reduce simétricamente todas las capacidades y volúmenes, especialmente el Volumen de Reserva Inspiratoria (VRI) y el Volumen Corriente (VT). Para compensar y mantener la ventilación alveolar, el paciente incrementa la <strong>Frecuencia Respiratoria</strong> (FR).
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'prueba' ? (
            <motion.div
              key="tab-prueba"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-8 max-w-4xl w-full mx-auto"
            >
              {/* Simulation Stage Card */}
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[220px] shadow-lg backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  Módulo de Esfuerzo Pulmonar
                </div>

                {testPhase === 'idle' && (
                  <div className="flex flex-col items-center text-center max-w-md pt-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-lg">
                      <Wind className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-slate-200 mb-2">Preparación para Espirometría</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      Indica al paciente que se coloque la pinza nasal y boquilla sellada. Haz clic a continuación para guiar la inspiración máxima profunda.
                    </p>
                    <button
                      onClick={handleStartInhale}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Inspiración (CPT)
                    </button>
                  </div>
                )}

                {testPhase === 'inhaling' && (
                  <div className="flex flex-col items-center text-center w-full max-w-xs pt-4">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping" />
                      <motion.div 
                        style={{ scale: 0.8 + (inhaleProgress / 100) * 0.4 }}
                        className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg"
                      >
                        <Heart className="w-8 h-8 text-emerald-400 animate-pulse" />
                      </motion.div>
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Paso 1: Inspiración Forzada</h3>
                    <p className="text-sm font-semibold text-white mb-3">¡Inhalando aire hasta CPT!</p>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-emerald-400 h-full transition-all duration-100 rounded-full" 
                        style={{ width: `${inhaleProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">{inhaleProgress}% CPT</span>
                  </div>
                )}

                {testPhase === 'ready' && (
                  <div className="flex flex-col items-center text-center max-w-sm pt-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 shadow-lg animate-bounce">
                      <Wind className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">¡Aire al Máximo en Pulmones!</h3>
                    <p className="text-xs text-slate-300 mb-6">
                      El paciente está listo en CPT. Haz clic de inmediato para comenzar la espiración forzada máxima.
                    </p>
                    <button
                      onClick={handleStartExhale}
                      className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-950/40 active:scale-95 transition-all flex items-center gap-2 animate-pulse"
                    >
                      <Wind className="w-4 h-4" />
                      ¡SOPLAR CON FUERZA!
                    </button>
                  </div>
                )}

                {testPhase === 'exhaling' && (
                  <div className="flex flex-col items-center text-center w-full max-w-md pt-4">
                    <div className="text-4xl font-extrabold font-mono text-rose-400 mb-2">
                      {testTime.toFixed(1)}s
                    </div>
                    <div className="text-base font-bold text-white tracking-wide uppercase h-6 animate-pulse mb-4">
                      {getMotivationalPrompt(testTime)}
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-75 rounded-full" 
                        style={{ width: `${(testTime / 6.0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 uppercase tracking-wider">Duración Estándar de Prueba: 6.0 segundos</span>
                  </div>
                )}

                {testPhase === 'completed' && (
                  <div className="flex items-center justify-between w-full max-w-2xl bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">Maniobra Completada con Éxito</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          La prueba cumple los criterios internacionales de aceptabilidad y repetibilidad (FET &gt; 6s).
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleStartInhale}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-evaluar
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Live Plots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                    <span>Curva Flujo - Volumen (Live)</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-500 uppercase">Tiempo real</span>
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          domain={[0, 7]} 
                          stroke="#475569" 
                          fontSize={10}
                          tick={{ fill: '#64748b' }}
                          axisLine={{ stroke: '#334155' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          domain={[0, 10]} 
                          stroke="#475569" 
                          fontSize={10}
                          tick={{ fill: '#64748b' }}
                          axisLine={{ stroke: '#334155' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter 
                          data={liveFvPoints} 
                          line={{ stroke: '#34d399', strokeWidth: 2.5 }}
                          shape={(props: any) => {
                            const { cx, cy } = props;
                            return <circle cx={cx} cy={cy} r={0} />;
                          }}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-5 backdrop-blur-sm">
                  <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
                    <span>Curva Volumen - Tiempo (Live)</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-500 uppercase">Tiempo real</span>
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          domain={[0, 6]} 
                          stroke="#475569" 
                          fontSize={10}
                          tick={{ fill: '#64748b' }}
                          axisLine={{ stroke: '#334155' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          domain={[0, 6]} 
                          stroke="#475569" 
                          fontSize={10}
                          tick={{ fill: '#64748b' }}
                          axisLine={{ stroke: '#334155' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter 
                          data={liveVtPoints} 
                          line={{ stroke: '#f43f5e', strokeWidth: 2.5 }}
                          shape={(props: any) => {
                            const { cx, cy } = props;
                            return <circle cx={cx} cy={cy} r={0} />;
                          }}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Assessment Panel (Only visible once test is completed) */}
              {testPhase === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-xl"
                >
                  <div className="border-b border-slate-800 pb-4 mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Beaker className="w-5 h-5 text-emerald-400" />
                      Evaluación Clínica y Diagnóstico
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Analiza las curvas generadas y las métricas obtenidas para establecer el diagnóstico correspondiente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">FVC Obtenido</span>
                      <span className="text-2xl font-black text-white font-mono">{activeCase.measuredFvc.toFixed(2)} L</span>
                      <span className="text-[10px] text-slate-400 mt-1">Teórico: {activeCase.theoreticalFvc.toFixed(2)} L ({((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">FEV1 Obtenido</span>
                      <span className="text-2xl font-black text-white font-mono">{activeCase.measuredFev1.toFixed(2)} L</span>
                      <span className="text-[10px] text-slate-400 mt-1">Teórico: {activeCase.theoreticalFev1.toFixed(2)} L ({((activeCase.measuredFev1 / activeCase.theoreticalFev1) * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Relación FEV1 / FVC</span>
                      <span className="text-2xl font-black text-white font-mono">{activeCase.measuredRatio}%</span>
                      <span className="text-[10px] text-slate-400 mt-1">Referencia Normal: &gt;70%</span>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">PEF (Flujo Pico)</span>
                      <span className="text-2xl font-black text-white font-mono">{activeCase.measuredPef.toFixed(1)} L/s</span>
                      <span className="text-[10px] text-slate-400 mt-1">Esfuerzo muscular inicial</span>
                    </div>
                  </div>

                  {!isEvaluated ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Column 1: Análisis de Parámetros Individuales */}
                        <div className="space-y-5 bg-slate-950/40 p-5 rounded-xl border border-slate-800/50">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                            Fase 1: Análisis de Parámetros
                          </h4>
                          
                          {/* Q1: FEV1/FVC Ratio */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-300">1. ¿Relación FEV1/FVC disminuida (&lt; 70%)?</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                onClick={() => setEvalRatioLow(true)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalRatioLow === true 
                                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                Sí, disminuida (&lt; 70%)
                              </button>
                              <button
                                onClick={() => setEvalRatioLow(false)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalRatioLow === false 
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                No, normal (≥ 70%)
                              </button>
                            </div>
                          </div>

                          {/* Q2: FVC Reduction */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-300">2. ¿FVC reducida (&lt; 80% del teórico)?</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                onClick={() => setEvalFvcLow(true)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalFvcLow === true 
                                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                Sí, reducida (&lt; 80%)
                              </button>
                              <button
                                onClick={() => setEvalFvcLow(false)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalFvcLow === false 
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                No, normal (≥ 80%)
                              </button>
                            </div>
                          </div>

                          {/* Q4: FEV1 Reduction */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-300">3. ¿FEV1 disminuido (&lt; 80% del teórico)?</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                onClick={() => setEvalFev1Low(true)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalFev1Low === true 
                                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                Sí, disminuido (&lt; 80%)
                              </button>
                              <button
                                onClick={() => setEvalFev1Low(false)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalFev1Low === false 
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                No, normal (≥ 80%)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Diagnóstico y Conducta */}
                        <div className="space-y-5 bg-slate-950/40 p-5 rounded-xl border border-slate-800/50">
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                            Fase 2: Diagnóstico y Conducta Clínica
                          </h4>

                          {/* Q3: Diagnosis Choice */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-300">4. ¿Cuál es el diagnóstico espirométrico?</label>
                            <div className="flex flex-col gap-1.5 mt-1">
                              {patterns.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => setEvalDiagnosis(p.id)}
                                  className={cn(
                                    "py-2 px-3 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between",
                                    evalDiagnosis === p.id 
                                      ? `bg-${p.color}-500/10 border-${p.color}-500/40 text-${p.color}-300`
                                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                  )}
                                >
                                  <span>{p.label}</span>
                                  {evalDiagnosis === p.id && <span className={`w-1.5 h-1.5 rounded-full bg-${p.color}-400 shadow-[0_0_8px_rgba(var(--${p.color}-rgb),0.6)]`} />}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Q5: PBD Indication */}
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-300">5. ¿Está indicada una Prueba Broncodilatadora (PBD)?</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <button
                                onClick={() => setEvalPbdIndicated(true)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalPbdIndicated === true 
                                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                Sí, está indicada (Obstrucción)
                              </button>
                              <button
                                onClick={() => setEvalPbdIndicated(false)}
                                className={cn(
                                  "py-2.5 rounded-lg border text-xs font-bold transition-all",
                                  evalPbdIndicated === false 
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                                )}
                              >
                                No está indicada (Normal/Restricción)
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 flex justify-end">
                        <button
                          onClick={handleConfirmEvaluation}
                          disabled={
                            evalDiagnosis === null || 
                            evalRatioLow === null || 
                            evalFvcLow === null || 
                            evalFev1Low === null || 
                            evalPbdIndicated === null
                          }
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Confirmar Diagnóstico Clínico
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-6 rounded-xl border flex flex-col gap-4 shadow-lg relative overflow-hidden",
                        evalScore === 5
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : evalScore >= 3
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-rose-500/10 border-rose-500/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-3 rounded-xl",
                            evalScore === 5 ? "bg-emerald-500/20" : evalScore >= 3 ? "bg-amber-500/20" : "bg-rose-500/20"
                          )}>
                            {evalScore === 5 ? (
                              <Award className="w-6 h-6 text-emerald-400" />
                            ) : evalScore >= 3 ? (
                              <ShieldAlert className="w-6 h-6 text-amber-400" />
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">
                              {evalScore === 5 
                                ? '¡Excelente! Diagnóstico Correcto (5/5 aciertos)' 
                                : evalScore >= 3 
                                ? `Diagnóstico Parcial (${evalScore}/5 aciertos)` 
                                : `Diagnóstico Incorrecto (${evalScore}/5 aciertos)`}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              El paciente tiene un patrón de tipo <strong className="text-slate-200">{activeCase.goldStage}</strong>.
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl font-black font-mono text-slate-300">{evalScore}/5</span>
                      </div>

                      {/* 5-Question Feedback Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs my-1">
                        {/* Q1 Feedback */}
                        <div className={cn(
                          "p-3 rounded-lg border flex flex-col justify-between",
                          (evalRatioLow === (activeCase.measuredRatio < 70)) ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div>
                            <span className="block font-bold mb-1 text-[11px]">1. FEV1/FVC &lt;70%</span>
                            <span className="block opacity-80">Tu rpta: {evalRatioLow ? 'Sí' : 'No'}</span>
                          </div>
                          <span className="block opacity-95 mt-1.5 font-bold text-[10px]">Correcto: {activeCase.measuredRatio < 70 ? 'Sí' : 'No'}</span>
                        </div>

                        {/* Q2 Feedback */}
                        <div className={cn(
                          "p-3 rounded-lg border flex flex-col justify-between",
                          (evalFvcLow === (((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100) < 80)) ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div>
                            <span className="block font-bold mb-1 text-[11px]">2. FVC &lt;80%</span>
                            <span className="block opacity-80">Tu rpta: {evalFvcLow ? 'Sí' : 'No'}</span>
                          </div>
                          <span className="block opacity-95 mt-1.5 font-bold text-[10px]">Correcto: {((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100) < 80 ? 'Sí' : 'No'}</span>
                        </div>

                        {/* Q3 Feedback */}
                        <div className={cn(
                          "p-3 rounded-lg border flex flex-col justify-between",
                          (evalFev1Low === (((activeCase.measuredFev1 / activeCase.theoreticalFev1) * 100) < 80)) ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div>
                            <span className="block font-bold mb-1 text-[11px]">3. FEV1 &lt;80%</span>
                            <span className="block opacity-80">Tu rpta: {evalFev1Low ? 'Sí' : 'No'}</span>
                          </div>
                          <span className="block opacity-95 mt-1.5 font-bold text-[10px]">Correcto: {((activeCase.measuredFev1 / activeCase.theoreticalFev1) * 100) < 80 ? 'Sí' : 'No'}</span>
                        </div>

                        {/* Q4 Feedback */}
                        <div className={cn(
                          "p-3 rounded-lg border flex flex-col justify-between",
                          (evalDiagnosis === activeCase.secretPattern) ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div>
                            <span className="block font-bold mb-1 text-[11px]">4. Diagnóstico</span>
                            <span className="block opacity-80 truncate">Tu rpta: {evalDiagnosis === SpiroPattern.NORMAL ? 'Normal' : evalDiagnosis === SpiroPattern.OBSTRUCTIVE ? 'Obstructivo' : 'Restrictivo'}</span>
                          </div>
                          <span className="block opacity-95 mt-1.5 font-bold text-[10px] truncate">Correcto: {activeCase.secretPattern === SpiroPattern.NORMAL ? 'Normal' : activeCase.secretPattern === SpiroPattern.OBSTRUCTIVE ? 'Obstructivo' : 'Restrictivo'}</span>
                        </div>

                        {/* Q5 Feedback */}
                        <div className={cn(
                          "p-3 rounded-lg border flex flex-col justify-between",
                          (evalPbdIndicated === (activeCase.secretPattern === SpiroPattern.OBSTRUCTIVE)) ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                        )}>
                          <div>
                            <span className="block font-bold mb-1 text-[11px]">5. PBD indicada</span>
                            <span className="block opacity-80">Tu rpta: {evalPbdIndicated ? 'Sí' : 'No'}</span>
                          </div>
                          <span className="block opacity-95 mt-1.5 font-bold text-[10px]">Correcto: {activeCase.secretPattern === SpiroPattern.OBSTRUCTIVE ? 'Sí' : 'No'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-800/80 text-xs text-slate-400 leading-relaxed font-serif">
                        <p className="font-bold text-slate-300 mb-2 font-sans">Justificación Fisiológica:</p>
                        {activeCase.secretPattern === SpiroPattern.OBSTRUCTIVE && (
                          <span className="block">
                            La relación FEV1/FVC disminuida ({activeCase.measuredRatio}%) es el criterio definitorio para diagnosticar obstrucción de la vía aérea en la espirometría. Aunque la FVC disminuye ligeramente por tabaquismo o atrapamiento de aire ({((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100).toFixed(0)}%), se mantiene por encima de los límites de restricción grave, confirmando un patrón obstructivo característico del EPOC o asma. Por lo tanto, se recomienda una Prueba Broncodilatadora (PBD) para verificar reversibilidad.
                          </span>
                        )}
                        {activeCase.secretPattern === SpiroPattern.NORMAL && (
                          <span className="block">
                            Todos los valores medidos se encuentran en rangos de referencia óptimos. La relación FEV1/FVC ({activeCase.measuredRatio}%) se mantiene por encima del límite del 70%, y tanto la FVC como el FEV1 están por encima del 80% del teórico esperado para su edad y género, confirmando una función respiratoria totalmente conservada. No se requiere PBD de forma rutinaria.
                          </span>
                        )}
                        {activeCase.secretPattern === SpiroPattern.RESTRICTIVE && (
                          <span className="block">
                            La relación FEV1/FVC se encuentra normal o incluso elevada ({activeCase.measuredRatio}%), pero la FVC está severamente disminuida ({((activeCase.measuredFvc / activeCase.theoreticalFvc) * 100).toFixed(0)}% del teórico). Esto indica una reducción simétrica en los volúmenes pulmonares, característica de enfermedades del parénquima pulmonar (como sarcoidosis o fibrosis pulmonar intersticial). La PBD no es el estudio principal ya que no hay obstrucción de la vía aérea.
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          onClick={() => {
                            setIsEvaluated(false);
                            setEvalDiagnosis(null);
                            setEvalRatioLow(null);
                            setEvalFvcLow(null);
                            setEvalFev1Low(null);
                            setEvalPbdIndicated(null);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded-lg transition-all shadow"
                        >
                          Corregir Respuestas
                        </button>
                        <button
                          onClick={handleStartInhale}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold rounded-lg transition-all shadow"
                        >
                          Repetir Prueba
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tab-estatica"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col gap-8 max-w-4xl w-full mx-auto"
            >
              <ChartSection title="Espirograma (Volúmenes y Capacidades)" subtitle="Representación temporal de volúmenes pulmonares absolutos">
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      hide
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      domain={[0, 8]} 
                      stroke="#475569" 
                      fontSize={11}
                      tick={{ fill: '#64748b' }}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine 
                      y={currentData.lines.tlc} 
                      stroke="#94a3b8" 
                      strokeDasharray="5 5" 
                      label={{ value: 'CPT', fill: '#94a3b8', fontSize: 10, position: 'right' }} 
                    />
                    <ReferenceLine 
                      y={currentData.lines.rv} 
                      stroke="#64748b" 
                      strokeDasharray="5 5"
                      label={{ value: 'VR', fill: '#64748b', fontSize: 10, position: 'right' }} 
                    />
                    <Scatter 
                      data={currentData.spiro} 
                      line={{ stroke: currentData.theme.color, strokeWidth: 3 }}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        return <circle cx={cx} cy={cy} r={0} />;
                      }}
                      isAnimationActive
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartSection>

              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-2 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">Parámetro</th>
                      <th className="px-6 py-4 font-bold">Siglas</th>
                      <th className="px-6 py-4 font-bold text-emerald-400">Normal (Ref)</th>
                      <th className="px-6 py-4 font-bold text-white">Paciente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <TableRow label="Capacidad Pulmonar Total" short="CPT (TLC)" refVal="~ 5.9 L" val={currentData.staticCaps.tlc} />
                    <TableRow label="Capacidad Vital" short="CV (VC)" refVal="~ 4.7 L" val={currentData.staticCaps.vc} />
                    <TableRow label="Cap. Residual Funcional" short="CRF (FRC)" refVal="~ 2.4 L" val={currentData.staticCaps.frc} />
                    <TableRow label="Capacidad Inspiratoria" short="CI (IC)" refVal="~ 3.5 L" val={currentData.staticCaps.ic} />
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Dynamic CSS for Tailwind missing arbitrary colors in JS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
        .border-emerald-500\\/30 { border-color: rgba(16, 185, 129, 0.3); }
        .border-emerald-500\\/40 { border-color: rgba(16, 185, 129, 0.4); }
        .text-emerald-300 { color: #6ee7b7; }
        .bg-emerald-400 { background-color: #34d399; }
        
        .bg-rose-500\\/10 { background-color: rgba(244, 63, 94, 0.1); }
        .border-rose-500\\/30 { border-color: rgba(244, 63, 94, 0.3); }
        .border-rose-500\\/40 { border-color: rgba(244, 63, 94, 0.4); }
        .text-rose-300 { color: #fda4af; }
        .bg-rose-400 { background-color: #fb7185; }
        
        .bg-indigo-500\\/10 { background-color: rgba(99, 102, 241, 0.1); }
        .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.3); }
        .border-indigo-500\\/40 { border-color: rgba(99, 102, 241, 0.4); }
        .text-indigo-300 { color: #a5b4fc; }
        .bg-indigo-400 { background-color: #818cf8; }
      `}} />
    </div>
  );
}

function MetricItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-bold text-white font-mono">{value}</span>
    </div>
  );
}

function ChartSection({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-sm shadow-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-200 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 tracking-wide">{subtitle}</p>
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

function TableRow({ label, short, refVal, val }: { label: string, short: string, refVal: string, val: string }) {
  return (
    <tr className="hover:bg-slate-800/30 transition-colors group">
      <td className="px-6 py-4 text-xs font-semibold text-slate-300">{label}</td>
      <td className="px-6 py-4 text-xs font-mono text-slate-500">{short}</td>
      <td className="px-6 py-4 text-xs text-slate-400 opacity-60">{refVal}</td>
      <td className="px-6 py-4 text-xs font-bold text-white font-mono group-hover:text-emerald-400 transition-colors">{val}</td>
    </tr>
  );
}
