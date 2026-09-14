import React, { useState } from 'react';
import { MapConfig, MapEntity, ConcentricRing } from '../types/schema';
import { Plus, Trash2, Edit3, Target, Crosshair, Users, DollarSign } from 'lucide-react';

interface MapRendererProps {
  config: MapConfig;
  onChange?: (newConfig: MapConfig) => void;
  isEditable?: boolean;
}

export const MapRenderer: React.FC<MapRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [selectedRing, setSelectedRing] = useState<ConcentricRing | null>(null);

  // Check if this is a concentric ring model (e.g. TAM/SAM/SOM)
  if (config.mapType === 'concentric-rings' && config.rings) {
    return (
      <div className="w-full flex flex-col items-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-5xl">
          {/* Concentric Rings Visual SVG */}
          <div className="lg:col-span-6 flex justify-center items-center py-4">
            <div className="relative w-[340px] h-[340px] flex items-center justify-center">
              {config.rings.map((ring, idx) => {
                // Outer ring largest, inner smallest
                const sizePx = 340 - idx * 75;
                const isHovered = selectedRing?.id === ring.id;
                return (
                  <div
                    key={ring.id}
                    onClick={() => setSelectedRing(ring)}
                    className="absolute rounded-full flex flex-col items-center justify-start pt-3 cursor-pointer transition-all duration-300 shadow-2xl border-2"
                    style={{
                      width: `${sizePx}px`,
                      height: `${sizePx}px`,
                      backgroundColor: `${ring.color}${idx === 0 ? '15' : idx === 1 ? '30' : '55'}`,
                      borderColor: ring.color,
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 shadow-sm"
                      style={{ color: ring.color }}
                    >
                      {ring.label}
                    </span>
                    <span className="text-xs font-extrabold text-white mt-1 font-mono">
                      {ring.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ring Breakdown Details Panel */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Market Opportunity Breakdown
            </h4>
            {config.rings.map((ring, idx) => {
              const isSelected = selectedRing?.id === ring.id;
              return (
                <div
                  key={ring.id}
                  onClick={() => setSelectedRing(ring)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-teal-400 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    borderLeft: `4px solid ${ring.color}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {ring.label}
                        </span>
                        {ring.subLabel && (
                          <span className="text-[11px] text-slate-400">
                            ({ring.subLabel})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{ring.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-extrabold text-teal-300 font-mono">
                        {ring.value}
                      </span>
                      {ring.percentageOfTAM && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {ring.percentageOfTAM}% of TAM
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Perceptual Positioning Scatter / Competitor Grid
  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* 2D Positioning Canvas */}
      <div className="relative w-full max-w-3xl aspect-[16/10] bg-slate-950/80 rounded-2xl border border-slate-800 shadow-2xl p-6 overflow-hidden select-none">
        {/* Center Crosshair Axes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-slate-800/90 border-b border-dashed border-slate-700/60" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-px bg-slate-800/90 border-r border-dashed border-slate-700/60" />
        </div>

        {/* Axis Labels */}
        {config.yAxis && (
          <>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-teal-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 shadow">
              ▲ {config.yAxis.maxLabel || config.yAxis.label}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 shadow">
              ▼ {config.yAxis.minLabel}
            </div>
          </>
        )}

        {config.xAxis && (
          <>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-teal-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 shadow">
              {config.xAxis.maxLabel || config.xAxis.label} ▶
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 shadow">
              ◀ {config.xAxis.minLabel}
            </div>
          </>
        )}

        {/* Competitor / Brand Entities Placed on 0-100 coordinates */}
        {config.entities?.map((entity) => {
          const posX = entity.x !== undefined ? entity.x : 50;
          const posY = entity.y !== undefined ? 100 - entity.y : 50; // invert Y for SVG Cartesian
          const sizePx = entity.size ? Math.max(28, entity.size * 1.5) : 36;
          const isSelf = entity.isSelf;

          return (
            <div
              key={entity.id}
              onClick={() => isEditable && setSelectedEntity(entity)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/entity transition-transform duration-200 hover:scale-125 z-20"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
              }}
            >
              <div
                className={`rounded-full flex items-center justify-center font-bold text-xs shadow-xl border-2 transition-all ${
                  isSelf
                    ? 'bg-teal-500 text-slate-950 border-white ring-4 ring-teal-500/30'
                    : 'bg-slate-800 text-slate-100 border-slate-600 hover:border-teal-400'
                }`}
                style={{
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  backgroundColor: entity.color || (isSelf ? '#14b8a6' : '#334155'),
                }}
              >
                {entity.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Entity Tooltip / Label */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/entity:flex flex-col items-center bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 shadow-2xl whitespace-nowrap z-30 pointer-events-none">
                <span className="font-bold text-teal-300">{entity.name}</span>
                {entity.notes && <span className="text-[10px] text-slate-400">{entity.notes}</span>}
                <span className="text-[9px] text-slate-500 font-mono">
                  (X: {entity.x}, Y: {entity.y})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Entity List */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-2 pt-2">
        {config.entities?.map((ent) => (
          <button
            key={ent.id}
            onClick={() => setSelectedEntity(ent)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-xs text-slate-300 shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: ent.color || '#14b8a6' }}
            />
            <span className={ent.isSelf ? 'font-bold text-teal-300' : ''}>
              {ent.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
