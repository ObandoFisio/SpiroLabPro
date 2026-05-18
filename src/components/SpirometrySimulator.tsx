import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line,
  ReferenceLine,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Beaker, FileText, Info, Thermometer, Wind, Youtube } from 'lucide-react';
import { SpiroPattern } from '../types';
import { DATASETS } from '../constants';
import { cn } from '../lib/utils';

type Tab = 'dinamica' | 'estatica';

export default function SpirometrySimulator() {
  const [pattern, setPattern] = useState<SpiroPattern>(SpiroPattern.NORMAL);
  const [activeTab, setActiveTab] = useState<Tab>('dinamica');

  const currentData = useMemo(() => DATASETS[pattern], [pattern]);

  const patterns = [
    { id: SpiroPattern.NORMAL, label: 'Patrón Normal', color: 'emerald' },
    { id: SpiroPattern.OBSTRUCTIVE, label: 'Obstructivo (EPOC)', color: 'rose' },
    { id: SpiroPattern.RESTRICTIVE, label: 'Restrictive (Fibrosis)', color: 'indigo' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-lg text-xs shadow-xl backdrop-blur-md">
          <p className="text-slate-400">{`X: ${payload[0].value.toFixed(2)}`}</p>
          <p className="text-white font-mono">{`Y: ${payload[1].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[95vh] md:h-[90vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto bg-slate-950">
        <header className="flex items-center justify-between mb-8">
          <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setActiveTab('dinamica')}
              className={cn(
                "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
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
                "px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300",
                activeTab === 'estatica'
                  ? "bg-slate-800 text-emerald-400 shadow-md ring-1 ring-slate-700"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              Volúmenes Estáticos
            </button>
          </div>
          
          <div className="flex items-center">
            <a 
              href="https://www.youtube.com/@ProfeX-27" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-rose-900/20 active:scale-95 group relative overflow-hidden"
            >
              <Youtube className="w-4 h-4" />
              <span>Suscríbete</span>
              <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20 group-hover:opacity-0 transition-opacity pointer-events-none" />
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
        .text-emerald-300 { color: #6ee7b7; }
        .bg-emerald-400 { background-color: #34d399; }
        
        .bg-rose-500\\/10 { background-color: rgba(244, 63, 94, 0.1); }
        .border-rose-500\\/30 { border-color: rgba(244, 63, 94, 0.3); }
        .text-rose-300 { color: #fda4af; }
        .bg-rose-400 { background-color: #fb7185; }
        
        .bg-indigo-500\\/10 { background-color: rgba(99, 102, 241, 0.1); }
        .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.3); }
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
