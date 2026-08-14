import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';
import { Project } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Partial<Project>) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('FinTech / Banking');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProject({
      name,
      domain,
      description: description || 'New software engineering project specification suite.',
      qualityScore: 78,
      clarityScore: 75,
      completenessScore: 80,
      consistencyScore: 70,
      testabilityScore: 82,
      securityScore: 85,
      performanceScore: 76,
      requirementCount: 6,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Create New Project Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Telehealth Video Consultation Platform"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Domain / Industry</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="FinTech / Banking">FinTech / Banking</option>
              <option value="E-Commerce & Retail">E-Commerce & Retail</option>
              <option value="Healthcare & Telemedicine">Healthcare & Telemedicine</option>
              <option value="Enterprise SaaS">Enterprise SaaS</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="Cybersecurity & Identity">Cybersecurity & Identity</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Project Scope / Description</label>
            <textarea
              rows={3}
              placeholder="Describe the architectural goals, key user roles, and compliance constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-indigo-500"
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
              Initialize Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
