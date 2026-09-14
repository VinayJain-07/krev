import React, { useState } from 'react';
import { FlowConfig, FlowStep } from '../types/schema';
import {
  Smile,
  Meh,
  Frown,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface FlowRendererProps {
  config: FlowConfig;
  onChange?: (newConfig: FlowConfig) => void;
  isEditable?: boolean;
}

export const FlowRenderer: React.FC<FlowRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedStep, setSelectedStep] = useState<FlowStep | null>(null);

  const handleUpdateStep = (updated: FlowStep) => {
    if (!onChange) return;
    onChange({
      ...config,
      steps: config.steps.map((s) => (s.id === updated.id ? updated : s)),
    });
    setSelectedStep(null);
  };

  const handleDeleteStep = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange({
      ...config,
      steps: config.steps.filter((s) => s.id !== stepId),
    });
  };

  const getSentimentIcon = (sentiment?: number) => {
    if (sentiment === undefined) return null;
    if (sentiment > 1) return <Smile className="w-4 h-4 text-emerald-400" />;
    if (sentiment < -1) return <Frown className="w-4 h-4 text-rose-400" />;
    return <Meh className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Phases Chevron / Progress Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {config.phases.map((phase, idx) => {
          return (
            <div
              key={phase.id}
              className="relative p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-2.5 overflow-hidden"
              style={{
                borderTop: `3px solid ${phase.color || '#14b8a6'}`,
              }}
            >
              <span
                className="w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${phase.color || '#14b8a6'}25`,
                  color: phase.color || '#14b8a6',
                }}
              >
                0{idx + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100 truncate">
                  {phase.name}
                </h4>
                {phase.description && (
                  <p className="text-[10px] text-slate-400 truncate">
                    {phase.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Swimlane Grid Table */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md p-4">
        <div className="space-y-4" style={{ minWidth: Math.max(640, config.phases.length * 210) }}>
          {/* Steps Timeline Track */}
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, config.phases.length)}, minmax(0, 1fr))` }}>
            {config.phases.map((phase) => {
              const phaseSteps = config.steps.filter((s) => s.phaseId === phase.id);
              return (
                <div key={phase.id} className="space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                    <span>{phase.name}</span>
                    <span className="text-[10px] font-mono text-teal-400">
                      {phaseSteps.length} steps
                    </span>
                  </div>

                  {phaseSteps.map((step) => (
                    <div
                      key={step.id}
                      onClick={() => isEditable && setSelectedStep(step)}
                      className="group/card cursor-pointer p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-teal-500/50 hover:bg-slate-800 transition-all shadow-md space-y-2.5"
                    >
                      {/* Step Header & Sentiment */}
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-200 group-hover/card:text-teal-300 transition-colors">
                          {step.title}
                        </h5>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {getSentimentIcon(step.sentiment)}
                          {isEditable && (
                            <button
                              onClick={(e) => handleDeleteStep(step.id, e)}
                              className="opacity-0 group-hover/card:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Customer Action / Frontstage */}
                      {step.customerAction && (
                        <div className="text-[11px] text-slate-300 bg-slate-900/60 rounded-lg p-2 border border-slate-800">
                          <strong className="text-[10px] text-teal-400 uppercase tracking-wider block mb-0.5">
                            Customer Action
                          </strong>
                          {step.customerAction}
                        </div>
                      )}

                      {/* Touchpoints */}
                      {step.touchpoints && step.touchpoints.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {step.touchpoints.map((tp, tpIdx) => (
                            <span
                              key={tpIdx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700/50"
                            >
                              📍 {tp}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Pain Points */}
                      {step.painPoints && step.painPoints.length > 0 && (
                        <div className="space-y-1">
                          {step.painPoints.map((pp, ppIdx) => (
                            <div
                              key={ppIdx}
                              className="flex items-start gap-1.5 text-[10px] text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded px-2 py-1"
                            >
                              <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />
                              <span>{pp}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Opportunities */}
                      {step.opportunities && step.opportunities.length > 0 && (
                        <div className="space-y-1">
                          {step.opportunities.map((opp, oppIdx) => (
                            <div
                              key={oppIdx}
                              className="flex items-start gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/30 border border-emerald-900/40 rounded px-2 py-1"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>{opp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Step Modal */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Edit Journey Step</h3>
              <button
                onClick={() => setSelectedStep(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Step Title
              </label>
              <input
                type="text"
                value={selectedStep.title}
                onChange={(e) =>
                  setSelectedStep({ ...selectedStep, title: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Customer Action / What happens?
              </label>
              <textarea
                rows={2}
                value={selectedStep.customerAction || ''}
                onChange={(e) =>
                  setSelectedStep({
                    ...selectedStep,
                    customerAction: e.target.value,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Customer Sentiment Score (-5 to +5)
              </label>
              <input
                type="number"
                min={-5}
                max={5}
                value={selectedStep.sentiment || 0}
                onChange={(e) =>
                  setSelectedStep({
                    ...selectedStep,
                    sentiment: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
              />
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
