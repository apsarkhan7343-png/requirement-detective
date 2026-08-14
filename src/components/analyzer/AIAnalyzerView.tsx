import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  AlertTriangle,
  HelpCircle,
  Code,
  Shield,
  Zap,
  RotateCcw,
  Check,
  FolderGit2,
  FileCode,
  Sliders,
  AlertOctagon,
  ArrowRight,
  Plus,
  FileDown,
  Layers,
  Search,
  Activity,
  Gauge,
  HelpCircle as QuestionIcon,
  CheckSquare,
  XCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Project, Requirement, AnalysisResponseData } from '../../types';
import { analyzeRequirementApi } from '../../lib/api';

interface AIAnalyzerViewProps {
  activeProject: Project;
  onUpdateRequirement?: (req: Requirement) => void;
  onAddRequirement?: (req: Partial<Requirement>) => void;
}

export const AIAnalyzerView: React.FC<AIAnalyzerViewProps> = ({
  activeProject,
  onUpdateRequirement,
  onAddRequirement,
}) => {
  const [requirementText, setRequirementText] = useState('The website should be fast and secure.');
  const [reqType, setReqType] = useState('Functional');
  const [priority, setPriority] = useState('High');
  const [moduleName, setModuleName] = useState('Core Platform');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [addedToProject, setAddedToProject] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResponseData | null>({
    overallQualityScore: 18,
    qualityScore: 18,
    clarityScore: 15,
    completenessScore: 20,
    consistencyScore: 50,
    testabilityScore: 12,
    riskScore: 88,
    securityScore: 88,
    performanceScore: 50,
    detectedRequirementType: 'Non-Functional',
    recommendedPriority: 'Critical',
    priorityReasoning:
      'Unbounded performance assertions and abstract security claims create catastrophic architectural ambiguity and blocking QA failure.',
    ambiguityLevel: 'CRITICAL',
    ambiguityScore: 92,
    problemExplanation:
      "The terms 'fast' and 'secure' are purely qualitative, subjective, and non-measurable. 'Fast' lacks concrete latency (TTFB/p95/p99) and concurrent load definitions, while 'secure' specifies no encryption ciphers, authentication protocols, session rules, or threat protection standards.",
    missingInformation: [
      'Quantitative page load & latency SLA (e.g. Largest Contentful Paint < 2.5s, TTFB < 200ms at p95)',
      'Target concurrent user load and geographical latency bounds (e.g. 5,000 active sessions)',
      'Transport & storage cryptographic standards (e.g. TLS 1.3, AES-256-GCM)',
      'Authentication & session management policies (e.g. MFA, idle session termination after 15 min)',
      'OWASP Top 10 compliance & CSP header definitions',
    ],
    problemsDetected: [
      {
        category: 'Ambiguity',
        issue: "The adjective 'fast' has no quantitative latency, throughput, or concurrency metric.",
        severity: 'Critical',
        impact: 'QA engineers cannot create deterministic automated pass/fail benchmarks.',
      },
      {
        category: 'Security',
        issue: "The term 'secure' omits required cipher suites, token mechanics, and compliance frameworks.",
        severity: 'Critical',
        impact: 'Leaves system exposed to data breaches, zero-day injection attacks, and audit failure.',
      },
      {
        category: 'Testability',
        issue: 'Lack of numeric pass/fail criteria prevents automated regression and load testing.',
        severity: 'High',
        impact: 'Release sign-off becomes subjective, error-prone, and dispute-heavy.',
      },
    ],
    securityConcerns: [
      {
        issue: 'Unspecified transport encryption and security header policies.',
        severity: 'High',
        recommendation: 'Enforce TLS 1.3, HSTS (max-age=31536000), and Content Security Policy (CSP Level 3).',
      },
      {
        issue: 'Missing input sanitization and rate-limiting specifications.',
        severity: 'High',
        recommendation: 'Implement parameterized queries and token-bucket API rate limits (100 req/min/IP).',
      },
    ],
    performanceConcerns: [
      {
        issue: 'Undefined p95/p99 response latency thresholds under peak traffic.',
        severity: 'High',
        recommendation: 'Specify p95 response time < 2.0s and LCP < 2.5s under 5,000 active users.',
      },
    ],
    testabilityProblems: [
      {
        issue: 'Acceptance criteria cannot verify subjective speed and security claims.',
        severity: 'Critical',
        recommendation: 'Implement automated Lighthouse performance assertions and OWASP ZAP security test suites.',
      },
    ],
    suggestedImprovement:
      'The web application shall achieve a Largest Contentful Paint (LCP) under 2.5 seconds and Time to First Byte (TTFB) under 200ms at the 95th percentile with up to 5,000 concurrent active sessions. All communications must enforce TLS 1.3 with HSTS, data at rest encrypted via AES-256-GCM, and all public endpoints hardened against OWASP Top 10 vulnerabilities.',
    whyBetter:
      'Replaces subjective adjectives with deterministic millisecond bounds (LCP < 2.5s, TTFB < 200ms), explicit concurrency ceilings (5,000 users), and verifiable cryptographic protocols (TLS 1.3, AES-256-GCM, HSTS) conforming to IEEE 830 and ISO 29148 standards.',
    detectedRisks: [
      {
        category: 'Performance',
        severity: 'High',
        description: 'Unbounded performance expectations and undefined security baselines expose application to DDoS and resource exhaustion.',
        mitigation: 'Enforce CDN edge caching, p95 response time monitoring, TLS 1.3, and automated security scans.',
      },
      {
        category: 'Security',
        severity: 'High',
        description: 'Absence of explicit cryptographic standards could permit insecure default ciphers in production.',
        mitigation: 'Mandate AES-256-GCM for data at rest and TLS 1.3 for all ingress traffic.',
      },
    ],
    missingRequirements: [
      {
        module: 'Infrastructure & Security Engine',
        title: 'Edge Caching & DDoS Mitigation',
        severity: 'High',
        suggestedQuestion: 'What Cloudflare / WAF edge caching rules and rate limits should be established for static and API assets?',
        rationale: 'Unspecified edge cases create high-cost production defects and security incidents.',
        suggestedRequirement:
          'The system shall implement Cloudflare WAF with rate limiting (100 req/min per IP) and edge caching for static assets with TTL 86400s.',
      },
      {
        module: 'Audit & Observability',
        title: 'Structured Audit Trail & Telemetry',
        severity: 'Medium',
        suggestedQuestion: 'How long should security audit logs be retained for compliance audits and dispute resolution?',
        rationale: 'Enterprise software requires immutable audit trails for SOC2 and ISO 27001 compliance.',
        suggestedRequirement:
          'All security-critical actions and API errors shall be logged with correlation IDs to OpenTelemetry with a 90-day retention policy.',
      },
    ],
    questionsToClient: [
      {
        category: 'Performance Architecture',
        question: 'What are the exact target p95 and p99 response time limits (e.g. < 1.5s) and expected global geographic distribution?',
        targetStakeholder: 'Technical Architect',
        rationale: 'Determines infrastructure provisioning, CDN placement, and database connection pooling design.',
      },
      {
        category: 'Security & Compliance',
        question: 'What regulatory frameworks must this application comply with (e.g. SOC2 Type II, ISO 27001, GDPR, HIPAA)?',
        targetStakeholder: 'InfoSec Officer / Lead BA',
        rationale: 'Ensures compliance certification readiness and prevents costly architectural rewrites.',
      },
      {
        category: 'Testing & Quality Assurance',
        question: 'Will automated penetration testing and load tests be run against staging environments prior to production release?',
        targetStakeholder: 'QA Lead / Release Manager',
        rationale: 'Establishes automated release gating criteria and prevents production outages.',
      },
    ],
    testCases: [
      {
        title: 'TC-PERF-01: Page Load Time Under Peak Concurrency SLA',
        type: 'Performance SLA',
        gherkin: `Scenario: Measure page load time under peak concurrency
  Given 2,500 active simulated users on the system
  When a user requests the application dashboard
  Then the Time to First Byte (TTFB) must be under 200 milliseconds
  And the Largest Contentful Paint (LCP) must occur in under 2500 milliseconds.`,
      },
      {
        title: 'TC-SEC-01: Mandatory TLS 1.3 and HSTS Security Headers',
        type: 'Security Verification',
        gherkin: `Scenario: Verify mandatory TLS 1.3 and HSTS security headers
  Given a client dispatches an HTTP request to any API endpoint
  When the server receives the connection
  Then it must strictly enforce TLS 1.3 with a 256-bit cipher suite
  And include the Strict-Transport-Security header with max-age=31536000.`,
      },
      {
        title: 'TC-SEC-02: Rate Limiting on Public Endpoints',
        type: 'Boundary Condition',
        gherkin: `Scenario: Prevent DDoS with token-bucket rate limits
  Given a client IP sending requests to the API
  When more than 100 requests are submitted within 60 seconds
  Then the system shall return HTTP 429 Too Many Requests
  And log the event in the security telemetry stream.`,
      },
    ],
    potentialConflicts: [
      {
        conflictingWith: 'Global Session Security Policy (SEC-04)',
        reason: 'Aggressive client-side caching may conflict with immediate session revocation policies.',
        suggestedResolution: 'Isolate cache-control headers: disable caching on authenticated API routes while caching static assets.',
      },
    ],
  });

  const loadingSteps = [
    'Parsing requirement syntax and structural intent...',
    'Auditing against IEEE 830 & ISO 29148 standards...',
    'Detecting ambiguity, missing SLAs, and security/performance risks...',
    'Synthesizing Gherkin BDD test suites & stakeholder questions...',
  ];

  const handleRunAnalysis = async () => {
    if (!requirementText.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setAddedToProject(false);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await analyzeRequirementApi({
        projectContext: activeProject.description || activeProject.name,
        requirementText,
        type: reqType,
        priority,
      });

      if (res && res.data) {
        setAnalysisResult(res.data);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze requirement. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopyRewrite = () => {
    if (analysisResult?.suggestedImprovement) {
      navigator.clipboard.writeText(analysisResult.suggestedImprovement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;

    const report = `# AI Requirement Analysis Report (IEEE 830 / ISO 29148)
## Original Requirement
"${requirementText}"
- **Provided Type:** ${reqType} | **Priority:** ${priority}
- **Detected Type:** ${analysisResult.detectedRequirementType || reqType} | **Recommended Priority:** ${analysisResult.recommendedPriority || priority}

## Metric Scores
- Overall Quality Score: ${analysisResult.overallQualityScore || analysisResult.qualityScore}%
- Clarity Score: ${analysisResult.clarityScore}%
- Completeness Score: ${analysisResult.completenessScore}%
- Consistency Score: ${analysisResult.consistencyScore}%
- Testability Score: ${analysisResult.testabilityScore}%
- Risk Severity Score: ${analysisResult.riskScore}%
- Ambiguity Level: ${analysisResult.ambiguityLevel} (${analysisResult.ambiguityScore}/100)

## Problem Explanation
${analysisResult.problemExplanation}

## Improved Requirement (IEEE 830 Standard)
"${analysisResult.suggestedImprovement}"

*Why this is superior:* ${analysisResult.whyBetter}

## Stakeholder Clarification Questions
${analysisResult.questionsToClient.map((q) => `- [${q.targetStakeholder}] ${q.question} (Rationale: ${q.rationale})`).join('\n')}

## Generated Acceptance Test Cases (Gherkin BDD)
${analysisResult.testCases.map((tc) => `### ${tc.title} (${tc.type})\n\`\`\`gherkin\n${tc.gherkin}\n\`\`\``).join('\n\n')}
`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleAddToProject = () => {
    if (!analysisResult || !onAddRequirement) return;

    onAddRequirement({
      title: `${reqType}: ${requirementText.slice(0, 45)}...`,
      description: analysisResult.suggestedImprovement,
      type: (analysisResult.detectedRequirementType as any) || (reqType as any),
      priority: analysisResult.recommendedPriority || (priority as any),
      status: 'In Review',
      module: moduleName || 'Core Platform',
      acceptanceCriteria: analysisResult.testCases.map((tc) => tc.title),
      clarityScore: analysisResult.clarityScore,
      completenessScore: analysisResult.completenessScore,
      testabilityScore: analysisResult.testabilityScore,
      qualityScore: analysisResult.overallQualityScore || analysisResult.qualityScore,
    });

    setAddedToProject(true);
    setTimeout(() => setAddedToProject(false), 3000);
  };

  const presets = [
    {
      label: 'Fast and secure (Example from Prompt)',
      text: 'The website should be fast and secure.',
      type: 'Non-Functional',
      priority: 'Critical',
      module: 'Core Platform',
    },
    {
      label: 'Login quickly (Ambiguous SLA)',
      text: 'Users should be able to login quickly.',
      type: 'Functional',
      priority: 'High',
      module: 'Authentication',
    },
    {
      label: 'Cancel orders anytime (Conflict)',
      text: 'Users can cancel orders anytime without restriction.',
      type: 'Functional',
      priority: 'Critical',
      module: 'Order Management',
    },
    {
      label: 'Process payments with Stripe',
      text: 'The checkout system shall process credit card payments via Stripe with 3D Secure.',
      type: 'Functional',
      priority: 'Critical',
      module: 'Payment Gateway',
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">AI Requirement Detective</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gemini AI Engine
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Analyze software requirements against IEEE 830 / ISO 29148 standards, detect ambiguities, risks, security/performance gaps, and generate BDD test cases.
              </p>
            </div>
          </div>
        </div>

        {analysisResult && (
          <div className="flex items-center gap-2">
            <button
              id="export-report-btn"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedReport ? 'Report Copied!' : 'Copy Markdown Report'}</span>
            </button>

            {onAddRequirement && (
              <button
                id="add-to-project-btn"
                onClick={handleAddToProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {addedToProject ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addedToProject ? 'Added to Project!' : 'Adopt into Project'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input Section Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Enter Software Requirement
            </label>
            <span className="text-[11px] text-slate-400 font-mono">({requirementText.length} chars)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setRequirementText(p.text);
                  setReqType(p.type);
                  setPriority(p.priority);
                  setModuleName(p.module);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors font-medium border border-transparent hover:border-indigo-200"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-2">
            <textarea
              id="requirement-input-textarea"
              rows={4}
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder="e.g. The website should be fast and secure..."
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
            />
            {requirementText.trim().length > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setRequirementText('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Clear input
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    2. Requirement Type
                  </label>
                  <select
                    id="requirement-type-select"
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Security">Security</option>
                    <option value="Performance">Performance</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Integration">Integration</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Data Privacy">Data Privacy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    id="requirement-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500 font-medium"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Target Module (Optional)
                </label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Core Platform, Auth, Billing"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              id="analyze-requirement-btn"
              onClick={handleRunAnalysis}
              disabled={isLoading || !requirementText.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>3. Analyze Requirement</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={handleRunAnalysis}
              className="text-red-700 underline font-semibold hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Multi-stage Loading Banner */}
        {isLoading && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>AI Requirement Diagnostic in Progress...</span>
              </div>
              <span className="text-indigo-600">Stage {loadingStep + 1} of {loadingSteps.length}</span>
            </div>

            <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              />
            </div>

            <p className="text-xs text-indigo-700 font-mono">
              → {loadingSteps[loadingStep]}
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysisResult && !isLoading && (
        <div className="space-y-6">
          {/* Section Title & Metadata Badges */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Analysis Verdict:
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Detected Type: {analysisResult.detectedRequirementType || reqType}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Recommended Priority: {analysisResult.recommendedPriority || priority}</span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs ${
                  analysisResult.ambiguityLevel === 'CRITICAL' || analysisResult.ambiguityLevel === 'HIGH'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : analysisResult.ambiguityLevel === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Ambiguity: {analysisResult.ambiguityLevel} ({analysisResult.ambiguityScore}/100)</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 italic">
              Priority Reasoning: {analysisResult.priorityReasoning || 'Assessed against architectural risk baseline.'}
            </div>
          </div>

          {/* 6 Metric Scores Row */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-600" />
              <span>Quality & Readiness Scoreboard</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Overall Quality Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Overall Quality</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analysisResult.overallQualityScore ?? analysisResult.qualityScore}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (analysisResult.overallQualityScore ?? analysisResult.qualityScore) >= 75
                          ? 'bg-emerald-500'
                          : (analysisResult.overallQualityScore ?? analysisResult.qualityScore) >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.overallQualityScore ?? analysisResult.qualityScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">IEEE 830 index</span>
                </div>
              </div>

              {/* 2. Clarity Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Clarity Score</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analysisResult.clarityScore}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        analysisResult.clarityScore >= 75
                          ? 'bg-emerald-500'
                          : analysisResult.clarityScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.clarityScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Precision & wording</span>
                </div>
              </div>

              {/* 3. Completeness Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Completeness</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analysisResult.completenessScore}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        analysisResult.completenessScore >= 75
                          ? 'bg-emerald-500'
                          : analysisResult.completenessScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.completenessScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Edge case coverage</span>
                </div>
              </div>

              {/* 4. Consistency Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Consistency</span>
                  <div className="text-2xl font-bold text-slate-900 mt-0.5">
                    {analysisResult.consistencyScore ?? 75}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (analysisResult.consistencyScore ?? 75) >= 75
                          ? 'bg-emerald-500'
                          : (analysisResult.consistencyScore ?? 75) >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.consistencyScore ?? 75}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Architecture alignment</span>
                </div>
              </div>

              {/* 5. Testability Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Testability</span>
                  <div className="text-2xl font-bold text-indigo-600 mt-0.5">
                    {analysisResult.testabilityScore}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        analysisResult.testabilityScore >= 75
                          ? 'bg-indigo-500'
                          : analysisResult.testabilityScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${analysisResult.testabilityScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Deterministic QA readiness</span>
                </div>
              </div>

              {/* 6. Risk Score */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Risk Severity</span>
                  <div
                    className={`text-2xl font-bold mt-0.5 ${
                      (analysisResult.riskScore ?? 80) >= 70
                        ? 'text-red-600'
                        : (analysisResult.riskScore ?? 80) >= 40
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {analysisResult.riskScore ?? 80}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (analysisResult.riskScore ?? 80) >= 70
                          ? 'bg-red-500'
                          : (analysisResult.riskScore ?? 80) >= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${analysisResult.riskScore ?? 80}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {(analysisResult.riskScore ?? 80) >= 70 ? 'High engineering risk' : 'Manageable risk'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Improved Requirement & Explanation Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">
                  IEEE 830 / ISO 29148 Improved Requirement
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="copy-improved-req-btn"
                  onClick={handleCopyRewrite}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Improved Text'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-950/80 border border-indigo-700/60 font-mono text-sm text-indigo-100 leading-relaxed">
              "{analysisResult.suggestedImprovement}"
            </div>

            <div className="flex items-start gap-2.5 text-xs text-indigo-200 bg-white/5 p-3 rounded-lg border border-white/10">
              <Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Why this rewrite is superior:</strong> {analysisResult.whyBetter}
              </div>
            </div>
          </div>

          {/* Core Findings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Columns: Problems Detected, Explanation, Security & Performance */}
            <div className="lg:col-span-6 space-y-5">
              {/* Problems Detected Section */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Problems Detected ({analysisResult.problemsDetected?.length || 3})
                    </h3>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3 bg-red-50/70 border border-red-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-red-900 mb-1">Diagnostic Explanation:</p>
                  <p>{analysisResult.problemExplanation}</p>
                </div>

                {/* Structured Problem items */}
                <div className="space-y-2 mt-3">
                  {analysisResult.problemsDetected && analysisResult.problemsDetected.length > 0 ? (
                    analysisResult.problemsDetected.map((prob, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {prob.category}: {prob.issue}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              prob.severity === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : prob.severity === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {prob.severity}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          <strong>Impact:</strong> {prob.impact}
                        </p>
                      </div>
                    ))
                  ) : (
                    analysisResult.missingInformation.map((info, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-red-100 bg-red-50/40 text-xs text-slate-700 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{info}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Concerns */}
              {analysisResult.securityConcerns && analysisResult.securityConcerns.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Security & Compliance Concerns ({analysisResult.securityConcerns.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.securityConcerns.map((sec, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-emerald-950">
                          <span>{sec.issue}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            {sec.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Recommendation:</strong> {sec.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Concerns */}
              {analysisResult.performanceConcerns && analysisResult.performanceConcerns.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Performance & Concurrency Concerns ({analysisResult.performanceConcerns.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.performanceConcerns.map((perf, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-amber-950">
                          <span>{perf.issue}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                            {perf.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Specification:</strong> {perf.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testability Problems */}
              {analysisResult.testabilityProblems && analysisResult.testabilityProblems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Testability & QA Barriers ({analysisResult.testabilityProblems.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.testabilityProblems.map((testProblem, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-indigo-950">
                          <span>{testProblem.issue}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                            {testProblem.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>QA Gating Rule:</strong> {testProblem.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 6 Columns: Clarification Questions, Missing Requirements, Test Cases & Conflicts */}
            <div className="lg:col-span-6 space-y-5">
              {/* Smart Clarification Questions */}
              {analysisResult.questionsToClient && analysisResult.questionsToClient.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <QuestionIcon className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Smart Clarification Questions ({analysisResult.questionsToClient.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {analysisResult.questionsToClient.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900">{q.category}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Target: {q.targetStakeholder}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium">{q.question}</p>
                        <p className="text-[11px] text-slate-500">
                          <strong>Rationale:</strong> {q.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Requirements Detected */}
              {analysisResult.missingRequirements && analysisResult.missingRequirements.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Missing Companion Requirements ({analysisResult.missingRequirements.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {analysisResult.missingRequirements.map((missing, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-950">{missing.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                            {missing.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          <strong>Key Question:</strong> {missing.suggestedQuestion}
                        </p>
                        {missing.suggestedRequirement && (
                          <div className="mt-1 p-2 rounded bg-purple-100/50 text-[11px] text-purple-900 font-mono">
                            {missing.suggestedRequirement}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acceptance Test Cases (Gherkin BDD) */}
              {analysisResult.testCases && analysisResult.testCases.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Generated Acceptance Test Cases (BDD)
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analysisResult.testCases.map((tc, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-900 text-slate-200 p-3.5 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-indigo-400 font-bold text-[11px]">{tc.title}</span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {tc.type}
                          </span>
                        </div>
                        <pre className="whitespace-pre-wrap text-[11px] text-slate-300 leading-relaxed font-mono">
                          {tc.gherkin}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Conflicts */}
              {analysisResult.potentialConflicts && analysisResult.potentialConflicts.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Potential Conflicts & Policy Collisions ({analysisResult.potentialConflicts.length})
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {analysisResult.potentialConflicts.map((conf, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-xs space-y-1">
                        <span className="font-bold text-amber-950">Collides with: {conf.conflictingWith}</span>
                        <p className="text-slate-700">{conf.reason}</p>
                        <p className="text-[11px] text-amber-900">
                          <strong>Resolution:</strong> {conf.suggestedResolution}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
