import React, { useState } from 'react';
import { X, User, CheckCircle2, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: string, email: string) => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const { currentUser, switchUser, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState(currentUser?.role || 'Lead Software Architect');

  if (!isOpen) return null;

  const roles = [
    {
      id: 'usr-architect-1',
      name: 'Jordan Davis',
      title: 'Lead Software Architect',
      email: 'jordan.lead@enterprise.io',
      org: 'Enterprise Core Platforms',
      desc: 'Full access to IEEE 830 validation, conflict matrices, and schema change impacts.',
    },
    {
      id: 'usr-qa-2',
      name: 'Alexa Chen',
      title: 'Senior QA & Validation Engineer',
      email: 'alexa.qa@reqdetective.io',
      org: 'Global FinTech Systems',
      desc: 'Gherkin BDD test generation, testability scores, and edge-case boundary analysis.',
    },
    {
      id: 'usr-product-3',
      name: 'Marcus Vance',
      title: 'Principal Product Manager',
      email: 'marcus.pm@apexcloud.io',
      org: 'Apex Cloud Innovations',
      desc: 'Focused on client questions, business rules, and acceptance criteria.',
    },
    {
      id: 'usr-sec-4',
      name: 'Elena Rostova',
      title: 'Cybersecurity & Compliance Officer',
      email: 'elena.sec@enterprise.io',
      org: 'Security Architecture Group',
      desc: 'Data privacy standards, OAuth/JWT encryption requirements, and threat mitigations.',
    },
  ];

  const handleSwitch = (r: (typeof roles)[0]) => {
    setSelectedRole(r.title);
    switchUser({
      id: r.id,
      email: r.email,
      name: r.name,
      role: r.title,
      organization: r.org,
      avatar: r.name.split(' ').map((n) => n[0]).join(''),
    });
    onSelectRole(r.title, r.email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">User Profile & Roles</h2>
              <p className="text-[11px] text-slate-500 font-mono">Current: {currentUser?.email || 'Guest'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <p className="text-xs font-semibold text-slate-700 mb-1">Quick Switch Active Persona:</p>
          {roles.map((r) => (
            <div
              key={r.title}
              onClick={() => handleSwitch(r)}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                currentUser?.email === r.email || selectedRole === r.title
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                    {r.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="font-bold text-slate-900">{r.name}</span>
                </div>
                {(currentUser?.email === r.email || selectedRole === r.title) && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] font-semibold text-indigo-700 pl-8">{r.title}</p>
              <p className="text-[10px] text-slate-500 font-mono pl-8 mb-1">{r.email}</p>
              <p className="text-[11px] text-slate-600 leading-snug pl-8">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          {onNavigateToLogin && (
            <button
              onClick={() => {
                onClose();
                onNavigateToLogin();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Full Login Page</span>
            </button>
          )}

          {onNavigateToSignup && (
            <button
              onClick={() => {
                onClose();
                onNavigateToSignup();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up New</span>
            </button>
          )}

          <button
            onClick={async () => {
              await logout();
              onClose();
              if (onNavigateToLogin) onNavigateToLogin();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

