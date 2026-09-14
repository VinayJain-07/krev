import React, { useState } from 'react';
import { TreeConfig, TreeNode } from '../types/schema';
import {
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Calculator,
  Plus,
  Trash2,
  GitBranch,
} from 'lucide-react';

interface TreeRendererProps {
  config: TreeConfig;
  onChange?: (newConfig: TreeConfig) => void;
  isEditable?: boolean;
}

export const TreeRenderer: React.FC<TreeRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateNodeRecursively = (
    current: TreeNode,
    targetId: string,
    updated: TreeNode
  ): TreeNode => {
    if (current.id === targetId) return updated;
    if (!current.children) return current;
    return {
      ...current,
      children: current.children.map((child) =>
        updateNodeRecursively(child, targetId, updated)
      ),
    };
  };

  const handleUpdateNode = (updated: TreeNode) => {
    if (!onChange) return;
    const newRoot = updateNodeRecursively(config.root, updated.id, updated);
    onChange({
      ...config,
      root: newRoot,
    });
    setSelectedNode(null);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    const isGood = node.status === 'good' || (node.change && node.change > 0);
    const isDanger = node.status === 'danger' || (node.change && node.change < 0);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => isEditable && setSelectedNode(node)}
          className="group/node relative cursor-pointer flex flex-col p-3 rounded-2xl bg-slate-900 border border-slate-700/70 hover:border-teal-400 hover:bg-slate-850 shadow-xl transition-all w-64 text-left z-10"
        >
          {/* Operator Badge (e.g. ×, +, ÷) */}
          {node.operator && (
            <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-md bg-teal-950 border border-teal-800 text-teal-300 font-mono text-[10px] font-bold shadow-md">
              {node.operator === 'branch' ? 'BRANCH' : node.operator}
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-bold text-slate-100 group-hover/node:text-teal-300 transition-colors">
              {node.label}
            </span>
            {hasChildren && (
              <button
                onClick={(e) => toggleCollapse(node.id, e)}
                className="p-1 text-slate-400 hover:text-white rounded bg-slate-800/80"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Metric Value & Target / Variance */}
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-lg font-extrabold text-teal-300 font-mono tracking-tight">
              {node.value !== undefined ? `${node.value}${node.unit || ''}` : '--'}
            </div>

            {node.change !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  isGood
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isDanger
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {node.change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {node.change > 0 ? `+${node.change}%` : `${node.change}%`}
              </span>
            )}
          </div>

          {/* Formula or Probability Note */}
          {(node.formula || node.probability !== undefined || node.target) && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              {node.formula && (
                <span className="truncate text-teal-400/80">fx: {node.formula}</span>
              )}
              {node.probability !== undefined && (
                <span className="text-amber-300">P = {node.probability * 100}%</span>
              )}
              {node.target && (
                <span className="text-slate-500">Tgt: {node.target}</span>
              )}
            </div>
          )}
        </div>

        {/* Children Tree Branch */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center mt-3">
            {/* Vertical connector from parent */}
            <div className="w-0.5 h-5 bg-teal-500/40"></div>

            {/* Sub-branches wrapper */}
            <div className="flex items-start gap-6 relative pt-3">
              {/* Horizontal top bar bridging siblings */}
              {node.children!.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-teal-500/40"
                  style={{
                    left: '50%',
                    right: '50%',
                    transform: 'translateX(-50%)',
                    width: `calc(100% - 16rem)`,
                  }}
                />
              )}

              {node.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center relative">
                  {/* Vertical connector to child */}
                  <div className="w-0.5 h-3 bg-teal-500/40 -mt-3 mb-2"></div>
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
      <div className="min-w-fit flex justify-center py-4">
        {renderNode(config.root)}
      </div>

      {/* Edit Node Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base">Edit Metric Node</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Metric Label / Name
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) =>
                  setSelectedNode({ ...selectedNode, label: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={selectedNode.value !== undefined ? selectedNode.value : ''}
                  onChange={(e) =>
                    setSelectedNode({ ...selectedNode, value: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Unit (e.g. $, %, k)
                </label>
                <input
                  type="text"
                  value={selectedNode.unit || ''}
                  onChange={(e) =>
                    setSelectedNode({ ...selectedNode, unit: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  % YoY Change
                </label>
                <input
                  type="number"
                  value={selectedNode.change !== undefined ? selectedNode.change : 0}
                  onChange={(e) =>
                    setSelectedNode({
                      ...selectedNode,
                      change: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Formula / Operator
                </label>
                <input
                  type="text"
                  value={selectedNode.formula || selectedNode.operator || ''}
                  onChange={(e) =>
                    setSelectedNode({ ...selectedNode, formula: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateNode(selectedNode)}
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
