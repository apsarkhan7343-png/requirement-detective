import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info,
  Sliders,
} from 'lucide-react';
import { Project, DependencyNode } from '../../types';
import { INITIAL_DEPENDENCY_NODES } from '../../data/mockData';

interface DependencyGraphViewProps {
  activeProject: Project;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({ activeProject }) => {
  const [nodes, setNodes] = useState<DependencyNode[]>(INITIAL_DEPENDENCY_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-auth');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Architecture Dependency Graph
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            {nodes.length} Module Nodes
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Interactive map of module prerequisites and data flows to diagnose blocking architecture paths and cascade failures.
        </p>
      </div>

      {/* Main Graph & Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8-col: Interactive Nodes Layout */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Module Flow Architecture
            </span>
            <span className="text-[11px] text-slate-400">Click any module to inspect dependencies</span>
          </div>

          {/* Graphical Flow Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 my-auto">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const hasRisk = node.status === 'At Risk' || node.status === 'Blocked';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-200/70 text-slate-700">
                      {node.category}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === 'Healthy'
                          ? 'bg-emerald-500'
                          : node.status === 'At Risk'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{node.label}</h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{node.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Deps: {node.dependencies.length}</span>
                    <span className="font-semibold text-indigo-600">Inspect &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Healthy (4)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> At Risk (2)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">All data channels encrypted via mTLS</span>
          </div>
        </div>

        {/* Right 4-col: Selected Node Inspector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Module Inspector
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedNode.status === 'Healthy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 mb-1">{selectedNode.label}</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">{selectedNode.description}</p>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Direct Prerequisites:
                </span>
                {selectedNode.dependencies.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedNode.dependencies.map((depId) => {
                      const dep = nodes.find((n) => n.id === depId);
                      return (
                        <div
                          key={depId}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between"
                        >
                          <span className="font-semibold">{dep?.label || depId}</span>
                          <span className="text-[10px] font-mono text-slate-400">{dep?.category}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Root architecture module (no prerequisites)</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs">
              <span className="font-bold text-indigo-950 block mb-0.5">Blast Radius:</span>
              <p className="text-indigo-900 text-[11px]">
                Failure in this node impacts 3 downstream services. Circuit breakers active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
