import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Cpu,
  CheckCircle2,
  Sliders,
  Sparkles,
  Key,
  Users,
} from 'lucide-react';
import { Project } from '../../types';

interface SettingsViewProps {
  activeProject: Project;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ activeProject }) => {
  const [model, setModel] = useState('models/gemini-3.7-flash');
  const [ieeeEnabled, setIeeeEnabled] = useState(true);
  const [autoDetectConflicts, setAutoDetectConflicts] = useState(true);
  const [testabilityThreshold, setTestabilityThreshold] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Workspace Settings & Standards
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure AI inspection models, compliance standards (IEEE 830, ISO 29148), and automated verification thresholds.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* AI Engine Configuration */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Inspection Engine
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Gemini AI Model Alias</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="models/gemini-3.7-flash">Gemini 3.7 Flash (Default - High Speed & Precision)</option>
                <option value="models/gemini-2.5-pro">Gemini 2.5 Pro (Deep Architecture Reasoning)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Verification Standards */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quality & Specification Standards
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">IEEE 830 / ISO 29148 Standard Enforcement</span>
                <span className="text-slate-500 text-[11px]">
                  Automatically format rewritten specifications with quantitative performance metrics and testable conditions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={ieeeEnabled}
                onChange={(e) => setIeeeEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Cross-Module Conflict Matrix</span>
                <span className="text-slate-500 text-[11px]">
                  Detect semantic contradictions between business logic, logistics, and user experience rules.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoDetectConflicts}
                onChange={(e) => setAutoDetectConflicts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-800">Minimum Testability Passing Score</span>
                <span className="font-mono font-bold text-indigo-600">{testabilityThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={testabilityThreshold}
                onChange={(e) => setTestabilityThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Settings persist to current workspace session.</span>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
          >
            {saved && <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
