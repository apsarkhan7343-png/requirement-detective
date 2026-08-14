import { AnalysisResponseData, ChangeImpactResult, SmartQuestionItem, User } from '../types';

export async function signupApi(payload: {
  email: string;
  password: string;
  name: string;
  role?: string;
  organization?: string;
}): Promise<{ user: User; token: string; message: string }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  return data;
}

export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string; message: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}

export async function getMeApi(token: string): Promise<{ authenticated: boolean; user?: User }> {
  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return response.json();
}

export async function logoutApi(token?: string): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (err) {
    console.warn('Logout API error:', err);
  }
}

export async function getDemoAccountsApi(): Promise<{
  accounts: Array<{
    role: string;
    name: string;
    email: string;
    organization: string;
    samplePassword?: string;
  }>;
}> {
  try {
    const res = await fetch('/api/auth/demo-accounts');
    if (!res.ok) throw new Error('Failed to fetch demo accounts');
    return await res.json();
  } catch {
    return {
      accounts: [
        {
          role: 'Lead Software Architect',
          name: 'Jordan Davis',
          email: 'jordan.lead@enterprise.io',
          organization: 'Enterprise Core Platforms',
          samplePassword: 'Password123!',
        },
        {
          role: 'Senior QA & Validation Engineer',
          name: 'Alexa Chen',
          email: 'alexa.qa@reqdetective.io',
          organization: 'Global FinTech Systems',
          samplePassword: 'Password123!',
        },
        {
          role: 'Principal Product Manager',
          name: 'Marcus Vance',
          email: 'marcus.pm@apexcloud.io',
          organization: 'Apex Cloud Innovations',
          samplePassword: 'Password123!',
        },
      ],
    };
  }
}

export async function analyzeRequirementApi(payload: {

  projectContext: string;
  requirementText: string;
  type: string;
  priority: string;
}): Promise<{ source: string; data: AnalysisResponseData }> {
  const response = await fetch('/api/analyze-requirement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function changeImpactApi(payload: {
  oldRequirement: string;
  newRequirement: string;
  projectContext: string;
}): Promise<{ source: string; data: ChangeImpactResult }> {
  const response = await fetch('/api/change-impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function generateQuestionsApi(payload: {
  projectDescription: string;
  requirements: any[];
  domain: string;
}): Promise<{ source: string; data: SmartQuestionItem[] }> {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function batchAuditApi(payload: {
  projectName: string;
  projectDescription: string;
  requirements: any[];
}): Promise<{ source: string; data: any }> {
  const response = await fetch('/api/batch-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function checkHealthApi(): Promise<{ status: string; aiEnabled: boolean }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'offline', aiEnabled: false };
  }
}
