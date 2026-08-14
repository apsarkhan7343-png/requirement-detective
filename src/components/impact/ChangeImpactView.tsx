import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  AlertTriangle,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import { Project, ChangeImpactResult } from '../../types';
import { changeImpactApi } from '../../lib/api';

interface ChangeImpactViewProps {
  activeProject: Project;
}

export const ChangeImpactView: React.FC<ChangeImpactViewProps> = ({ activeProject }) => {
  const [oldReq, setOldReq] = useState(
    'Users can cancel orders anytime without restriction and receive instant store credit.'
  );
  const [newReq, setNewReq] = useState(
    'Users can only cancel orders while in Pending or Processing status. Once Dispatched, users must initiate an RMA return request.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [impactResult, setImpactResult] = useState<ChangeImpactResult | null>({
    impactScore: 68,
    impactLevel: 'MEDIUM',
    summary:
      'Transitioning from unrestricted cancellation to state-machine gated RMA returns limits warehouse race conditions but requires database status enum migration and webhook hooks for 3PL logistics carriers.',
    affectedModules: [
      {
        name: 'Order State Machine',
        riskLevel: 'High',
        impactPercentage: 85,
        reason: 'Order status flow requires immutable transition guards (Dispatched -> Cancelled forbidden).',
        requiredChanges: ['Add RMA request table', 'Lock status column after warehouse label generation'],
      },
      {
        name: 'Payment & Refund Gateway',
        riskLevel: 'Medium',
        impactPercentage: 60,
        reason: 'Instant store credit refund logic must be decoupled from cancellation trigger.',
        requiredChanges: ['Update Stripe webhook handler', 'Add escrow release delay'],
      },
      {
        name: 'Storefront UI / Mobile App',
        riskLevel: 'Low',
        impactPercentage: 40,
        reason: 'Disable Cancel button when order reaches Dispatched state.',
        requiredChanges: ['Add conditional CTA button', 'Display RMA return modal'],
      },
    ],
    breakingChanges: [
      'API endpoint DELETE /api/v1/orders/{id} now returns 409 Conflict if order is already Dispatched.',
      'Database status enum update: addition of `RMA_REQUESTED` and `RETURN_PROCESSING`.',
    ],
    databaseImpact: [
      'Migration required: `ALTER TABLE orders ADD COLUMN rma_status VARCHAR(32);`',
      'Index addition on `(order_id, status)` for high-throughput locking.',
    ],
    regressionRisks: [
      'Third-party warehouse fulfillment automated polling might desync on cancelled orders.',
      'Legacy mobile apps (<v3.1) might still display active cancellation button.',
    ],
    recommendedActions: [
      'Deprecate synchronous DELETE endpoint and replace with POST /api/v1/orders/{id}/cancel-request.',
      'Run end-to-end regression tests on 3PL warehouse webhook mocks.',
      'Notify mobile engineering team to implement RMA UI flows.',
    ],
  });

  const handleRunImpactAnalysis = async () => {
    if (!oldReq.trim() || !newReq.trim()) return;
    setIsLoading(true);
    try {
      const res = await changeImpactApi({
        oldRequirement: oldReq,
        newRequirement: newReq,
        projectContext: activeProject.description,
      });
      if (res && res.data) {
        setImpactResult(res.data);
      }
    } catch (err) {
      console.error('Impact analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Change Impact Analysis Engine
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
            Ripple Effect & Blast Radius
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">
          Analyze the downstream blast radius of modifying requirements across database schemas, APIs, and regression test suites.
        </p>
      </div>

      {/* Before / After Requirement Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Requirement */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Current Requirement (Baseline)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
              OLD REVISION
            </span>
          </div>
          <textarea
            rows={3}
            value={oldReq}
            onChange={(e) => setOldReq(e.target.value)}
            className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Proposed Requirement */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Proposed New Requirement (Delta)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
              NEW REVISION
            </span>
          </div>
          <textarea
            rows={3}
            value={newReq}
            onChange={(e) => setNewReq(e.target.value)}
            className="w-full p-3 text-xs font-mono bg-indigo-50/40 border border-indigo-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleRunImpactAnalysis}
        disabled={isLoading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Computing Dependency Blast Radius...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Calculate Change Impact & Blast Radius</span>
          </>
        )}
      </button>

      {/* Impact Result Output */}
      {impactResult && (
        <div className="space-y-6">
          {/* Executive Impact Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Impact Evaluation Summary
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Blast Radius: {impactResult.impactLevel} Severity
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 font-mono">
                  Impact Score: {impactResult.impactScore}/100
                </span>
                <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${impactResult.impactScore}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {impactResult.summary}
            </p>
          </div>

          {/* Affected Modules Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impactResult.affectedModules.map((mod, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{mod.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      mod.riskLevel === 'High'
                        ? 'bg-red-100 text-red-800'
                        : mod.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {mod.riskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{mod.reason}</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Required Code/DB Changes:
                  </span>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    {mod.requiredChanges.map((rc, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Breaking Changes & Database Impact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breaking Changes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Breaking API / Interface Changes
                </h3>
              </div>
              <ul className="space-y-2">
                {impactResult.breakingChanges.map((bc, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 text-xs text-red-950 font-mono"
                  >
                    {bc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Database & Schema Impact */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Database & Schema Migrations
                </h3>
              </div>
              <ul className="space-y-2">
                {impactResult.databaseImpact.map((dbi, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-mono"
                  >
                    {dbi}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
