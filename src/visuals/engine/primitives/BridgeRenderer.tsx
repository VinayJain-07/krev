import React, { useState } from 'react';
import { BridgeConfig, BridgeStep } from '../types/schema';
import { Plus, Trash2, Edit3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface BridgeRendererProps {
  config: BridgeConfig;
  onChange?: (newConfig: BridgeConfig) => void;
  isEditable?: boolean;
}

function bridgeSteps(steps: BridgeStep[]) {
  let runningTotal = 0;
  return steps.map((step) => {
    const startVal = step.type === 'anchor' || step.type === 'subtotal' || step.type === 'final' ? 0 : runningTotal;
    const endVal = step.type === 'anchor' || step.type === 'subtotal' || step.type === 'final' ? step.value : runningTotal + step.value;
    runningTotal = endVal;
    return { ...step, startVal, endVal, isPositive: step.value >= 0 };
  });
}

export const BridgeRenderer: React.FC<BridgeRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedStep, setSelectedStep] = useState<BridgeStep | null>(null);

  // Calculate waterfall bar geometry
  // Running total to determine bottom/top of floating delta bars
  const computedSteps = bridgeSteps(config.steps);

  // Find max scale
  const maxVal = Math.max(...computedSteps.map((s) => Math.max(s.startVal, s.endVal))) * 1.15 || 100;

  const handleUpdateStep = (updated: BridgeStep) => {
    if (!onChange) return;
    onChange({
      ...config,
      steps: config.steps.map((s) => (s.id === updated.id ? updated : s)),
    });
    setSelectedStep(null);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6 max-w-5xl mx-auto">
      {/* Waterfall Visual Canvas */}
      <div className="w-full h-80 bg-slate-950/60 rounded-2xl border border-slate-800 p-6 flex items-end justify-between gap-3 relative shadow-2xl">
        {/* Horizontal grid lines */}
        <div className="absolute inset-x-6 top-1/4 h-px bg-slate-800/60 border-b border-dashed border-slate-800" />
        <div className="absolute inset-x-6 top-2/4 h-px bg-slate-800/60 border-b border-dashed border-slate-800" />
        <div className="absolute inset-x-6 top-3/4 h-px bg-slate-800/60 border-b border-dashed border-slate-800" />

        {computedSteps.map((step, idx) => {
          const isAnchor = step.type === 'anchor' || step.type === 'final' || step.type === 'subtotal';
          const lowerVal = Math.min(step.startVal, step.endVal);
          const heightVal = Math.abs(step.endVal - step.startVal);

          const bottomPercent = (lowerVal / maxVal) * 100;
          const heightPercent = Math.max(4, (heightVal / maxVal) * 100);

          const isPositiveDelta = step.type === 'delta-positive' || (step.value > 0 && !isAnchor);
          const isNegativeDelta = step.type === 'delta-negative' || (step.value < 0 && !isAnchor);

          const barColorClass = isAnchor
            ? 'bg-gradient-to-t from-teal-700 to-teal-500 border-teal-400'
            : isPositiveDelta
            ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 border-emerald-400'
            : 'bg-gradient-to-t from-rose-700 to-rose-500 border-rose-400';

          return (
            <div
              key={step.id}
              onClick={() => isEditable && setSelectedStep(step)}
              className="flex-1 flex flex-col items-center h-full justify-end group/bar cursor-pointer relative"
            >
              {/* Value Label above Bar */}
              <div
                className="absolute text-center whitespace-nowrap transition-transform duration-200 group-hover/bar:-translate-y-1"
                style={{
                  bottom: `${bottomPercent + heightPercent + 2}%`,
                }}
              >
                <span
                  className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded shadow-sm ${
                    isAnchor
                      ? 'text-teal-300 bg-teal-950/80 border border-teal-800/60'
                      : isPositiveDelta
                      ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
                      : 'text-rose-300 bg-rose-950/80 border border-rose-800/60'
                  }`}
                >
                  {step.value > 0 && !isAnchor ? `+` : ''}
                  {step.formattedValue || `${step.value}${config.unit || ''}`}
                </span>
              </div>

              {/* Floating or Grounded Bar */}
              <div
                className={`w-full max-w-[64px] rounded-t-lg border-t-2 shadow-lg transition-all duration-300 group-hover/bar:brightness-125 ${barColorClass}`}
                style={{
                  height: `${heightPercent}%`,
                  marginBottom: `${bottomPercent}%`,
                }}
              />

              {/* X-Axis Step Label */}
              <div className="mt-3 text-center w-full">
                <p className="text-[11px] font-bold text-slate-300 truncate group-hover/bar:text-teal-300 transition-colors">
                  {step.label}
                </p>
                {step.category && (
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                    {step.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Starting Base
          </span>
          <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
            {computedSteps[0]?.formattedValue || computedSteps[0]?.value}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/40">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            Total Expansions / Additions
          </span>
          <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
            +
            {computedSteps
              .filter((s) => s.type === 'delta-positive')
              .reduce((acc, curr) => acc + curr.value, 0)}
            {config.unit || ''}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40">
          <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
            Total Churn / Contraction
          </span>
          <div className="text-lg font-bold text-rose-300 font-mono mt-0.5">
            {computedSteps
              .filter((s) => s.type === 'delta-negative')
              .reduce((acc, curr) => acc + curr.value, 0)}
            {config.unit || ''}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-teal-900/40">
          <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">
            Ending Balance
          </span>
          <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">
            {computedSteps[computedSteps.length - 1]?.formattedValue ||
              computedSteps[computedSteps.length - 1]?.value}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Edit Waterfall Step</h3>
              <button
                onClick={() => setSelectedStep(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Step Label
              </label>
              <input
                type="text"
                value={selectedStep.label}
                onChange={(e) =>
                  setSelectedStep({ ...selectedStep, label: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Value (+ or -)
                </label>
                <input
                  type="number"
                  value={selectedStep.value}
                  onChange={(e) =>
                    setSelectedStep({
                      ...selectedStep,
                      value: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Custom Display Text
                </label>
                <input
                  type="text"
                  value={selectedStep.formattedValue || ''}
                  onChange={(e) =>
                    setSelectedStep({
                      ...selectedStep,
                      formattedValue: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedStep(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStep(selectedStep)}
                className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500 shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
