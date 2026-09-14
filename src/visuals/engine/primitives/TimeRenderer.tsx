import React, { useState } from 'react';
import { TimeConfig, HorizonTrack, CohortRow } from '../types/schema';
import {
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';

interface TimeRendererProps {
  config: TimeConfig;
  onChange?: (newConfig: TimeConfig) => void;
  isEditable?: boolean;
}

export const TimeRenderer: React.FC<TimeRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  // Check if this is a Cohort Retention Heatmap
  if (config.timeType === 'cohort-retention' && config.cohortData) {
    const { periods, rows } = config.cohortData;

    // Helper to get color intensity based on retention percentage (0 - 100)
    const getCohortColor = (rate: number) => {
      if (rate >= 90) return 'bg-emerald-500/80 text-emerald-950 font-extrabold';
      if (rate >= 75) return 'bg-emerald-600/60 text-white font-bold';
      if (rate >= 55) return 'bg-teal-700/60 text-slate-100 font-medium';
      if (rate >= 40) return 'bg-teal-800/40 text-slate-200';
      if (rate >= 25) return 'bg-slate-800/80 text-slate-300';
      if (rate > 0) return 'bg-slate-900/90 text-slate-400';
      return 'bg-slate-950 text-slate-600';
    };

    return (
      <div className="w-full flex flex-col space-y-4">
        <div className="overflow-x-auto p-4 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40">
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cohort
                </th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                  Users
                </th>
                {periods.map((p, idx) => (
                  <th
                    key={idx}
                    className="p-3 text-xs font-semibold text-teal-400 uppercase tracking-wider text-center"
                  >
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-3 text-xs font-bold text-slate-200 font-mono">
                    {row.cohort}
                  </td>
                  <td className="p-3 text-xs text-slate-400 text-right font-mono">
                    {row.userCount.toLocaleString()}
                  </td>
                  {row.retentionRates.map((rate, cIdx) => (
                    <td key={cIdx} className="p-1.5 text-center">
                      <div
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-mono transition-transform hover:scale-105 ${getCohortColor(
                          rate
                        )}`}
                      >
                        {rate > 0 ? `${rate}%` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-end gap-3 text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider">Retention Strength:</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
            &lt; 25%
          </span>
          <span className="px-2 py-0.5 rounded bg-teal-800/50 text-slate-200 text-[10px]">
            40% - 70%
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-emerald-950 font-bold text-[10px]">
            &gt; 90%
          </span>
        </div>
      </div>
    );
  }

  // McKinsey Three Horizons of Growth Framework
  return (
    <div className="w-full flex flex-col space-y-6">
      {/* 3 Horizon Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {config.horizons?.map((horizon, idx) => {
          return (
            <div
              key={horizon.id}
              className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden"
              style={{
                borderTop: `4px solid ${horizon.color}`,
              }}
            >
              {/* Horizon Header */}
              <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: horizon.color }}
                    />
                    <h3 className="font-extrabold text-slate-100 text-sm">
                      {horizon.horizon}
                    </h3>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-mono text-teal-300">
                    ⏱ {horizon.timeframe}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{horizon.focus}</p>
                </div>
              </div>

              {/* Initiatives List */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[360px]">
                {horizon.initiatives.map((item) => {
                  const isHigh = item.impact === 'high';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-teal-500/50 hover:bg-slate-800 transition-all shadow-md group/init space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200 group-hover/init:text-teal-300 transition-colors">
                          {item.title}
                        </span>
                        {item.quarter && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 flex-shrink-0">
                            {item.quarter}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isHigh
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {item.impact.toUpperCase()} IMPACT
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono capitalize">
                          ● {item.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
