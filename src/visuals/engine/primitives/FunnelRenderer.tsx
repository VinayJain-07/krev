import React, { useState } from 'react';
import { FunnelConfig, FunnelStage } from '../types/schema';
import { ArrowDown, Clock, TrendingDown, Percent, Plus, Trash2, Edit3 } from 'lucide-react';

interface FunnelRendererProps {
  config: FunnelConfig;
  onChange?: (newConfig: FunnelConfig) => void;
  isEditable?: boolean;
}

export const FunnelRenderer: React.FC<FunnelRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);

  const totalTopStageValue = config.stages[0]?.value || 1;

  const handleUpdateStage = (updated: FunnelStage) => {
    if (!onChange) return;
    onChange({
      ...config,
      stages: config.stages.map((s) => (s.id === updated.id ? updated : s)),
    });
    setSelectedStage(null);
  };

  const handleAddStage = () => {
    if (!onChange) return;
    const lastStage = config.stages[config.stages.length - 1];
    const newStage: FunnelStage = {
      id: `stage-${Date.now()}`,
      name: 'New Funnel Stage',
      value: Math.round((lastStage?.value || 1000) * 0.7),
      conversionRate: 70,
      dropoffRate: 30,
      velocityDays: 5,
      color: '#38bdf8',
    };
    onChange({
      ...config,
      stages: [...config.stages, newStage],
    });
  };

  const handleDeleteStage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange || config.stages.length <= 2) return;
    onChange({
      ...config,
      stages: config.stages.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="w-full flex flex-col items-center max-w-4xl mx-auto space-y-4">
      {/* Funnel Container */}
      <div className="w-full space-y-3">
        {config.stages.map((stage, idx) => {
          const prevStage = idx > 0 ? config.stages[idx - 1] : null;
          const stageConversion = prevStage
            ? ((stage.value / prevStage.value) * 100).toFixed(1)
            : '100';
          const totalConversion = ((stage.value / totalTopStageValue) * 100).toFixed(1);
          const dropoffCount = prevStage ? prevStage.value - stage.value : 0;
          const dropoffPercent = prevStage
            ? ((dropoffCount / prevStage.value) * 100).toFixed(1)
            : '0';

          // Trapezoid Width percentage calculation
          // Calculate proportional width from top stage down
          const widthPercent = Math.max(
            35,
            Math.min(100, (stage.value / totalTopStageValue) * 100 * 0.7 + 30)
          );

          return (
            <div key={stage.id} className="relative group/stage">
              {/* Connector Dropoff indicator between stages */}
              {idx > 0 && config.options?.showDropoff !== false && (
                <div className="flex items-center justify-center my-1">
                  <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px] font-mono shadow-sm">
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                    <span>
                      Drop-off: <strong>{dropoffPercent}%</strong> (
                      {dropoffCount.toLocaleString()} {config.unit || 'leads'})
                    </span>
                    {stage.velocityDays && config.options?.showVelocity !== false && (
                      <span className="flex items-center gap-1 text-slate-400 border-l border-rose-800/50 pl-2">
                        <Clock className="w-2.5 h-2.5" /> {stage.velocityDays}d avg
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Funnel Stage Card */}
              <div
                className="mx-auto transition-all duration-300 transform hover:scale-[1.01]"
                style={{ width: `${widthPercent}%` }}
              >
                <div
                  onClick={() => isEditable && setSelectedStage(stage)}
                  className="cursor-pointer rounded-2xl p-4 bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700/70 hover:border-teal-400/60 shadow-xl relative overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${stage.color || '#14b8a6'}`,
                  }}
                >
                  {/* Subtle stage background glow */}
                  <div
                    className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: stage.color || '#14b8a6' }}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-teal-300 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm tracking-wide">
                          {stage.name}
                        </h4>
                      </div>
                      {stage.keyActions && stage.keyActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {stage.keyActions.map((action, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-base font-extrabold text-teal-300 font-mono">
                          {stage.formattedValue ||
                            `${stage.value.toLocaleString()} ${config.unit || ''}`}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {idx === 0 ? (
                            'Top of Funnel'
                          ) : (
                            <span className="text-emerald-400">
                              {stageConversion}% conv. (from prev)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cumulative Total Pill */}
                      <div className="hidden sm:flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                        <span className="text-[10px] text-slate-400">Total %</span>
                        <span className="font-bold text-slate-200">{totalConversion}%</span>
                      </div>

                      {isEditable && config.stages.length > 2 && (
                        <button
                          onClick={(e) => handleDeleteStage(stage.id, e)}
                          className="opacity-0 group-hover/stage:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 transition-opacity rounded-lg hover:bg-slate-800"
                          title="Delete stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Stage Button */}
      {isEditable && (
        <button
          onClick={handleAddStage}
          className="mt-4 px-4 py-2 rounded-xl border border-dashed border-slate-700 hover:border-teal-500 hover:bg-teal-950/20 text-slate-300 hover:text-teal-300 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Funnel Stage
        </button>
      )}

      {/* Edit Stage Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Edit Stage</h3>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Stage Name
              </label>
              <input
                type="text"
                value={selectedStage.name}
                onChange={(e) =>
                  setSelectedStage({ ...selectedStage, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Volume / Count
                </label>
                <input
                  type="number"
                  value={selectedStage.value}
                  onChange={(e) =>
                    setSelectedStage({
                      ...selectedStage,
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
                  placeholder="e.g. $450k MRR"
                  value={selectedStage.formattedValue || ''}
                  onChange={(e) =>
                    setSelectedStage({
                      ...selectedStage,
                      formattedValue: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Avg Velocity (Days)
                </label>
                <input
                  type="number"
                  value={selectedStage.velocityDays || 0}
                  onChange={(e) =>
                    setSelectedStage({
                      ...selectedStage,
                      velocityDays: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Stage Theme Color
                </label>
                <input
                  type="text"
                  value={selectedStage.color || '#14b8a6'}
                  onChange={(e) =>
                    setSelectedStage({ ...selectedStage, color: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStage(selectedStage)}
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
