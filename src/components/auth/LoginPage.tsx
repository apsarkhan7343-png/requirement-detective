import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCheck,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDemoAccountsApi } from '../../lib/api';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToLanding: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onNavigateToLanding,
  onLoginSuccess,
}) => {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo accounts
  const [demoAccounts, setDemoAccounts] = useState<
    Array<{
      role: string;
      name: string;
      email: string;
      organization: string;
      samplePassword?: string;
    }>
  >([]);

  useEffect(() => {
    const fetchDemoAccounts = async () => {
      try {
        const res = await getDemoAccountsApi();
        if (res?.accounts) {
          setDemoAccounts(res.accounts);
        }
      } catch (err) {
        console.warn('Failed to load demo accounts:', err);
      }
    };
    fetchDemoAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    const res = await login(email.trim(), password, rememberMe);
    if (res.success) {
      setSuccessMessage('Authentication verified. Accessing Requirement workspace...');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Geometric Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="h-16 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between relative z-10 bg-[#0B1120]/70 backdrop-blur-md">
        <div
          onClick={onNavigateToLanding}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-xs rotate-45 transition-transform group-hover:rotate-90 duration-300" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              Req<span className="text-indigo-400">Detective</span>
            </span>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">IEEE 830 Specification Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToLanding}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Public Landing</span>
          </button>
          <button
            onClick={onNavigateToSignup}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3.5 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-400/50 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 my-6">
        <div className="w-full max-w-md">
          {/* Glassmorphic Container with Geometric Balance */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Subtle Geometric Card Accent */}
            <div className="absolute top-0 right-8 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 bg-indigo-600 border border-indigo-400 text-white rounded-full text-[11px] font-mono font-semibold shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 1.3 • AES-256</span>
            </div>

            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-xs bg-indigo-500 rotate-45" />
                <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Workspace</h1>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with your enterprise credentials to audit, analyze, and manage requirements.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Work Email Address</span>
                  <span className="text-[10px] text-slate-500 font-mono">Corporate ID</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.io"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('To reset password in demo mode, select one of the ready demo accounts below.');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-normal"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400">Keep session active on this workstation</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                id="login-submit-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Workspace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Preset Bar for convenient QA / testing */}
            {demoAccounts.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3 text-indigo-400" />
                    <span>Quick Test Accounts</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">1-Click Fill</span>
                </div>
                <div className="space-y-1.5">
                  {demoAccounts.map((account, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFill(account.email, account.samplePassword || 'Password123!')}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/40 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/30 text-left transition-all group"
                    >
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 flex items-center gap-1.5">
                          <UserCheck className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                          <span className="truncate">{account.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{account.role}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer switcher */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Don't have an enterprise account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignup}
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
              >
                Sign up now
              </button>
            </div>
          </div>

          {/* Security Compliance Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>SOC2 Type II</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>IEEE 830-1998</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Zero-Trust Auth</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-[#080d1a] relative z-10">
        RequirementDetective v2.4 Enterprise Specification Engine • Secure Environment
      </footer>
    </div>
  );
};
