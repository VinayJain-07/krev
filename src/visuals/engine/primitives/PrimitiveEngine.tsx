import React from 'react';
import { CompleteFramework, FrameworkConfig } from '../types/schema';
import { MatrixRenderer } from './MatrixRenderer';
import { FunnelRenderer } from './FunnelRenderer';
import { FlowRenderer } from './FlowRenderer';
import { TreeRenderer } from './TreeRenderer';
import { MapRenderer } from './MapRenderer';
import { BridgeRenderer } from './BridgeRenderer';
import { TimeRenderer } from './TimeRenderer';
import { NetworkRenderer } from './NetworkRenderer';

interface PrimitiveEngineProps {
  framework: CompleteFramework;
  onConfigChange?: (newConfig: FrameworkConfig) => void;
  isEditable?: boolean;
}

export const PrimitiveEngine: React.FC<PrimitiveEngineProps> = ({
  framework,
  onConfigChange,
  isEditable = true,
}) => {
  const { config, meta } = framework;

  const renderPrimitive = () => {
    switch (config.primitive) {
      case 'matrix':
        return (
          <MatrixRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'funnel':
        return (
          <FunnelRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'flow':
        return (
          <FlowRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'tree':
        return (
          <TreeRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'map':
        return (
          <MapRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'bridge':
        return (
          <BridgeRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'time':
        return (
          <TimeRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      case 'network':
        return (
          <NetworkRenderer
            config={config}
            onChange={onConfigChange}
            isEditable={isEditable}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-800">
            Unknown primitive engine type
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Framework Meta Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {meta.category}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Primitive: <strong className="text-teal-300">{meta.primitive}</strong>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-50 mt-2 tracking-tight">
            {meta.name}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            {meta.description}
          </p>
        </div>

        {/* Strategic Question Callout */}
        <div className="md:max-w-xs p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
            Main Strategic Question
          </span>
          <p className="text-xs font-medium text-slate-200 mt-0.5 italic leading-snug">
            &ldquo;{meta.strategicQuestion}&rdquo;
          </p>
        </div>
      </div>

      {/* Rendered Primitive Canvas */}
      <div className="w-full">{renderPrimitive()}</div>
    </div>
  );
};
