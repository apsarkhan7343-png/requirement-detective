import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';
import { Requirement } from '../../types';

interface NewRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRequirement: (req: Partial<Requirement>) => void;
}

export const NewRequirementModal: React.FC<NewRequirementModalProps> = ({
  isOpen,
  onClose,
  onAddRequirement,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('REQ-NEW-01');
  const [type, setType] = useState('Functional');
  const [priority, setPriority] = useState('High');
  const [module, setModule] = useState('Core Architecture');
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    onAddRequirement({
      title,
      code,
      type,
      priority,
      module,
      text,
      status: 'Proposed',
      qualityScore: 65,
      ambiguityLevel: 'MEDIUM',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Requirement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Code / ID</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Module</label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Requirement Title</label>
            <input
              type="text"
              placeholder="e.g. User Session Token Invalidation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Functional">Functional</option>
                <option value="Non-Functional">Non-Functional</option>
                <option value="Security">Security</option>
                <option value="Performance">Performance</option>
                <option value="UI/UX">UI/UX</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Requirement Statement</label>
            <textarea
              rows={3}
              placeholder="e.g. The system shall revoke active session tokens upon password reset within 1 second..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-indigo-200 transition-all"
            >
              Add Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
