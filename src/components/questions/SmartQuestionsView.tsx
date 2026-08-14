import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  CheckCircle2,
  Download,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';
import { Project, SmartQuestionItem } from '../../types';
import { INITIAL_SMART_QUESTIONS } from '../../data/mockData';

interface SmartQuestionsViewProps {
  activeProject: Project;
}

export const SmartQuestionsView: React.FC<SmartQuestionsViewProps> = ({ activeProject }) => {
  const [questions, setQuestions] = useState<SmartQuestionItem[]>(INITIAL_SMART_QUESTIONS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [clientAnswers, setClientAnswers] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const categories = ['ALL', 'Authentication', 'Payments', 'Orders', 'Security', 'Performance'];

  const filteredQuestions = questions.filter((q) => {
    if (activeCategory !== 'ALL' && q.category !== activeCategory) return false;
    return true;
  });

  const handleSaveAnswer = (id: string) => {
    const ans = clientAnswers[id];
    if (ans) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, clientAnswer: ans, status: 'Answered' } : q))
      );
      setSavedStatus((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setSavedStatus((prev) => ({ ...prev, [id]: false })), 2000);
    }
  };

  const handleExportQuestionnaire = () => {
    const content = questions
      .map(
        (q, idx) =>
          `### ${idx + 1}. [${q.category}] ${q.question}\n- **Target Role**: ${q.targetRole}\n- **Context**: ${q.context}\n- **Options**: ${q.defaultOptions.join(' | ')}\n- **Client Response**: ${q.clientAnswer || 'Pending'}\n`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-client-questions.md`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Smart Stakeholder Question Generation
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {questions.length} Elicitation Queries
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            AI-synthesized elicitation questions grouped by functional module to clarify client expectations before sprint planning.
          </p>
        </div>

        <button
          onClick={handleExportQuestionnaire}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Questionnaire (Markdown)</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isAnswered = q.status === 'Answered' || !!q.clientAnswer;

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isAnswered ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                      {q.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      Target: {q.targetRole}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase self-start ${
                    q.priority === 'Critical'
                      ? 'bg-red-100 text-red-800'
                      : q.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {q.priority}
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>Why this is critical:</strong> {q.context}
              </p>

              {/* Options */}
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Suggested Options for Client:
                </span>
                <div className="flex flex-wrap gap-2">
                  {q.defaultOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setClientAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Answer Input */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  value={clientAnswers[q.id] || q.clientAnswer || ''}
                  onChange={(e) =>
                    setClientAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                  placeholder="Record stakeholder answer or selected SLA..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
                <button
                  onClick={() => handleSaveAnswer(q.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  {savedStatus[q.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Record Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
