export type RequirementType =
  | 'Functional'
  | 'Non-Functional'
  | 'Security'
  | 'Performance'
  | 'UI/UX'
  | 'Integration'
  | 'Compliance'
  | 'Data Privacy';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AmbiguityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskCategory = 'Security' | 'Performance' | 'Scalability' | 'Data Privacy' | 'Business Logic' | 'Compliance';
export type QuestionCategory =
  | 'Authentication'
  | 'Users'
  | 'Payments'
  | 'Orders'
  | 'Security'
  | 'Admin'
  | 'Notifications'
  | 'Performance'
  | 'Data'
  | 'Business Rules'
  | 'Architecture';

export interface Requirement {
  id: string;
  projectId: string;
  code: string; // e.g. "REQ-PAY-01"
  title: string;
  text: string;
  type: RequirementType;
  priority: Priority;
  module: string;
  qualityScore: number;
  ambiguityLevel: AmbiguityLevel;
  hasConflict?: boolean;
  hasMissingCounterpart?: boolean;
  hasRisk?: boolean;
  suggestedRewrite?: string;
  status: 'Draft' | 'Analyzed' | 'Approved' | 'Needs Clarification' | 'Flagged';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domain: string;
  requirementCount: number;
  qualityScore: number;
  completenessScore: number;
  clarityScore: number;
  consistencyScore: number;
  testabilityScore: number;
  securityScore: number;
  performanceScore: number;
  lastAnalyzed: string;
  status: 'In Review' | 'Healthy' | 'High Risk' | 'Action Required';
  requirements: Requirement[];
}

export interface MissingRequirementItem {
  id: string;
  projectId: string;
  module: string;
  title: string;
  severity: Severity;
  suggestedQuestion: string;
  rationale: string;
  suggestedRequirement: string;
  status: 'Pending' | 'Accepted' | 'Ignored' | 'Resolved';
}

export interface AmbiguityItem {
  id: string;
  projectId: string;
  requirementId?: string;
  originalText: string;
  ambiguityLevel: AmbiguityLevel;
  ambiguityScore: number;
  problem: string;
  missingInfo: string;
  suggestedRewrite: string;
  whyBetter: string;
  status: 'Pending' | 'Adopted' | 'Customized' | 'Dismissed';
}

export interface ConflictItem {
  id: string;
  projectId: string;
  reqAId?: string;
  reqBId?: string;
  reqA: string;
  reqB: string;
  conflictType: string;
  severity: Severity;
  explanation: string;
  suggestedResolution: string;
  status: 'Open' | 'Resolved' | 'Ignored';
}

export interface RiskItem {
  id: string;
  projectId: string;
  category: RiskCategory;
  severity: Severity;
  title: string;
  description: string;
  mitigation: string;
  impactScore: number;
  status: 'Identified' | 'Mitigated' | 'Accepted';
}

export interface SmartQuestionItem {
  id: string;
  projectId: string;
  category: QuestionCategory;
  question: string;
  context: string;
  targetRole: string;
  priority: Priority;
  defaultOptions: string[];
  clientAnswer?: string;
  status: 'Unanswered' | 'Answered' | 'Skipped' | 'Resolved';
}

export interface DependencyNode {
  id: string;
  label: string;
  category: string;
  status: 'Healthy' | 'At Risk' | 'Blocked' | 'Pending';
  description: string;
  x?: number;
  y?: number;
  dependencies: string[]; // IDs of nodes this depends on
}

export interface ChangeImpactResult {
  impactScore: number;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  affectedModules: Array<{
    name: string;
    riskLevel: Severity;
    impactPercentage: number;
    reason: string;
    requiredChanges: string[];
  }>;
  breakingChanges: string[];
  databaseImpact: string[];
  regressionRisks: string[];
  recommendedActions: string[];
}

export interface AnalysisProblemItem {
  category: string;
  issue: string;
  severity: Severity;
  impact: string;
}

export interface AnalysisSpecificConcern {
  issue: string;
  severity: Severity;
  recommendation: string;
}

export interface AnalysisResponseData {
  // Scores
  overallQualityScore: number;
  qualityScore: number; // legacy alias
  clarityScore: number;
  completenessScore: number;
  consistencyScore: number;
  testabilityScore: number;
  riskScore: number;
  securityScore?: number;
  performanceScore?: number;

  // Metadata classification
  detectedRequirementType: string;
  recommendedPriority: Priority;
  priorityReasoning: string;

  // Ambiguity & Diagnostic details
  ambiguityLevel: AmbiguityLevel;
  ambiguityScore: number;
  problemExplanation: string;
  missingInformation: string[];

  // Structured problems breakdown
  problemsDetected?: AnalysisProblemItem[];

  // Specialized domain checks
  securityConcerns?: AnalysisSpecificConcern[];
  performanceConcerns?: AnalysisSpecificConcern[];
  testabilityProblems?: AnalysisSpecificConcern[];

  // Improvement
  suggestedImprovement: string;
  whyBetter: string;

  // Accompanying requirements & risks
  detectedRisks: Array<{
    category: RiskCategory;
    severity: Severity;
    description: string;
    mitigation: string;
  }>;
  missingRequirements: Array<{
    module: string;
    title: string;
    severity: Severity;
    suggestedQuestion: string;
    rationale: string;
    suggestedRequirement?: string;
  }>;
  questionsToClient: Array<{
    category: string;
    question: string;
    targetStakeholder: string;
    rationale: string;
    suggestedAnswers?: string[];
  }>;
  testCases: Array<{
    title: string;
    type: string;
    gherkin: string;
  }>;
  potentialConflicts: Array<{
    conflictingWith: string;
    reason: string;
    suggestedResolution: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
  token?: string;
  createdAt?: string;
}

export type ActiveTab =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'projects'
  | 'requirements'
  | 'analyzer'
  | 'missing'
  | 'ambiguity'
  | 'conflicts'
  | 'risks'
  | 'questions'
  | 'dependencies'
  | 'change-impact'
  | 'reports'
  | 'settings';

