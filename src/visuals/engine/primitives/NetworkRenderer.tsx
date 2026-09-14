import React, { useState } from 'react';
import { NetworkConfig, NetworkNode, NetworkEdge } from '../types/schema';
import {
  RefreshCw,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Plus,
} from 'lucide-react';

interface NetworkRendererProps {
  config: NetworkConfig;
  onChange?: (newConfig: NetworkConfig) => void;
  isEditable?: boolean;
}

export const NetworkRenderer: React.FC<NetworkRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Check if this is Porter's Five Forces
  const isPorters = config.networkType === 'porters-5-forces';

  if (isPorters) {
    // Layout: Center industry rivalry with 4 surrounding force boxes
    const centerNode = config.nodes.find((n) => n.id === 'rivalry') || config.nodes[0];
    const topNode = config.nodes.find((n) => n.id === 'new-entrants') || config.nodes[1];
    const bottomNode = config.nodes.find((n) => n.id === 'substitutes') || config.nodes[2];
    const leftNode = config.nodes.find((n) => n.id === 'supplier-power') || config.nodes[3];
    const rightNode = config.nodes.find((n) => n.id === 'buyer-power') || config.nodes[4];

    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
        <div className="relative w-full max-w-3xl grid grid-cols-3 grid-rows-3 gap-4 items-center justify-items-center">
          {/* Top: Threat of New Entrants */}
          <div className="col-start-2 row-start-1 w-full">
            {topNode && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/40 text-center shadow-lg hover:border-teal-400 transition-all">
                <span className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                  Threat of
                </span>
                <h4 className="font-bold text-slate-100 text-xs">{topNode.label}</h4>
                <div className="text-teal-400 text-xs mt-1">▼ High Pressure</div>
              </div>
            )}
          </div>

          {/* Left: Supplier Power */}
          <div className="col-start-1 row-start-2 w-full">
            {leftNode && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 text-center shadow-lg hover:border-indigo-400 transition-all">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                  Bargaining Power
                </span>
                <h4 className="font-bold text-slate-100 text-xs">{leftNode.label}</h4>
                <div className="text-indigo-400 text-xs mt-1">Moderate ▶</div>
              </div>
            )}
          </div>

          {/* Center: Industry Rivalry */}
          <div className="col-start-2 row-start-2 w-full">
            {centerNode && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border-2 border-teal-400 text-center shadow-2xl ring-4 ring-teal-500/20">
                <ShieldAlert className="w-6 h-6 text-teal-300 mx-auto mb-1.5" />
                <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                  Industry Center
                </span>
                <h3 className="font-extrabold text-slate-50 text-sm mt-0.5">
                  {centerNode.label}
                </h3>
              </div>
            )}
          </div>

          {/* Right: Buyer Power */}
          <div className="col-start-3 row-start-2 w-full">
            {rightNode && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center shadow-lg hover:border-emerald-400 transition-all">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Bargaining Power
                </span>
                <h4 className="font-bold text-slate-100 text-xs">{rightNode.label}</h4>
                <div className="text-emerald-400 text-xs mt-1">◀ High Pressure</div>
              </div>
            )}
          </div>

          {/* Bottom: Substitutes */}
          <div className="col-start-2 row-start-3 w-full">
            {bottomNode && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/40 text-center shadow-lg hover:border-rose-400 transition-all">
                <div className="text-rose-400 text-xs mb-1">▲ Moderate Threat</div>
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">
                  Threat of
                </span>
                <h4 className="font-bold text-slate-100 text-xs">{bottomNode.label}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Causal Loop / Feedback Loop Diagram
  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Central Feedback Engine Loop */}
      <div className="relative w-full max-w-3xl aspect-[16/9] bg-slate-950/70 rounded-2xl border border-slate-800 p-6 flex items-center justify-center shadow-2xl overflow-hidden">
        {/* Central Engine Badge */}
        <div className="z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-slate-900/95 border-2 border-teal-500/80 shadow-2xl p-3 text-center">
          <RefreshCw className="w-6 h-6 text-teal-400 animate-spin-slow mb-1" />
          <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
            {config.loops?.[0]?.type === 'reinforcing' ? 'Reinforcing (R)' : 'Balancing (B)'}
          </span>
          <span className="text-xs font-bold text-slate-100 mt-0.5">
            {config.loops?.[0]?.label || 'Flywheel Loop'}
          </span>
        </div>

        {/* Nodes positioned along circular orbital ring */}
        {config.nodes.map((node, idx) => {
          const total = config.nodes.length;
          const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
          const radiusPercent = 38; // distance from center
          const leftPercent = 50 + radiusPercent * Math.cos(angle);
          const topPercent = 50 + radiusPercent * Math.sin(angle);

          return (
            <div
              key={node.id}
              onClick={() => isEditable && setSelectedNode(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/node transition-transform hover:scale-110"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
            >
              <div
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-teal-400 shadow-xl max-w-[160px] text-center"
                style={{
                  borderTop: `3px solid ${node.color || '#14b8a6'}`,
                }}
              >
                <span className="text-xs font-bold text-slate-100 block">
                  {node.label}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">
                  ● {node.type || 'Driver'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Causal Edges / Connections List */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3">
        {config.edges.map((edge) => {
          const sourceNode = config.nodes.find((n) => n.id === edge.source);
          const targetNode = config.nodes.find((n) => n.id === edge.target);
          return (
            <div
              key={edge.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <span className="text-teal-400 font-bold">{sourceNode?.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-100">{targetNode?.label}</span>
              </div>
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  edge.polarity === '+'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {edge.polarity === '+' ? '(+) Same dir' : '(-) Inverse'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
