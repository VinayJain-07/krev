import React, { useId, useRef, useState } from 'react';
import { MatrixConfig, MatrixItem } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';

interface MatrixRendererProps {
  config: MatrixConfig;
  onChange?: (newConfig: MatrixConfig) => void;
  isEditable?: boolean;
}

export const MatrixRenderer: React.FC<MatrixRendererProps> = ({
  config,
  onChange,
  isEditable = true,
}) => {
  const [selectedItem, setSelectedItem] = useState<MatrixItem | null>(null);
  const [activeQuadrantId, setActiveQuadrantId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const instanceId = useId();
  const nextItem = useRef(0);

  const handleAddItem = (quadrantId: string) => {
    if (!newItemText.trim() || !onChange) return;
    const newItem: MatrixItem = {
      id: `item-${instanceId}-${++nextItem.current}`,
      label: newItemText.trim(),
      quadrantId,
      status: 'neutral',
    };
    onChange({
      ...config,
      items: [...config.items, newItem],
    });
    setNewItemText('');
    setActiveQuadrantId(null);
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    onChange({
      ...config,
      items: config.items.filter((i) => i.id !== itemId),
    });
  };

  const handleUpdateItem = (updated: MatrixItem) => {
    if (!onChange) return;
    onChange({
      ...config,
      items: config.items.map((i) => (i.id === updated.id ? updated : i)),
    });
    setSelectedItem(null);
  };

  const isTableMatrix = config.gridType === 'table-matrix';

  if (isTableMatrix && config.rowHeaders && config.colHeaders) {
    return (
      <div className="w-full overflow-x-auto p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="pb-3 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Workstream / Task
              </th>
              {config.colHeaders.map((col, idx) => (
                <th
                  key={idx}
                  className="pb-3 text-[11px] font-mono uppercase tracking-wider text-teal-400 text-center"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {config.rowHeaders.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3 text-xs font-medium text-slate-200">{row}</td>
                {config.colHeaders!.map((col, cIdx) => {
                  const item = config.items.find(
                    (i) => i.customFields?.row === row && i.customFields?.col === col
                  );
                  const val = item?.badge || item?.label || '-';
                  return (
                    <td key={cIdx} className="py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-mono font-bold text-xs ${
                          val === 'R'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : val === 'A'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : val === 'C'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : val === 'I'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'text-slate-600'
                        }`}
                      >
                        {val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const gridColsClass =
    config.cols === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : config.cols === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Grid Canvas with Minimal Swiss Cards */}
      <div className={`w-full grid ${gridColsClass} gap-4 relative`}>
        {config.quadrants.map((quadrant) => {
          const quadItems = config.items.filter((i) => i.quadrantId === quadrant.id);
          const isAdding = activeQuadrantId === quadrant.id;

          return (
            <div
              key={quadrant.id}
              className="flex flex-col rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all p-5 min-h-[220px] relative group"
            >
              {/* Minimal Accent Indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: quadrant.accent || '#14b8a6' }}
                  />
                  <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                    {quadrant.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {quadItems.length}
                </span>
              </div>

              {quadrant.subtitle && (
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  {quadrant.subtitle}
                </p>
              )}

              {/* Items List */}
              <div className="space-y-2 flex-1">
                {quadItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => isEditable && setSelectedItem(item)}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer group/item flex items-start justify-between gap-2"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-200 leading-snug">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-400 mt-1 leading-normal">
                          {item.description}
                        </div>
                      )}
                      {item.badge && (
                        <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-teal-300 border border-slate-700/60">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {isEditable && (
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Delete item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add Item Action */}
                {isEditable && !isAdding && (
                  <button
                    onClick={() => {
                      setActiveQuadrantId(quadrant.id);
                      setNewItemText('');
                    }}
                    className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-teal-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                )}

                {isEditable && isAdding && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 space-y-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter item text..."
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem(quadrant.id);
                        if (e.key === 'Escape') setActiveQuadrantId(null);
                      }}
                      className="w-full bg-slate-900 text-xs text-slate-100 rounded px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-teal-500 font-sans"
                    />
                    <div className="flex items-center justify-end gap-2 text-[11px]">
                      <button
                        onClick={() => setActiveQuadrantId(null)}
                        className="px-2 py-1 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddItem(quadrant.id)}
                        className="px-2.5 py-1 rounded bg-teal-600 text-white font-medium hover:bg-teal-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Footer Indicator */}
      {(config.xAxis || config.yAxis) && (
        <div className="mt-4 flex items-center justify-between w-full max-w-md px-4 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          <span>{config.xAxis?.lowLabel || 'Low'}</span>
          <span className="text-teal-400/80 font-bold">{config.xAxis?.label}</span>
          <span>{config.xAxis?.highLabel || 'High'}</span>
        </div>
      )}

      {/* Edit Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Edit Item</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Headline
              </label>
              <input
                type="text"
                value={selectedItem.label}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, label: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Context & Notes
              </label>
              <textarea
                rows={3}
                value={selectedItem.description || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, description: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Tag / Metric Badge
              </label>
              <input
                type="text"
                value={selectedItem.badge || ''}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, badge: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateItem(selectedItem)}
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
