import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  GitCompare,
  EyeOff,
  Search,
  HelpCircle,
  BarChart3,
  Layers,
  Code,
  FileCheck2,
} from 'lucide-react';
import { analyzeRequirementApi } from '../../lib/api';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onNavigateToLogin,
  onNavigateToSignup,
}) => {
  const [demoInput, setDemoInput] = useState('Users should be able to login quickly.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    original: string;
    flaw: string;
    rewrite: string;
    gherkin: string;
    score: number;
  } | null>({
    original: 'Users should be able to login quickly.',
    flaw: "'Quickly' is subjective and not measurable. Unconstrained response time fails automated QA testing.",
    rewrite:
      'Users shall be authenticated and issued a signed JWT within 2.0s (p95) under standard network conditions with up to 1,000 concurrent sessions.',
    gherkin:
      'Scenario: User login SLA\n  Given 500 concurrent sessions\n  When user posts valid credentials\n  Then response time < 2000ms',
    score: 94,
  });

  const handleRunDemo = async () => {
    if (!demoInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeRequirementApi({
        projectContext: 'Enterprise E-Commerce SaaS platform',
        requirementText: demoInput,
        type: 'Functional',
        priority: 'High',
      });
      if (res?.data) {
        setDemoResult({
          original: demoInput,
          flaw: res.data.problemExplanation || 'Ambiguous qualitative wording detected.',
          rewrite: res.data.suggestedImprovement || 'Deterministic specification generated.',
          gherkin:
            res.data.testCases?.[0]?.gherkin ||
            'Scenario: Acceptance criterion\n  Given valid state\n  When action happens\n  Then verifiable result',
          score: res.data.qualityScore || 88,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-[#0B1120]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-xs rotate-45" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">RequirementDetective</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <a href="#sandbox" className="hover:text-indigo-400 transition-colors">Live AI Sandbox</a>
          <a href="#standards" className="hover:text-indigo-400 transition-colors">IEEE 830 Standards</a>
          <a href="#matrix" className="hover:text-indigo-400 transition-colors">Conflict Matrix</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToLogin || onEnterApp}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </button>
          <button
            id="landing-enter-app-btn"
            onClick={onNavigateToSignup || onEnterApp}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-24 max-w-6xl mx-auto w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>IEEE 830 & ISO 29148 Automated Requirement Engineering</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Catch Ambiguities & Conflicts <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-200">
            Before Developers Write Code.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          RequirementDetective turns vague feature requests into deterministic, testable software requirements with instant ambiguity rewriting, cross-module conflict detection, and Gherkin acceptance criteria.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onEnterApp}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Analyze Your Requirements Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#sandbox"
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            Try Live AI Sandbox &darr;
          </a>
        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-indigo-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <EyeOff className="w-4 h-4" /> Ambiguity Fix
            </div>
            <p className="text-xs text-slate-400">Replaces vague terms with quantitative SLAs.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-red-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <GitCompare className="w-4 h-4" /> Conflict Matrix
            </div>
            <p className="text-xs text-slate-400">Detects contradictory rules across modules.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-amber-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Search className="w-4 h-4" /> Missing Specs
            </div>
            <p className="text-xs text-slate-400">Discovers omitted edge cases & fallbacks.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-1.5">
              <Code className="w-4 h-4" /> Gherkin BDD
            </div>
            <p className="text-xs text-slate-400">Auto-generates automated QA test criteria.</p>
          </div>
        </div>
      </section>

      {/* Interactive AI Sandbox Section */}
      <section id="sandbox" className="py-16 bg-[#0F172A] border-y border-slate-800 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Interactive AI Requirement Sandbox
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Type any vague requirement statement below or click a sample to see instant IEEE 830 diagnosis.
            </p>
          </div>

          <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Test Requirement Input:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDemoInput('Users should be able to login quickly.')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Login quickly
                  </button>
                  <button
                    onClick={() => setDemoInput('Users can cancel orders anytime.')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Cancel orders anytime
                  </button>
                  <button
                    onClick={() => setDemoInput('The database must be highly secure.')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Highly secure
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="flex-1 p-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                  placeholder="Enter any software requirement..."
                />
                <button
                  onClick={handleRunDemo}
                  disabled={isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Diagnose with AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Demo Results Box */}
              {demoResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
                  <div className="space-y-3">
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl">
                      <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">
                        Semantic Flaw Detected:
                      </span>
                      <p className="text-red-900 leading-relaxed">{demoResult.flaw}</p>
                    </div>

                    <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                        Acceptance Criteria (Gherkin):
                      </span>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                        {demoResult.gherkin}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider">
                          IEEE 830 Deterministic Rewrite:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                          {demoResult.score}% Quality Score
                        </span>
                      </div>
                      <p className="text-indigo-950 font-mono leading-relaxed mt-2 text-xs">
                        "{demoResult.rewrite}"
                      </p>
                    </div>

                    <button
                      onClick={onEnterApp}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Explore Full Workspace Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 RequirementDetective. Enterprise AI Software Requirement Engineering Suite.</p>
      </footer>
    </div>
  );
};
