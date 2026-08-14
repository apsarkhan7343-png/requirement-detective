import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
  salt: string;
  hash: string;
  createdAt: string;
}

const usersDb = new Map<string, StoredUser>();
const activeSessions = new Map<string, string>(); // token -> userId

function hashPassword(password: string, customSalt?: string): { salt: string; hash: string } {
  const salt = customSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const checkHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(checkHash, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// Initialize seed demo accounts with cryptographically hashed passwords
const seedDemoUsers = () => {
  const demoAccounts = [
    {
      id: "usr-architect-1",
      email: "jordan.lead@enterprise.io",
      name: "Jordan Davis",
      role: "Lead Software Architect",
      organization: "Enterprise Core Platforms",
      password: "Password123!",
      avatar: "JD",
    },
    {
      id: "usr-qa-2",
      email: "alexa.qa@reqdetective.io",
      name: "Alexa Chen",
      role: "Senior QA & Validation Engineer",
      organization: "Global FinTech Systems",
      password: "Password123!",
      avatar: "AC",
    },
    {
      id: "usr-product-3",
      email: "marcus.pm@apexcloud.io",
      name: "Marcus Vance",
      role: "Principal Product Manager",
      organization: "Apex Cloud Innovations",
      password: "Password123!",
      avatar: "MV",
    },
  ];

  for (const account of demoAccounts) {
    const key = account.email.toLowerCase();
    if (!usersDb.has(key)) {
      const { salt, hash } = hashPassword(account.password);
      usersDb.set(key, {
        id: account.id,
        email: key,
        name: account.name,
        role: account.role,
        organization: account.organization,
        avatar: account.avatar,
        salt,
        hash,
        createdAt: new Date().toISOString(),
      });
    }
  }
};

seedDemoUsers();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to initialize Gemini safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  };

  // Resilient Gemini generator with automatic model fallback for 503 / high demand spikes
  async function generateGeminiContentWithFallback(
    ai: GoogleGenAI,
    request: {
      contents: string;
      config?: any;
      preferredModel?: string;
    }
  ): Promise<string | null> {
    const candidateModels = [
      request.preferredModel || "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3.7-flash",
    ];

    // Deduplicate candidate models
    const models = Array.from(new Set(candidateModels));

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: request.contents,
          config: request.config,
        });

        if (response?.text) {
          return response.text;
        }
      } catch (err: any) {
        const isTransientDemand =
          err?.status === 503 ||
          err?.status === "UNAVAILABLE" ||
          err?.code === 503 ||
          String(err?.message || "").includes("high demand") ||
          String(err?.message || "").includes("503") ||
          String(err?.message || "").includes("429");

        console.warn(
          `[Gemini Engine] Model '${model}' call notice (${isTransientDemand ? "transient demand spike" : "error"}):`,
          err?.message || err
        );
      }
    }

    return null;
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({ status: "ok", aiEnabled: hasKey, timestamp: new Date().toISOString() });
  });

  // ==========================================
  // Modern Secure User Authentication Endpoints
  // ==========================================

  // Signup Endpoint
  app.post("/api/auth/signup", (req, res) => {
    const {
      email,
      password,
      name,
      role = "Lead Software Architect",
      organization = "Enterprise Engineering",
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Full name, work email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid work email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    if (usersDb.has(cleanEmail)) {
      return res.status(409).json({ error: "An account with this work email already exists" });
    }

    const { salt, hash } = hashPassword(password);
    const userId = `usr-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const initials =
      name
        .split(" ")
        .map((n: string) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "US";

    const newUser: StoredUser = {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: role.trim(),
      organization: organization.trim(),
      avatar: initials,
      salt,
      hash,
      createdAt: new Date().toISOString(),
    };

    usersDb.set(cleanEmail, newUser);

    const token = `reqdet_${crypto.randomBytes(32).toString("hex")}`;
    activeSessions.set(token, userId);

    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      organization: newUser.organization,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      user: safeUser,
      token,
      message: "Account created successfully",
    });
  });

  // Login Endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = usersDb.get(cleanEmail);

    if (!user || !verifyPassword(password, user.salt, user.hash)) {
      return res.status(401).json({ error: "Invalid work email or password. Please verify your credentials." });
    }

    const token = `reqdet_${crypto.randomBytes(32).toString("hex")}`;
    activeSessions.set(token, user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return res.json({
      user: safeUser,
      token,
      message: "Signed in successfully",
    });
  });

  // Current authenticated user verification (Me endpoint)
  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token || !activeSessions.has(token)) {
      return res.status(401).json({ authenticated: false, error: "No active session" });
    }

    const userId = activeSessions.get(token);
    const user = Array.from(usersDb.values()).find((u) => u.id === userId);

    if (!user) {
      return res.status(401).json({ authenticated: false, error: "User record not found" });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return res.json({ authenticated: true, user: safeUser });
  });

  // Logout Endpoint
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (token) {
      activeSessions.delete(token);
    }

    return res.json({ status: "ok", message: "Logged out successfully" });
  });

  // Demo Accounts endpoint for testing convenience
  app.get("/api/auth/demo-accounts", (_req, res) => {
    res.json({
      accounts: [
        {
          role: "Lead Software Architect",
          name: "Jordan Davis",
          email: "jordan.lead@enterprise.io",
          organization: "Enterprise Core Platforms",
          samplePassword: "Password123!",
        },
        {
          role: "Senior QA & Validation Engineer",
          name: "Alexa Chen",
          email: "alexa.qa@reqdetective.io",
          organization: "Global FinTech Systems",
          samplePassword: "Password123!",
        },
        {
          role: "Principal Product Manager",
          name: "Marcus Vance",
          email: "marcus.pm@apexcloud.io",
          organization: "Apex Cloud Innovations",
          samplePassword: "Password123!",
        },
      ],
    });
  });


  // 1. Single Requirement Deep Analysis
  app.post("/api/analyze-requirement", async (req, res) => {
    const { projectContext, requirementText, type = "Functional", priority = "High" } = req.body;

    if (!requirementText || typeof requirementText !== "string") {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a Principal Software Requirement Engineer and Senior Quality Assurance Architect.
Perform a rigorous IEEE 830 and ISO/IEC/IEEE 29148 standards audit on the following software requirement.

Project Context: ${projectContext || "Enterprise Software System"}
Requirement Statement: "${requirementText}"
Provided Requirement Type: ${type}
Provided Priority: ${priority}

Analyze and generate a comprehensive JSON response detecting:
1. Ambiguity & Measurability: Identify subjective adjectives (e.g., 'fast', 'secure', 'quickly', 'easy', 'user-friendly', 'scalable') that cannot be deterministically tested.
2. Missing Requirements: Identify omitted companion requirements (e.g., error recovery, offline fallback, audit logging, rate limiting, token expiration).
3. Conflicts: Detect collisions with system-wide policies (e.g., zero-trust auth, idempotency, data privacy).
4. Risks: Identify operational, architectural, business logic, or compliance risks.
5. Security Concerns: Specific threat boundaries, data-in-transit, data-at-rest, access control, and OWASP concerns.
6. Performance Concerns: Latency, throughput, resource consumption, and concurrent load thresholds.
7. Testability Problems: Verification and automated QA barriers preventing binary pass/fail criteria.
8. Completeness & Consistency: Check coverage of happy path, edge cases, and failure modes.
9. Verified Requirement Type & Recommended Priority: Classify actual requirement type and priority with rationale.
10. Metric Scores (0-100): overallQualityScore, clarityScore, completenessScore, consistencyScore, testabilityScore, riskScore (higher means higher risk severity).
11. Structured Problems Detected: Array of discrete defects with category, issue description, severity, and impact.
12. Smart Clarification Questions: Concrete questions for stakeholders (Architect, InfoSec, Product Owner, QA Lead) with rationale.
13. Improved Requirement: Deterministic rewrite using quantitative thresholds, concrete SLAs, and standard specifications.
14. BDD / Gherkin Acceptance Test Cases: Given/When/Then scenarios (Happy Path, Negative Test, Boundary Condition, Security/SLA check).`;

        const text = await generateGeminiContentWithFallback(ai, {
          preferredModel: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallQualityScore: { type: Type.NUMBER, description: "0 to 100 overall IEEE 830 quality score" },
                qualityScore: { type: Type.NUMBER, description: "Alias for overall quality score" },
                clarityScore: { type: Type.NUMBER, description: "0 to 100 clarity and precision rating" },
                completenessScore: { type: Type.NUMBER, description: "0 to 100 edge-case and boundary coverage" },
                consistencyScore: { type: Type.NUMBER, description: "0 to 100 architectural and logic consistency" },
                testabilityScore: { type: Type.NUMBER, description: "0 to 100 automated acceptance verification rating" },
                riskScore: { type: Type.NUMBER, description: "0 to 100 engineering risk severity index" },
                securityScore: { type: Type.NUMBER, description: "0 to 100 security rigor score" },
                performanceScore: { type: Type.NUMBER, description: "0 to 100 performance SLA score" },
                detectedRequirementType: { type: Type.STRING, description: "Functional, Non-Functional, Security, Performance, UI/UX, Integration, Compliance, Data Privacy" },
                recommendedPriority: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                priorityReasoning: { type: Type.STRING, description: "Why this priority level is recommended" },
                ambiguityLevel: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
                ambiguityScore: { type: Type.NUMBER, description: "0 to 100 ambiguity rating" },
                problemExplanation: { type: Type.STRING, description: "In-depth explanation of flaws, lack of measurability, and risks" },
                missingInformation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific missing quantitative thresholds, error boundaries, or protocols",
                },
                problemsDetected: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING, description: "Ambiguity, Security, Performance, Testability, Compliance, Edge Case" },
                      issue: { type: Type.STRING },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      impact: { type: Type.STRING },
                    },
                    required: ["category", "issue", "severity", "impact"],
                  },
                },
                securityConcerns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      issue: { type: Type.STRING },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      recommendation: { type: Type.STRING },
                    },
                    required: ["issue", "severity", "recommendation"],
                  },
                },
                performanceConcerns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      issue: { type: Type.STRING },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      recommendation: { type: Type.STRING },
                    },
                    required: ["issue", "severity", "recommendation"],
                  },
                },
                testabilityProblems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      issue: { type: Type.STRING },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      recommendation: { type: Type.STRING },
                    },
                    required: ["issue", "severity", "recommendation"],
                  },
                },
                suggestedImprovement: { type: Type.STRING, description: "Exact rewritten requirement conforming to IEEE 830 standards" },
                whyBetter: { type: Type.STRING, description: "Why the rewritten requirement is superior and verifiable" },
                detectedRisks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING, description: "Security, Performance, Scalability, Data Privacy, Business Logic, Compliance" },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      description: { type: Type.STRING },
                      mitigation: { type: Type.STRING },
                    },
                    required: ["category", "severity", "description", "mitigation"],
                  },
                },
                missingRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      module: { type: Type.STRING },
                      title: { type: Type.STRING },
                      severity: { type: Type.STRING, description: "Critical, High, Medium, Low" },
                      suggestedQuestion: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      suggestedRequirement: { type: Type.STRING },
                    },
                    required: ["module", "title", "severity", "suggestedQuestion", "rationale"],
                  },
                },
                questionsToClient: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      question: { type: Type.STRING },
                      targetStakeholder: { type: Type.STRING, description: "e.g. Lead Architect, InfoSec Officer, Product Owner, QA Lead" },
                      rationale: { type: Type.STRING },
                    },
                    required: ["category", "question", "targetStakeholder", "rationale"],
                  },
                },
                testCases: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, description: "Happy Path, Negative Test, Boundary Condition, Security Verification" },
                      gherkin: { type: Type.STRING, description: "Given ... When ... Then ..." },
                    },
                    required: ["title", "type", "gherkin"],
                  },
                },
                potentialConflicts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      conflictingWith: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      suggestedResolution: { type: Type.STRING },
                    },
                    required: ["conflictingWith", "reason", "suggestedResolution"],
                  },
                },
              },
              required: [
                "overallQualityScore",
                "clarityScore",
                "completenessScore",
                "consistencyScore",
                "testabilityScore",
                "riskScore",
                "detectedRequirementType",
                "recommendedPriority",
                "priorityReasoning",
                "ambiguityLevel",
                "ambiguityScore",
                "problemExplanation",
                "missingInformation",
                "suggestedImprovement",
                "whyBetter",
                "detectedRisks",
                "missingRequirements",
                "questionsToClient",
                "testCases",
              ],
            },
          },
        });

        if (text) {
          const parsed = JSON.parse(text.trim());
          if (!parsed.qualityScore && parsed.overallQualityScore) {
            parsed.qualityScore = parsed.overallQualityScore;
          }
          return res.json({ source: "gemini", data: parsed });
        }
      } catch (err) {
        console.error("Gemini analyze-requirement error:", err);
      }
    }

    // Heuristic rule-based fallback analysis
    const textLower = requirementText.toLowerCase();
    const isFastAndSecure = (textLower.includes("fast") || textLower.includes("quick")) && (textLower.includes("secure") || textLower.includes("safe"));
    const isVagueSpeed = textLower.includes("quickly") || textLower.includes("fast") || textLower.includes("performant") || textLower.includes("smooth");
    const isVagueSecurity = textLower.includes("secure") || textLower.includes("safe") || textLower.includes("protect");
    const isVagueUX = textLower.includes("user friendly") || textLower.includes("easy") || textLower.includes("intuitive") || textLower.includes("simple");
    const isCancel = textLower.includes("cancel") || textLower.includes("order") || textLower.includes("refund");
    const isPayment = textLower.includes("pay") || textLower.includes("checkout") || textLower.includes("credit") || textLower.includes("stripe");

    let ambiguityLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let ambiguityScore = 20;
    let qualityScore = 75;
    let clarityScore = 80;
    let completenessScore = 70;
    let consistencyScore = 75;
    let testabilityScore = 70;
    let riskScore = 25;
    let detectedType = type;
    let recommendedPriority: "Critical" | "High" | "Medium" | "Low" = priority as any;
    let priorityReasoning = "Matches initial project priority guidelines.";
    const missingInfo: string[] = [];
    let explanation = "The requirement provides a baseline description but needs formal engineering metrics.";
    let rewrite = requirementText;
    let whyBetter = "Provides quantitative thresholds and measurable verification criteria.";

    const problems: Array<{ category: string; issue: string; severity: "Critical" | "High" | "Medium" | "Low"; impact: string }> = [];
    const securityConcerns: Array<{ issue: string; severity: "Critical" | "High" | "Medium" | "Low"; recommendation: string }> = [];
    const performanceConcerns: Array<{ issue: string; severity: "Critical" | "High" | "Medium" | "Low"; recommendation: string }> = [];
    const testabilityProblems: Array<{ issue: string; severity: "Critical" | "High" | "Medium" | "Low"; recommendation: string }> = [];

    if (isFastAndSecure) {
      ambiguityLevel = "CRITICAL";
      ambiguityScore = 92;
      qualityScore = 18;
      clarityScore = 15;
      completenessScore = 20;
      consistencyScore = 50;
      testabilityScore = 12;
      riskScore = 88;
      detectedType = "Non-Functional";
      recommendedPriority = "Critical";
      priorityReasoning = "Unbounded performance and abstract security create catastrophic architectural risk and blocking QA failure.";
      explanation = "The terms 'fast' and 'secure' are purely qualitative, subjective, and non-measurable. 'Fast' lacks concrete latency (TTFB/p95/p99) and concurrent load definitions, while 'secure' specifies no encryption ciphers, authentication protocols, session rules, or threat protection standards.";
      missingInfo.push(
        "Quantitative page load & latency SLA (e.g. Largest Contentful Paint < 2.5s, TTFB < 200ms at p95)",
        "Target concurrent user load and geographical latency bounds (e.g. 5,000 active sessions)",
        "Transport & storage cryptographic standards (e.g. TLS 1.3, AES-256-GCM)",
        "Authentication & session management policies (e.g. MFA, idle session termination after 15 min)",
        "OWASP Top 10 compliance & CSP header definitions"
      );
      rewrite = "The web application shall achieve a Largest Contentful Paint (LCP) under 2.5 seconds and Time to First Byte (TTFB) under 200ms at the 95th percentile with up to 5,000 concurrent active sessions. All communications must enforce TLS 1.3 with HSTS, data at rest encrypted via AES-256-GCM, and all public endpoints hardened against OWASP Top 10 vulnerabilities.";
      whyBetter = "Replaces subjective adjectives with deterministic millisecond bounds (LCP < 2.5s, TTFB < 200ms), explicit concurrency ceilings (5,000 users), and verifiable cryptographic protocols (TLS 1.3, AES-256-GCM, HSTS).";

      problems.push(
        { category: "Ambiguity", issue: "The adjective 'fast' has no quantitative latency or throughput metric.", severity: "Critical", impact: "QA engineers cannot create deterministic automated pass/fail benchmarks." },
        { category: "Security", issue: "The term 'secure' omits required cipher suites, token mechanics, and compliance frameworks.", severity: "Critical", impact: "Leaves system exposed to data breaches and zero-day injection attacks." },
        { category: "Testability", issue: "Lack of pass/fail criteria prevents automated regression and load testing.", severity: "High", impact: "Release sign-off becomes subjective and dispute-prone." }
      );
      securityConcerns.push(
        { issue: "Unspecified transport encryption and header policies.", severity: "High", recommendation: "Enforce TLS 1.3, HSTS (max-age=31536000), and Content Security Policy (CSP Level 3)." },
        { issue: "Missing input sanitization and rate-limiting specifications.", severity: "High", recommendation: "Implement parameterized queries and token-bucket API rate limits (100 req/min/IP)." }
      );
      performanceConcerns.push(
        { issue: "Undefined p95/p99 response latency thresholds under peak traffic.", severity: "High", recommendation: "Specify p95 response time < 2.0s and LCP < 2.5s under 5,000 active users." }
      );
      testabilityProblems.push(
        { issue: "Acceptance criteria cannot verify subjective speed and security claims.", severity: "Critical", recommendation: "Implement automated Lighthouse performance assertions and OWASP ZAP security test suites." }
      );
    } else if (isVagueSpeed) {
      ambiguityLevel = "HIGH";
      ambiguityScore = 85;
      qualityScore = 32;
      clarityScore = 30;
      completenessScore = 40;
      consistencyScore = 60;
      testabilityScore = 25;
      riskScore = 75;
      detectedType = "Performance";
      recommendedPriority = "High";
      priorityReasoning = "Performance SLAs directly govern infrastructure sizing, caching layer design, and database indexing.";
      explanation = "'Quickly' or 'fast' is qualitative and non-measurable. What constitutes acceptable response time under specific network conditions, device profiles, or concurrent loads?";
      missingInfo.push("Explicit response time threshold (e.g. p95 < 2.0s, p99 < 3.5s)", "Target concurrent load definition (e.g. 1,000 active sessions)", "Network bandwidth assumptions (e.g. 4G / 100Mbps)");
      rewrite = `The system shall process and respond to ${requirementText.replace(/quickly|fast/gi, "").trim()} within 2.0 seconds at the 95th percentile under standard network latency (<100ms) with up to 1,000 concurrent sessions.`;
      whyBetter = "Replaces subjective speed claims with deterministic millisecond bounds and concrete concurrency targets.";

      problems.push({ category: "Ambiguity", issue: "Unspecified latency tolerances.", severity: "High", impact: "Cannot benchmark server capacity or auto-scaling thresholds." });
      performanceConcerns.push({ issue: "Unbounded query latency under high traffic.", severity: "High", recommendation: "Add Redis caching, query pagination, and database connection pooling." });
      testabilityProblems.push({ issue: "Load tests have no SLA threshold to validate against.", severity: "High", recommendation: "Define k6 load test scenarios targeting 2.0s p95 SLA." });
    } else if (isVagueSecurity) {
      ambiguityLevel = "HIGH";
      ambiguityScore = 80;
      qualityScore = 35;
      clarityScore = 35;
      completenessScore = 42;
      consistencyScore = 65;
      testabilityScore = 30;
      riskScore = 82;
      detectedType = "Security";
      recommendedPriority = "Critical";
      priorityReasoning = "Security ambiguities lead to vulnerabilities, compliance violations, and data exposure.";
      explanation = "'Secure' is too abstract. It does not state specific cipher suites, authentication requirements, access controls, or compliance frameworks.";
      missingInfo.push("Encryption standards (e.g., TLS 1.3 in transit, AES-256 at rest)", "Authentication mechanisms (e.g., MFA, OAuth 2.0 PKCE)", "Session invalidation and timeout policies");
      rewrite = `The system shall enforce TLS 1.3 for all endpoints, encrypt sensitive data at rest using AES-256-GCM, and require MFA for administrative privileges with a 15-minute idle timeout.`;
      whyBetter = "Specifies verifiable cryptographic standards and role-based policies instead of generic security claims.";

      problems.push({ category: "Security", issue: "Undefined cryptographic algorithms and key management.", severity: "Critical", impact: "Leaves database and data in-transit susceptible to interception." });
      securityConcerns.push({ issue: "Unspecified access control levels (RBAC).", severity: "High", recommendation: "Enforce least-privilege RBAC with signed JWT claims." });
    } else if (isVagueUX) {
      ambiguityLevel = "HIGH";
      ambiguityScore = 75;
      qualityScore = 40;
      clarityScore = 40;
      completenessScore = 45;
      consistencyScore = 70;
      testabilityScore = 35;
      riskScore = 55;
      detectedType = "UI/UX";
      recommendedPriority = "Medium";
      priorityReasoning = "Usability standards ensure compliance with accessibility laws and predictable user conversion.";
      explanation = "'User friendly' and 'intuitive' cannot be verified in automated testing or acceptance criteria.";
      missingInfo.push("WCAG 2.1 AA accessibility compliance", "Task completion rate targets (e.g., 90% without error)", "Standardized usability benchmark (e.g., SUS > 80)");
      rewrite = `The user interface shall adhere to WCAG 2.1 Level AA accessibility guidelines and allow standard users to complete the primary flow in fewer than 4 interactions with zero fatal validation blocks.`;
      whyBetter = "Maps UX quality to measurable WCAG accessibility standards and maximum user interaction steps.";
    } else if (isCancel) {
      ambiguityLevel = "MEDIUM";
      ambiguityScore = 60;
      qualityScore = 55;
      clarityScore = 50;
      completenessScore = 52;
      consistencyScore = 60;
      testabilityScore = 60;
      riskScore = 65;
      detectedType = "Functional";
      recommendedPriority = "High";
      priorityReasoning = "Cancellation state transitions impact warehouse fulfillment and payment gateway chargeback windows.";
      explanation = "Cancellation states must define finite state transitions, cutoff triggers, and financial reversal handling.";
      missingInfo.push("Order fulfillment state boundaries (e.g., prior to 'Dispatched' status)", "Refund execution SLA & gateway reversal policy", "Inventory restocking triggers");
      rewrite = `Users shall be permitted to cancel orders only while the order status is 'Pending Payment' or 'Processing'. Once updated to 'Shipped/Dispatched', cancellations are disabled and users must initiate the return flow.`;
      whyBetter = "Eliminates state-machine ambiguity and aligns customer capabilities with warehouse logistics.";
    } else {
      ambiguityLevel = "LOW";
      ambiguityScore = 30;
      qualityScore = 75;
      clarityScore = 78;
      completenessScore = 70;
      consistencyScore = 80;
      testabilityScore = 75;
      riskScore = 30;
      detectedType = type;
      recommendedPriority = priority as any;
      explanation = "Requirement has clear action verbs, but needs concrete failure criteria and observability metrics.";
      missingInfo.push("Audit logging requirements", "Graceful error fallback messaging", "Retry backoff limits");
      rewrite = `${requirementText.trim().replace(/\.$/, "")}, logging all transaction IDs to the centralized audit store and displaying localized error alerts upon downstream timeout.`;
      whyBetter = "Adds mandatory observability and structured error handling.";
    }

    const fallbackResponse = {
      overallQualityScore: qualityScore,
      qualityScore,
      clarityScore,
      completenessScore,
      consistencyScore,
      testabilityScore,
      riskScore,
      securityScore: isPayment || isVagueSecurity || isFastAndSecure ? 88 : 75,
      performanceScore: isVagueSpeed || isFastAndSecure ? 50 : 82,
      detectedRequirementType: detectedType,
      recommendedPriority,
      priorityReasoning,
      ambiguityLevel,
      ambiguityScore,
      problemExplanation: explanation,
      missingInformation: missingInfo.length ? missingInfo : ["Exact latency targets", "Failure retry strategy"],
      problemsDetected: problems.length ? problems : [
        { category: "Ambiguity", issue: "Unspecified quantitative thresholds.", severity: ambiguityScore > 70 ? "High" : "Medium", impact: "Increases acceptance ambiguity and risk of rework." }
      ],
      securityConcerns: securityConcerns.length ? securityConcerns : [
        { issue: "Input boundaries and auth token scopes must be verified.", severity: "Medium", recommendation: "Enforce JWT authentication and strict input validation." }
      ],
      performanceConcerns: performanceConcerns.length ? performanceConcerns : [
        { issue: "Latency limits under concurrent traffic need SLA contracts.", severity: "Medium", recommendation: "Add Redis cache for read-heavy operations." }
      ],
      testabilityProblems: testabilityProblems.length ? testabilityProblems : [
        { issue: "Manual QA required without explicit acceptance benchmarks.", severity: "Medium", recommendation: "Define deterministic BDD Gherkin test criteria." }
      ],
      suggestedImprovement: rewrite,
      whyBetter,
      detectedRisks: [
        {
          category: isPayment ? "Data Privacy & Compliance" : isFastAndSecure || isVagueSpeed ? "Performance" : "Security",
          severity: ambiguityScore > 70 ? "High" : "Medium",
          description: isPayment
            ? "Missing PCI-DSS tokenization guidelines and idempotent payment replay protection."
            : isFastAndSecure
            ? "Unbounded performance expectations and undefined security baselines expose application to DDoS and compliance audit failure."
            : isVagueSpeed
            ? "Unbounded query latency could trigger resource exhaustion during peak traffic."
            : "Undefined input boundary constraints may allow payload overflows.",
          mitigation: isPayment
            ? "Adopt Stripe Elements / client-side tokenization with strict server-side idempotency keys."
            : isFastAndSecure
            ? "Enforce CDN edge caching, p95 response time monitoring, TLS 1.3, and automated security scans."
            : "Implement database indexing, Redis query caching, and connection pooling limits.",
        },
        {
          category: "Business Logic",
          severity: "Medium",
          description: "Lack of explicit state machine transitions may cause phantom transactions or race conditions.",
          mitigation: "Document formal finite state machine (FSM) table with transactional database locks.",
        },
      ],
      missingRequirements: [
        {
          module: isPayment ? "Payment Module" : isFastAndSecure ? "Infrastructure & Security Engine" : "Authentication & Error Engine",
          title: isFastAndSecure ? "Edge Caching & DDoS Mitigation" : isPayment ? "Payment Failure & Re-attempt Handling" : "System Degradation & Offline Cache",
          severity: "High",
          suggestedQuestion: isFastAndSecure
            ? "What Cloudflare / WAF edge caching rules and rate limits should be established for static and API assets?"
            : isPayment
            ? "What should happen if the payment gateway returns an HTTP 504 timeout after the bank card has been debited?"
            : "What is the expected fallback state if the external authentication microservice is unreachable?",
          rationale: "Unspecified edge cases create high-cost production defects and customer churn.",
          suggestedRequirement: isFastAndSecure
            ? "The system shall implement Cloudflare WAF with rate limiting (100 req/min per IP) and edge caching for static assets with TTL 86400s."
            : "The system shall gracefully fallback to cached permissions when auth microservice latency exceeds 2.5s."
        },
        {
          module: "Audit & Observability",
          title: "Structured Audit Trail & Telemetry",
          severity: "Medium",
          suggestedQuestion: "How long should user audit logs be retained for compliance audits and dispute resolution?",
          rationale: "Enterprise software requires immutable audit trails for dispute resolution.",
          suggestedRequirement: "All security-critical actions and API errors shall be logged with correlation IDs to OpenTelemetry with a 90-day retention policy."
        },
      ],
      questionsToClient: [
        {
          category: isFastAndSecure ? "Performance Architecture" : isPayment ? "Payments & Finance" : "Architecture",
          question: isFastAndSecure
            ? "What are the exact target p95 and p99 response time limits (e.g. < 1.5s) and expected global geographic regions?"
            : isPayment
            ? "What payment gateways must be supported in v1 (e.g., Stripe, PayPal, Apple Pay) and what are their chargeback SLAs?"
            : "What is the peak target user concurrency and expected geographic distribution?",
          targetStakeholder: "Technical Architect",
          rationale: "Determines infrastructure provisioning, CDN placement, and database connection pooling design.",
        },
        {
          category: "Security & Compliance",
          question: isFastAndSecure
            ? "What regulatory frameworks must this application comply with (e.g. SOC2 Type II, ISO 27001, GDPR, HIPAA)?"
            : "What role-based access control (RBAC) levels are permitted to override or bypass this workflow?",
          targetStakeholder: "InfoSec Officer / Lead BA",
          rationale: "Ensures compliance certification readiness and prevents costly architectural rewrites.",
        },
        {
          category: "Testing & Quality Assurance",
          question: isFastAndSecure
            ? "Will automated penetration testing and load tests be run against staging environments prior to production release?"
            : "If this operation fails repeatedly after 3 retries, should the user be routed to live support or a ticketing fallback?",
          targetStakeholder: "QA Lead / Release Manager",
          rationale: "Establishes automated release gating criteria and prevents production outages.",
        },
      ],
      testCases: [
        {
          title: isFastAndSecure ? "Performance SLA - Page Load Time Under Load" : "Happy Path - Standard Execution",
          type: isFastAndSecure ? "Performance SLA" : "Happy Path",
          gherkin: isFastAndSecure
            ? `Scenario: Measure page load time under peak concurrency\n  Given 2,500 active simulated users on the system\n  When a user requests the application dashboard\n  Then the Time to First Byte (TTFB) must be under 200 milliseconds\n  And the Largest Contentful Paint (LCP) must occur in under 2500 milliseconds.`
            : `Scenario: Successful execution within SLA\n  Given the user is authenticated with valid credentials\n  When the user initiates the '${requirementText.substring(0, 30)}...' action\n  Then the system shall successfully process the request within 2 seconds\n  And return a HTTP 200 Success status with structured payload.`,
        },
        {
          title: isFastAndSecure ? "Security Audit - Cryptographic Transport Verification" : "Negative Test - Network Timeout Handling",
          type: isFastAndSecure ? "Security Verification" : "Negative Test",
          gherkin: isFastAndSecure
            ? `Scenario: Verify mandatory TLS 1.3 and HSTS security headers\n  Given a client dispatches an HTTP request to any API endpoint\n  When the server receives the connection\n  Then it must strictly enforce TLS 1.3 with a 256-bit cipher suite\n  And include the Strict-Transport-Security header with max-age=31536000.`
            : `Scenario: Downstream provider timeout handling\n  Given the downstream provider takes longer than 5000ms to respond\n  When the user submits the request\n  Then the system shall abort the request gracefully\n  And display a user-friendly retry alert without repeating the charge.`,
        },
        {
          title: "Boundary Test - Concurrent Duplicate Submission",
          type: "Boundary Condition",
          gherkin: `Scenario: Prevent duplicate operations with idempotency keys\n  Given an active transaction is already in-flight for this user session\n  When a second duplicate request is dispatched simultaneously\n  Then the system shall reject the duplicate using idempotency key verification\n  And return a HTTP 409 Conflict without duplicate processing.`,
        },
      ],
      potentialConflicts: [
        {
          conflictingWith: "Global Session Security Policy (SEC-04)",
          reason: "High concurrency without token refresh throttling may exceed authentication token rate limits.",
          suggestedResolution: "Introduce rolling JWT refresh tokens with Redis-backed rate limiting.",
        },
      ],
    };

    return res.json({ source: "fallback", data: fallbackResponse });
  });

  // 2. Change Impact Analysis
  app.post("/api/change-impact", async (req, res) => {
    const { oldRequirement, newRequirement, projectContext, modules = [] } = req.body;

    if (!oldRequirement || !newRequirement) {
      return res.status(400).json({ error: "oldRequirement and newRequirement are required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a Lead Software Architect conducting a rigorous Change Impact Analysis.
Project Context: ${projectContext || "Enterprise SaaS Platform"}
Original Requirement: "${oldRequirement}"
Modified Requirement: "${newRequirement}"

Analyze the ripple effects of modifying this requirement.
Determine:
1. Impact Score (0 to 100)
2. Affected Modules (e.g. Order Management, Payments, Notification Service, Database Schema, Analytics, Third-party Integrations)
3. Specific technical reasons why each module is impacted
4. Potential regression risks and breaking API changes
5. Required database migrations / state machine schema changes
6. Recommended QA test suites and re-verification priority.`;

        const text = await generateGeminiContentWithFallback(ai, {
          preferredModel: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                impactScore: { type: Type.NUMBER, description: "0 to 100" },
                impactLevel: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
                summary: { type: Type.STRING, description: "High-level summary of the semantic change" },
                affectedModules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      riskLevel: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, or CRITICAL" },
                      impactPercentage: { type: Type.NUMBER, description: "0 to 100" },
                      reason: { type: Type.STRING },
                      requiredChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["name", "riskLevel", "impactPercentage", "reason", "requiredChanges"],
                  },
                },
                breakingChanges: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                databaseImpact: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                regressionRisks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["impactScore", "impactLevel", "summary", "affectedModules", "breakingChanges", "databaseImpact", "regressionRisks", "recommendedActions"],
            },
          },
        });

        if (text) {
          const parsed = JSON.parse(text.trim());
          return res.json({ source: "gemini", data: parsed });
        }
      } catch (err) {
        console.error("Gemini change-impact error:", err);
      }
    }

    // Heuristic fallback
    const isOrderCancellationChange = oldRequirement.toLowerCase().includes("cancel") && newRequirement.toLowerCase().includes("shipping");
    
    const fallbackImpact = {
      impactScore: isOrderCancellationChange ? 82 : 74,
      impactLevel: "HIGH",
      summary: `Changing policy from '${oldRequirement}' to '${newRequirement}' introduces strict state boundaries and alters downstream fulfillment logistics.`,
      affectedModules: [
        {
          name: "Order Management Engine",
          riskLevel: "HIGH",
          impactPercentage: 88,
          reason: "Order state machine must now enforce a state check before accepting cancellation commands.",
          requiredChanges: [
            "Add pre-condition validation: reject cancellation if status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']",
            "Update REST API /orders/:id/cancel response codes to return 422 Unprocessable Entity when past shipment cutoff",
          ],
        },
        {
          name: "Payment & Automated Refund Gateway",
          riskLevel: "HIGH",
          impactPercentage: 80,
          reason: "Automatic gateway refund triggers must be disconnected for dispatched orders and shifted to manual RMA/Return review.",
          requiredChanges: [
            "Disable instant payment gateway reversal API webhook on shipped orders",
            "Add idempotency check to avoid double refunds if customer requests return post-delivery",
          ],
        },
        {
          name: "Warehouse & Shipping Logistics API",
          riskLevel: "MEDIUM",
          impactPercentage: 72,
          reason: "Carrier fulfillment status webhook must synchronously lock order cancellation capability in real time.",
          requiredChanges: [
            "Ingest 3PL carrier tracking event 'LABEL_GENERATED' as immediate cancellation lock trigger",
          ],
        },
        {
          name: "Customer Notifications & Email Dispatcher",
          riskLevel: "MEDIUM",
          impactPercentage: 65,
          reason: "Email templates must explain return guidelines instead of instant cancellation confirmation.",
          requiredChanges: [
            "Introduce 'Order Cannot Be Cancelled' informational email with Return Portal deep link",
          ],
        },
        {
          name: "Database & Transactional Rules",
          riskLevel: "HIGH",
          impactPercentage: 84,
          reason: "PostgreSQL constraint triggers and optimistic locking must be updated to prevent race conditions during warehouse dispatch.",
          requiredChanges: [
            "Add column orders.cancellation_lock_timestamp with database-level check constraint",
          ],
        },
      ],
      breakingChanges: [
        "API endpoint POST /api/v1/orders/:id/cancel now rejects orders with status >= 'SHIPPED'",
        "Webhook event order.cancelled will no longer fire for post-shipment customer inquiries",
      ],
      databaseImpact: [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispatch_lock BOOLEAN DEFAULT FALSE;",
        "UPDATE audit_log_triggers TO record cancellation attempts rejected due to shipping state.",
      ],
      regressionRisks: [
        "Race condition if carrier updates order to SHIPPED at the exact same millisecond user clicks Cancel",
        "Third-party marketplace syncing (e.g. Amazon / Shopify) may send cancellation signals that need special handling",
      ],
      recommendedActions: [
        "Execute end-to-end integration test with mock carrier webhook triggers",
        "Update API Documentation v2.4 with new 422 error response contract",
        "Deploy database migration during low-traffic maintenance window with transactional rollback support",
      ],
    };

    return res.json({ source: "fallback", data: fallbackImpact });
  });

  // 3. Smart Question Generation
  app.post("/api/generate-questions", async (req, res) => {
    const { projectDescription, requirements = [], domain = "General" } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are a Lead Software Business Analyst.
Generate high-value stakeholder elicitation questions to clarify missing specifications and edge cases for this project.

Domain: ${domain}
Project Description: ${projectDescription || "Enterprise Software System"}
Requirements:
${requirements.map((r: any, i: number) => `${i + 1}. [${r.type || "Functional"}] ${r.text || r}`).join("\n")}

Generate 10 to 15 prioritized questions grouped by categories (Authentication, Users, Payments, Orders, Security, Admin, Notifications, Performance, Data Privacy, Business Rules).`;

        const text = await generateGeminiContentWithFallback(ai, {
          preferredModel: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING, description: "Authentication, Users, Payments, Orders, Security, Admin, Notifications, Performance, Data, Business Rules" },
                      question: { type: Type.STRING },
                      context: { type: Type.STRING },
                      targetRole: { type: Type.STRING, description: "Client PM, Product Owner, Security Officer, CFO, DevOps" },
                      priority: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, LOW" },
                      defaultOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["id", "category", "question", "context", "targetRole", "priority"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        });

        if (text) {
          const parsed = JSON.parse(text.trim());
          return res.json({ source: "gemini", data: parsed.questions });
        }
      } catch (err) {
        console.error("Gemini generate-questions error:", err);
      }
    }

    // Default rich questions
    const fallbackQuestions = [
      {
        id: "q-1",
        category: "Payments",
        question: "What happens when payment fails after the user clicks confirm order?",
        context: "Undefined payment failure states can leave orders stuck in indeterminate states and cause inventory leakage.",
        targetRole: "Product Owner / CFO",
        priority: "CRITICAL",
        defaultOptions: [
          "Reserve inventory for 15 minutes and prompt card re-entry",
          "Immediately cancel order and release inventory stock",
          "Send automated payment recovery link via SMS/Email with 2-hour hold",
        ],
      },
      {
        id: "q-2",
        category: "Orders",
        question: "Can users cancel orders after shipping has commenced?",
        context: "Contradictory business rules between logistics policies and self-service cancellation.",
        targetRole: "Operations Lead",
        priority: "HIGH",
        defaultOptions: [
          "Strictly no; must initiate return process after delivery",
          "Yes, but charge return shipping restocking deduction",
          "Only support staff can intercept package with carrier fee",
        ],
      },
      {
        id: "q-3",
        category: "Admin",
        question: "Who can approve seller accounts and what identity verification is mandated?",
        context: "Missing onboarding compliance, KYC regulations, and administrative hierarchy.",
        targetRole: "Compliance Officer",
        priority: "HIGH",
        defaultOptions: [
          "Super Admin manual review with Stripe Identity KYC",
          "Automated OCR document verification with manual escalation fallback",
          "Tiered approval based on projected monthly GMV volume",
        ],
      },
      {
        id: "q-4",
        category: "Authentication",
        question: "What password complexity rules and multi-factor authentication (MFA) requirements apply?",
        context: "Vague requirement 'system should be secure' lacks explicit NIST 800-63B guidelines.",
        targetRole: "InfoSec Officer",
        priority: "HIGH",
        defaultOptions: [
          "Min 12 chars + mandatory TOTP/WebAuthn for all admin and financial roles",
          "Passwordless email magic link + Google/GitHub SSO OAuth",
          "Standard 8 chars with 90-day expiry and SMS OTP",
        ],
      },
      {
        id: "q-5",
        category: "Security",
        question: "What is the data retention and GDPR / 'Right to Be Forgotten' erasure policy for user history?",
        context: "Data privacy regulations require automated anonymization pipelines upon account closure.",
        targetRole: "Data Privacy Officer / Legal",
        priority: "CRITICAL",
        defaultOptions: [
          "Hard delete all personal data within 30 days, retain anonymized financial ledgers for 7 years",
          "Immediate pseudonymization of PII with cryptographic key shredding",
          "Soft delete with 90-day recovery grace window followed by permanent purge",
        ],
      },
      {
        id: "q-6",
        category: "Performance",
        question: "What is the peak expected concurrent load and acceptable p99 database response SLA?",
        context: "Performance requirements need concrete millisecond SLAs and load testing benchmarks.",
        targetRole: "Lead Architect / DevOps",
        priority: "MEDIUM",
        defaultOptions: [
          "10,000 peak concurrent users with p95 < 800ms and p99 < 2000ms",
          "50,000 peak users during flash sale events with autoscaling to 20 nodes",
          "Standard internal enterprise load (<500 concurrent sessions)",
        ],
      },
      {
        id: "q-7",
        category: "Notifications",
        question: "What fallback channels should be used if push notifications fail or are disabled by user?",
        context: "Critical order and transactional notifications require reliable delivery guarantees.",
        targetRole: "Product Manager",
        priority: "MEDIUM",
        defaultOptions: [
          "Fallback to transactional SMS via Twilio after 3 minutes of unread push",
          "Dispatch immediate email notification with in-app notification center badge",
          "In-app notification inbox only; no external SMS charges",
        ],
      },
      {
        id: "q-8",
        category: "Data",
        question: "How should concurrent edits to the same entity (e.g., inventory or order) be resolved?",
        context: "High-volume transactional systems face race conditions without explicit locking.",
        targetRole: "Database Architect",
        priority: "HIGH",
        defaultOptions: [
          "Optimistic concurrency control with version column and retry loop",
          "Pessimistic SELECT FOR UPDATE row locking with 3s timeout",
          "Distributed Redis Redlock token per SKU/Order ID",
        ],
      },
      {
        id: "q-9",
        category: "Business Rules",
        question: "What is the maximum allowed discount stacking policy across coupon codes and loyalty points?",
        context: "Unchecked coupon stacking creates financial vulnerability and promotional abuse.",
        targetRole: "Marketing / Finance Lead",
        priority: "MEDIUM",
        defaultOptions: [
          "Only 1 promotional coupon per order; loyalty points capped at 20% of subtotal",
          "Stackable coupons allowed up to a hard floor of wholesale cost + 5%",
          "Loyalty points apply after highest single coupon discount is computed",
        ],
      },
    ];

    return res.json({ source: "fallback", data: fallbackQuestions });
  });

  // 4. Batch Project Audit (Quality Score, Conflicts, Missing, Dependencies)
  app.post("/api/batch-audit", async (req, res) => {
    const { projectName, projectDescription, requirements = [] } = req.body;

    const ai = getGeminiClient();

    if (ai && requirements.length > 0) {
      try {
        const prompt = `You are a Principal Software Requirement Engineer auditing a complete software specification.

Project Name: ${projectName || "Software Project"}
Description: ${projectDescription || ""}
Requirements:
${requirements.map((r: any, i: number) => `Req #${i + 1} [ID: ${r.id || `REQ-${i+1}`} | Type: ${r.type || "Functional"}] "${r.text || r.title || r}"`).join("\n")}

Conduct a holistic analysis:
1. Overall Requirement Quality Score (0-100) & Subscores (Completeness, Clarity, Consistency, Testability, Security, Performance).
2. Detect all Missing Requirements & Missing Modules.
3. Detect Ambiguous Requirements with severity and exact rewritten improvements.
4. Detect Conflicting Requirements between pairs with suggested resolution.
5. Identify High and Critical Risks (Security, Performance, Scalability, Data Privacy, Business Logic).
6. Build a Dependency Flow Graph mapping nodes and edge relationships between features.`;

        const text = await generateGeminiContentWithFallback(ai, {
          preferredModel: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallQualityScore: { type: Type.NUMBER },
                completenessScore: { type: Type.NUMBER },
                clarityScore: { type: Type.NUMBER },
                consistencyScore: { type: Type.NUMBER },
                testabilityScore: { type: Type.NUMBER },
                securityScore: { type: Type.NUMBER },
                performanceScore: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                missingCount: { type: Type.NUMBER },
                ambiguousCount: { type: Type.NUMBER },
                conflictCount: { type: Type.NUMBER },
                riskCount: { type: Type.NUMBER },
                missingRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      module: { type: Type.STRING },
                      title: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      suggestedQuestion: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      suggestedRequirement: { type: Type.STRING },
                    },
                    required: ["id", "module", "title", "severity", "suggestedQuestion", "rationale"],
                  },
                },
                ambiguousRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      originalText: { type: Type.STRING },
                      ambiguityLevel: { type: Type.STRING },
                      problem: { type: Type.STRING },
                      missingInfo: { type: Type.STRING },
                      suggestedRewrite: { type: Type.STRING },
                    },
                    required: ["id", "originalText", "ambiguityLevel", "problem", "missingInfo", "suggestedRewrite"],
                  },
                },
                conflictingRequirements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      reqA: { type: Type.STRING },
                      reqB: { type: Type.STRING },
                      conflictType: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      suggestedResolution: { type: Type.STRING },
                    },
                    required: ["id", "reqA", "reqB", "conflictType", "severity", "explanation", "suggestedResolution"],
                  },
                },
                risks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      mitigation: { type: Type.STRING },
                    },
                    required: ["id", "category", "severity", "title", "description", "mitigation"],
                  },
                },
              },
              required: [
                "overallQualityScore",
                "completenessScore",
                "clarityScore",
                "consistencyScore",
                "testabilityScore",
                "securityScore",
                "performanceScore",
                "summary",
                "missingRequirements",
                "ambiguousRequirements",
                "conflictingRequirements",
                "risks",
              ],
            },
          },
        });

        if (text) {
          const parsed = JSON.parse(text.trim());
          return res.json({ source: "gemini", data: parsed });
        }
      } catch (err) {
        console.error("Gemini batch-audit error:", err);
      }
    }

    // Heuristic response
    return res.json({
      source: "fallback",
      data: {
        overallQualityScore: 86,
        completenessScore: 82,
        clarityScore: 84,
        consistencyScore: 88,
        testabilityScore: 89,
        securityScore: 85,
        performanceScore: 87,
        summary: "Audit detected 4 missing critical edge case specifications, 3 ambiguous qualitative statements, 2 cross-module semantic contradictions, and 5 infrastructure risks.",
        missingCount: 4,
        ambiguousCount: 3,
        conflictCount: 2,
        riskCount: 5,
        missingRequirements: [
          {
            id: "mis-1",
            module: "Payment Module",
            title: "Payment Failure & Retry Orchestration",
            severity: "High",
            suggestedQuestion: "What should happen if payment fails after the user submits an order?",
            rationale: "No handling specified for 3D Secure drop-offs, card declines, or gateway timeouts.",
            suggestedRequirement: "The system shall hold inventory reservations for 15 minutes during payment processing, retry failed authorizations up to 2 times, and release stock upon terminal decline.",
          },
          {
            id: "mis-2",
            module: "User & Security",
            title: "MFA & Session Revocation Policy",
            severity: "Critical",
            suggestedQuestion: "How should concurrent active sessions and password resets be synchronized?",
            rationale: "Missing immediate session revocation allows stolen tokens to persist after credential changes.",
            suggestedRequirement: "Upon password reset or email update, all active JWT refresh tokens across all client devices shall be immediately invalidated in the Redis session store.",
          },
          {
            id: "mis-3",
            module: "Data Retention",
            title: "GDPR Compliance & Erasure Pipeline",
            severity: "High",
            suggestedQuestion: "What is the automated process for user account deletion requests?",
            rationale: "Lack of GDPR / CCPA right-to-be-forgotten procedures poses compliance and legal liabilities.",
            suggestedRequirement: "User deletion requests shall trigger a 30-day pending purge, anonymize all transactional history, and remove all PII from operational backups.",
          },
          {
            id: "mis-4",
            module: "Inventory & Concurrency",
            title: "Deadlock & Flash-Sale Race Condition Handling",
            severity: "Medium",
            suggestedQuestion: "How does the system prevent overselling when 500 users buy the last available item simultaneously?",
            rationale: "Absence of atomic database decrements causes negative inventory stock.",
            suggestedRequirement: "Inventory decrements shall be executed atomically using Redis DECR or PostgreSQL UPDATE ... WHERE stock >= qty RETURNING stock.",
          },
        ],
        ambiguousRequirements: [
          {
            id: "amb-1",
            originalText: "Users should be able to login quickly.",
            ambiguityLevel: "HIGH",
            problem: "'Quickly' is a qualitative adjective that cannot be objectively verified or automated in QA tests.",
            missingInfo: "Exact latency threshold in milliseconds under defined network bandwidth and concurrent load.",
            suggestedRewrite: "Users shall be able to complete login authentication and receive a valid session token within 2.0 seconds (p95) under standard network conditions with up to 1,000 concurrent active users.",
          },
          {
            id: "amb-2",
            originalText: "The system should be secure.",
            ambiguityLevel: "HIGH",
            problem: "'Secure' is overly generic and does not specify cryptographic standards, authentication mechanisms, or compliance targets.",
            missingInfo: "Cipher suites, encryption at rest/transit, authentication protocols, and vulnerability patching SLAs.",
            suggestedRewrite: "The system shall enforce TLS 1.3 encryption in transit, AES-256 at rest for all database volumes, OAuth 2.0 with PKCE for mobile clients, and role-based access control (RBAC) with principle of least privilege.",
          },
          {
            id: "amb-3",
            originalText: "The website should be user friendly.",
            ambiguityLevel: "HIGH",
            problem: "'User friendly' is subjective and untestable in requirement engineering specifications.",
            missingInfo: "Accessibility compliance level (e.g. WCAG 2.1 AA), responsive viewport support, and error state guidelines.",
            suggestedRewrite: "The user interface shall comply with WCAG 2.1 Level AA accessibility standards, achieve a minimum contrast ratio of 4.5:1, and maintain full functionality across viewport widths from 360px to 3840px.",
          },
        ],
        conflictingRequirements: [
          {
            id: "conf-1",
            reqA: "Users can cancel orders anytime.",
            reqB: "Orders cannot be cancelled after shipping.",
            conflictType: "Direct Logical Contradiction",
            severity: "High",
            explanation: "Requirement A grants unrestricted cancellation privileges ('anytime'), whereas Requirement B introduces an irreversible state boundary ('after shipping').",
            suggestedResolution: "Refine Requirement A: 'Users may cancel orders self-service while the order status is in Pending or Processing. Once marked as Dispatched/Shipped, cancellations are disabled and users must follow the standard return process.'",
          },
          {
            id: "conf-2",
            reqA: "All customer analytics data must be retained forever for machine learning training.",
            reqB: "Customer personal records must be permanently deleted upon account closure within 30 days.",
            conflictType: "Regulatory & Data Policy Conflict",
            severity: "Critical",
            explanation: "Retaining identifying analytics forever directly breaches the 30-day permanent deletion requirement and GDPR Article 17.",
            suggestedResolution: "Anonymize analytics data by stripping all User IDs, IP addresses, and identifying metadata prior to appending to the ML training data lake upon account deletion.",
          },
        ],
        risks: [
          {
            id: "rsk-1",
            category: "Security",
            severity: "Critical",
            title: "Unbounded API Rate Limits on Auth Endpoints",
            description: "Lack of rate limiting allows credential stuffing and distributed brute-force attacks.",
            mitigation: "Implement token bucket rate limiting (max 5 failed attempts per 15 minutes per IP/Account) with Cloudflare WAF protection.",
          },
          {
            id: "rsk-2",
            category: "Performance",
            severity: "High",
            title: "Uncached Real-Time Global Inventory Queries",
            description: "Direct transactional database queries on every product page load will saturate PostgreSQL connection pools during traffic spikes.",
            mitigation: "Adopt Redis read-through caching with 60-second TTL and cache-aside invalidation on inventory updates.",
          },
          {
            id: "rsk-3",
            category: "Scalability",
            severity: "Medium",
            title: "Synchronous PDF Invoice Generation in Request Thread",
            description: "Generating complex multi-page PDF invoices synchronously in HTTP handlers blocks event loop and inflates latency.",
            mitigation: "Offload invoice generation to background BullMQ worker queues with Amazon S3 pre-signed download URLs.",
          },
          {
            id: "rsk-4",
            category: "Data Privacy",
            severity: "High",
            title: "Credit Card Storage in Operational Database",
            description: "Storing raw PANs violates PCI-DSS Level 1 compliance and creates catastrophic breach liability.",
            mitigation: "Utilize Stripe Elements / hosted tokens exclusively; never allow raw card details to touch internal servers.",
          },
          {
            id: "rsk-5",
            category: "Business Logic",
            severity: "Medium",
            title: "Negative Balance Race Condition on Multi-Cart Checkout",
            description: "Simultaneous checkout across multiple browser tabs can deplete balance into negative numbers.",
            mitigation: "Enforce strict transactional isolation level (SERIALIZABLE or SELECT FOR UPDATE) on balance deduction.",
          },
        ],
      },
    });
  });

  // Vite middleware in dev mode vs static in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RequirementDetective server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
