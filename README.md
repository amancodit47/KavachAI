
# 🛡️ KAVACH Defense Solutions

### **Autonomous Cyber-Reasoning & Evidence-Driven Self-Remediation**

> **Discover. Reason. Patch. Attack Again. Prove.**

**Kavach** — meaning *Shield* in Sanskrit — is a defensive-by-design cyber-reasoning platform built to transform suspicious security signals into **verified, evidence-backed security decisions**.

Kavach combines security analysis, contextual reasoning, controlled remediation, regression testing, and proof-of-fix workflows into a unified platform designed for **security-sensitive, isolated, and resource-constrained environments**.

---

## 🚀 Live Demo

### **Kavach Defense Console**

🔗 **Live Application:**
[https://kavach-defense-solutions--amancodit48.replit.app/](https://kavach-defense-solutions--amancodit48.replit.app/)

### **Source Code**

🔗 **GitHub Repository:**
[https://github.com/amancodit47/KavachAI](https://github.com/amancodit47/KavachAI)

---

# 🎯 Problem

Modern vulnerability remediation is fragmented.

A typical workflow requires security teams to move between multiple tools:

```text
Detect
   ↓
Analyze
   ↓
Understand Root Cause
   ↓
Develop Patch
   ↓
Test Patch
   ↓
Re-scan
   ↓
Verify
```

This introduces several challenges:

* Security tools frequently stop at **vulnerability detection**
* Root-cause analysis can require significant manual investigation
* AI-generated patches may be incomplete or introduce regressions
* A patch is not necessarily evidence that the vulnerability has been eliminated
* Security-sensitive environments may require **local, isolated and resource-efficient processing**
* Evidence and remediation history can become fragmented across different tools

### The core question

> **How do we move from “a vulnerability was detected” to “the vulnerability was fixed and we can prove it”?**

---

# 🛡️ Our Solution

## **KAVACH — An Autonomous Cyber-Reasoning Loop**

Kavach is designed around a closed-loop security workflow:

```text
┌───────────────┐
│ VULNERABILITY │
│   / SIGNAL    │
└───────┬───────┘
        ↓
┌──────────────────┐
│     DISCOVER     │
│ Static / Dynamic │
│    / Fuzzing     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│    CORRELATE     │
│ Code + Trace +   │
│ Crash + Context  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│      REASON      │
│ Root Cause +     │
│ Attack Path      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│      PATCH       │
│ Minimal Safe     │
│ Remediation      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   ATTACK AGAIN   │
│ Re-test / Fuzz / │
│ Regression       │
└────────┬─────────┘
         ↓
┌──────────────────┐
│      PROVE       │
│ Evidence-backed  │
│ Verified Fix     │
└────────┬─────────┘
         │
       FAIL
         ↓
    RE-REASON
         │
         └──────────────► PATCH AGAIN
```

### Core principle

> **Kavach does not blindly trust an AI-generated patch.
> Kavach attempts to break the patch and accepts it only when independent evidence supports the fix.**

---

# ✨ Key Capabilities

## 🔍 1. Multi-Signal Security Analysis

Kavach is designed to combine multiple sources of security evidence:

* Static analysis findings
* Dynamic execution behavior
* Runtime traces
* Crash information
* Fuzzing inputs and coverage
* Regression-test results
* Source-code context
* Historical vulnerability patterns

Instead of reasoning from source code alone, the system builds a richer **vulnerability context**.

---

## 🧠 2. AI-Assisted Cyber Reasoning

The reasoning layer is designed to help:

* Understand vulnerable code paths
* Identify root causes
* Determine potential attack paths
* Correlate findings from different analysis engines
* Generate remediation candidates
* Explain why a patch addresses the identified issue

The AI layer acts as a **reasoning component**, not the final authority.

---

## 🔧 3. Controlled Patch Generation

Kavach follows a **minimal-patch principle**:

```text
Root Cause
    ↓
Smallest Safe Change
    ↓
Controlled Execution
    ↓
Independent Validation
```

The objective is to preserve existing functionality while addressing the identified vulnerability with the smallest reasonable change.

---

## 🧪 4. Attack the Fix

A major design principle of Kavach is:

> **Don't just test the patch. Try to break it.**

After remediation, the system can re-run relevant validation workflows:

* Original vulnerability trigger
* Regression tests
* Fuzzing / re-fuzzing
* Runtime checks
* Static analysis re-checks

A patch is considered successful only when the evidence supports remediation.

---

# 🛡️ Proof-of-Fix

Kavach separates **patch generation** from **patch verification**.

### A simplified acceptance model:

```text
Original Trigger Eliminated
          +
Regression Tests Pass
          +
Re-Fuzzing Shows No Recurrence
          +
Static / Dynamic Re-check
          ↓
     VERIFIED FIX
```

If validation fails:

```text
PATCH FAILED
     ↓
Collect Evidence
     ↓
Update Context
     ↓
Re-Reason
     ↓
Generate Improved Patch
     ↓
Re-Test
```

This creates a closed feedback loop instead of a one-shot AI remediation process.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     TARGET CODE     │
                         │  Source / Binaries  │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │       DISCOVERY ENGINES        │
                    │                                │
                    │ Static │ Dynamic │ Fuzzing     │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ FINDING CORRELATOR & CONTEXT  │
                    │          BUILDER               │
                    │                               │
                    │ Code + Traces + Crashes +     │
                    │ Fuzz Inputs + Risk Context    │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       CYBER REASONER          │
                    │                               │
                    │ Root Cause Analysis           │
                    │ Attack Path Understanding     │
                    │ Patch Generation              │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │        PATCH ENGINE            │
                    │                               │
                    │ Minimal Remediation            │
                    │ Patch Rationale                │
                    │ Versioned Artifacts            │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       ISOLATED SANDBOX        │
                    │                               │
                    │ Controlled / Reproducible     │
                    │ Execution Environment         │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      VALIDATION ENGINE        │
                    │                               │
                    │ Regression │ Re-Fuzzing       │
                    │ Re-trigger │ Re-analysis      │
                    └───────────────┬───────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                       PASS                 FAIL
                          │                   │
                          ▼                   │
                 ┌────────────────┐           │
                 │  VERIFIED FIX  │           │
                 │                │           │
                 │ Evidence +     │           │
                 │ Audit Record   │           │
                 └────────────────┘           │
                                              │
                                              └──────► REASONER
```

---

# ⚙️ Technology Stack

## Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **TanStack React Query**
* **shadcn/ui**
* **Lucide React**
* **Framer Motion**

## Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **PostgreSQL**
* **Drizzle ORM**
* **Zod**

## API & Contracts

* **OpenAPI**
* **Orval**
* Generated React Query API hooks
* Runtime schema validation

## Development & Build

* **pnpm Workspaces**
* **TypeScript**
* **esbuild**
* **Vite**
* **Prettier**

## Security-Oriented Components

Kavach's architecture is designed to integrate security analysis components such as:

* Static analysis engines
* Dynamic analysis tools
* Fuzzing engines
* Sandboxed execution
* Regression harnesses
* Local/open-source LLM inference
* Security knowledge bases
* Evidence collection and audit trails

The architecture is intentionally modular so analysis engines can be replaced or extended without redesigning the entire platform.

---

# 🧩 Repository Structure

```text
KavachAI/
│
├── artifacts/
│   │
│   ├── api-server/
│   │   └── Express.js backend API
│   │
│   ├── kavach-console/
│   │   └── React + Vite security console
│   │
│   └── mockup-sandbox/
│       └── UI component sandbox
│
├── lib/
│   │
│   ├── api-client-react/
│   │   ├── Generated React Query hooks
│   │   └── API client integration
│   │
│   ├── api-spec/
│   │   └── OpenAPI specification
│   │
│   ├── api-zod/
│   │   └── Zod validation schemas
│   │
│   └── db/
│       └── Drizzle ORM database layer
│
├── scripts/
│   └── Development and utility scripts
│
├── attached_assets/
│   └── Project assets
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.base.json
├── .replit
├── replit.md
└── README.md
```

---

# 🖥️ Kavach Security Console

The frontend provides a command-oriented interface for monitoring and managing security workflows.

### Core interface areas include:

* Security overview
* Finding ledger
* Scan management
* Protected projects
* Security activity
* Verification workflows
* Evidence tracking
* Assurance metrics

The interface is designed around a **security operations / command-console experience**, rather than a generic AI chatbot.

---

# 📡 API Layer

The backend provides the application API and security workflow endpoints.

## Activity

```http
GET /api/activity
```

Retrieve security activity and events.

```http
POST /api/activity
```

Create a security event.

---

## Scans

```http
GET /api/scans
```

Retrieve scan records.

```http
GET /api/scans/:id
```

Retrieve details for an individual scan.

```http
POST /api/scans
```

Create a new scan.

---

## Projects

```http
GET /api/projects
```

Retrieve registered protected targets.

```http
POST /api/projects
```

Register a protected target.

---

## Health

```http
GET /health
```

Check API availability.

---

# 🔐 Security-by-Design Principles

Kavach is built around several security principles.

### 1. Evidence over Assumptions

Security decisions should be backed by observable evidence.

### 2. Independent Verification

The component generating a remediation should not be the sole authority deciding that the remediation worked.

### 3. Isolation

Potentially unsafe code execution should occur inside controlled environments.

### 4. Minimal Remediation

Prefer targeted changes over unnecessary code modifications.

### 5. Auditability

Important actions and validation results should produce traceable records.

### 6. Local-First Capability

The architecture is designed to support environments where cloud-only security processing may not be appropriate.

### 7. Modular Architecture

Security engines should be replaceable and extensible.

---

# 🏅 What Makes Kavach Different?

| Traditional Workflow         | Kavach                           |
| ---------------------------- | -------------------------------- |
| Detect vulnerability         | Detect + reason + remediate      |
| Human-driven handoffs        | Automated orchestration          |
| Patch proposed manually      | AI-assisted patch generation     |
| Patch may be trusted         | Patch independently challenged   |
| Separate security tools      | Unified workflow                 |
| Validation after remediation | Continuous feedback loop         |
| Finding-centric              | Evidence-centric                 |
| Cloud-dependent approaches   | Local-first capable architecture |
| “Likely fixed”               | **“Verified with evidence”**     |

---

# 💡 Core USP

## **KAVACH DOESN'T TRUST THE PATCH.**

### **KAVACH TRIES TO BREAK IT.**

```text
        DETECT
           ↓
        REASON
           ↓
         PATCH
           ↓
      ATTACK AGAIN
           ↓
         PROVE
           │
     ┌─────┴─────┐
     │           │
    PASS        FAIL
     │           │
     ▼           ▼
 VERIFIED     REASON
   FIX        AGAIN
```

This closed-loop architecture is the foundation of Kavach's autonomous security reasoning approach.

---

# 📊 Evaluation Metrics

Kavach is designed to be evaluated using measurable security and engineering objectives.

| Metric                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| **Detection Precision** | Correct findings identified                   |
| **Patch Success Rate**  | Valid remediation / patch attempts            |
| **Proof-of-Fix Rate**   | Remediations surviving independent validation |
| **Time-to-Remediation** | Time from finding to verified fix             |
| **Resource Footprint**  | CPU, RAM and inference requirements           |
| **Regression Safety**   | Existing functionality preserved              |
| **Validation Coverage** | Breadth of post-patch testing                 |
| **Scalability**         | Number of targets and test cases handled      |

### Primary objective

> **Minimize the time and resources required to move from a suspicious signal to a verified security decision.**

---

# 🚀 Quick Start

## Prerequisites

* **Node.js:** 24.x or later
* **pnpm:** 10.10.0 or later
* **PostgreSQL:** Required for the database-backed backend
* Windows, macOS or Linux

The repository uses pnpm workspaces and enforces pnpm as the package manager. 

---

## 1. Clone the Repository

```bash
git clone https://github.com/amancodit47/KavachAI.git
cd KavachAI
```

---

## 2. Install Dependencies

```bash
pnpm install
```

The workspace includes a package-release-age policy intended to reduce exposure to newly published malicious or compromised npm packages. 

---

# 🗄️ Database Setup

Kavach uses PostgreSQL with Drizzle ORM.

### Using Docker

```bash
docker run -d \
  --name kavach-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kavach \
  -p 5432:5432 \
  postgres:latest
```

Set the database connection:

### Windows PowerShell

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kavach"
```

### Linux/macOS

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kavach"
```

---

# ▶️ Run the Application

## Start the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

The API server is configured for port **5000** in the project runtime configuration. 

---

## Start the Frontend

```bash
pnpm --filter @workspace/kavach-console run dev
```

Vite will provide the local development URL in the terminal.

---

## Run Type Checking

```bash
pnpm run typecheck
```

---

## Build the Complete Workspace

```bash
pnpm run build
```

The root build performs type checking and then builds available workspace packages. 

---

# 🔄 API Code Generation

Kavach uses OpenAPI as the API contract and generates client-side schemas/hooks.

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates API-related code from the OpenAPI specification. 

---

# 🗃️ Database Development

For development database schema changes:

```bash
pnpm --filter @workspace/db run push
```

Use database migrations appropriately before production deployment.

---

# 🧪 Development Workflow

A typical development cycle is:

```text
1. Modify feature
       ↓
2. Update API contract
       ↓
3. Regenerate API code
       ↓
4. Update backend
       ↓
5. Update frontend
       ↓
6. Run typecheck
       ↓
7. Run build
       ↓
8. Test workflow
       ↓
9. Review security implications
       ↓
10. Commit
```

Recommended validation:

```bash
pnpm run typecheck
pnpm run build
```

---

# 🔬 Security Workflow Example

A conceptual Kavach remediation workflow:

```text
TARGET
  │
  ▼
Security Finding
  │
  ▼
Static / Dynamic / Fuzz Analysis
  │
  ▼
Finding Correlation
  │
  ▼
Root Cause Analysis
  │
  ▼
Patch Candidate
  │
  ▼
Sandbox Execution
  │
  ├───────────────┐
  │               │
  ▼               ▼
Regression      Re-Fuzz
Testing         Testing
  │               │
  └───────┬───────┘
          ▼
    Evidence Engine
          │
     ┌────┴────┐
     │         │
    PASS      FAIL
     │         │
     ▼         ▼
 VERIFIED    REASON
    FIX       AGAIN
```

---

# 📦 Current Prototype vs. Extended Security Engine

Kavach is being developed as a modular platform.

The current repository provides the **security command console, API layer, data model, workflows and proof-oriented application foundation**.

The deeper autonomous security-analysis components can be integrated as modular engines around this core:

```text
Kavach Console
      │
      ▼
Orchestration Layer
      │
 ┌────┼─────────────┐
 │    │             │
 ▼    ▼             ▼
SAST DAST         Fuzzing
 │    │             │
 └────┼─────────────┘
      ▼
Finding Correlator
      ▼
Cyber Reasoner
      ▼
Patch Engine
      ▼
Sandbox
      ▼
Validation Harness
      ▼
Evidence / Proof
```

This separation allows the platform to evolve without coupling the command interface to any single security-analysis engine.

---

# ⚠️ Responsible Use

Kavach is intended for **authorized defensive security research, controlled testing, vulnerability analysis, and remediation validation**.

Only run analysis, fuzzing, exploitation tests, or automated remediation against:

* Systems you own
* Systems for which you have explicit authorization
* Controlled laboratory environments
* Approved challenge infrastructure
* Authorized organizational infrastructure

Do not use Kavach to access, disrupt, or modify systems without authorization.

---

# 🧭 Roadmap

## Phase 1 — Security Console

* [x] Security command interface
* [x] Finding management
* [x] Scan workflows
* [x] Project/target management
* [x] Activity tracking
* [x] Evidence-oriented workflow foundation

## Phase 2 — Autonomous Analysis

* [ ] Static-analysis integration
* [ ] Dynamic-analysis integration
* [ ] Fuzzing engine integration
* [ ] Finding correlation
* [ ] Automated attack-path reconstruction

## Phase 3 — AI Cyber Reasoning

* [ ] Local LLM integration
* [ ] Security-focused RAG
* [ ] Root-cause analysis
* [ ] Vulnerability-context generation
* [ ] Patch candidate generation

## Phase 4 — Proof-of-Fix

* [ ] Automated patch sandbox
* [ ] Regression harness
* [ ] Re-fuzzing
* [ ] Trigger replay
* [ ] Before/after evidence comparison
* [ ] Automated proof-of-fix verdict

## Phase 5 — Operational Scale

* [ ] Multi-target orchestration
* [ ] Resource-aware scheduling
* [ ] Offline deployment
* [ ] Hardware-constrained inference
* [ ] Distributed analysis workers
* [ ] Defence-environment adaptation

---

# 🏆 Designed for the AI Kavach Challenge

Kavach directly targets the challenge of building a **cyber-reasoning system capable of discovering vulnerabilities, reasoning about their causes, proposing remediation, and validating that the fix holds**.

### Challenge Alignment

| AI Kavach Requirement    | Kavach Approach                         |
| ------------------------ | --------------------------------------- |
| Vulnerability discovery  | Static + dynamic + fuzzing architecture |
| Cyber reasoning          | AI-assisted contextual reasoning        |
| Automated remediation    | Patch generation workflow               |
| Verification             | Regression + re-test + evidence         |
| Autonomous loop          | Detect → Reason → Patch → Validate      |
| Lightweight architecture | Modular, local-first design             |
| Security isolation       | Controlled sandbox execution            |
| Proof of fix             | Evidence-backed acceptance              |
| Scalability              | Modular orchestration architecture      |

---

# 🎖️ Defence-Oriented Design Philosophy

Kavach is designed with the following operational principles in mind:

### **Mission First**

Focus on actionable security findings rather than information overload.

### **Evidence First**

Security decisions should be supported by reproducible evidence.

### **Fail Closed**

Unverified remediation should not automatically be considered successful.

### **Isolate Execution**

Potentially unsafe workloads should run in controlled environments.

### **Minimize Footprint**

Prefer lightweight, modular components over unnecessary infrastructure.

### **Audit Everything**

Security actions and verification outcomes should remain traceable.

### **Human-Controlled Deployment**

Automation should assist authorized security teams while maintaining controlled operational boundaries.

---

# 🔐 Supply-Chain Security

The workspace includes a **minimum package release age of 1440 minutes (24 hours)** before newly published npm package versions can be installed by default.

This is intended as a defense against rapidly published malicious or compromised packages entering the dependency chain. Trusted package namespaces can be explicitly excluded when required. 

---

# 🛠️ Troubleshooting

## Port Already in Use

### Windows PowerShell

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### Linux/macOS

```bash
lsof -ti:5173 | xargs kill -9
```

---

## Database Connection Failure

Verify PostgreSQL is running:

```bash
psql -U postgres -d kavach -h localhost
```

Then verify:

```text
DATABASE_URL
```

is configured correctly.

---

## Missing Native Modules

If Rollup or Lightning CSS reports a platform-specific native module error, install the appropriate platform dependency or reinstall the workspace using pnpm.

For Windows environments, the repository already includes the required Windows-specific development dependencies.

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/amancodit47/KavachAI.git
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

Follow the existing TypeScript and workspace conventions.

### 4. Validate

```bash
pnpm run typecheck
pnpm run build
```

### 5. Commit

```bash
git add .
git commit -m "Add: your feature"
```

### 6. Push

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

Please include:

* What changed
* Why it changed
* How it was tested
* Any security implications
* Any configuration changes

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

# 🔗 Project Links

| Resource         | Link                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 🌐 **Live Demo** | [https://kavach-defense-solutions--amancodit48.replit.app/](https://kavach-defense-solutions--amancodit48.replit.app/) |
| 💻 **GitHub**    | [https://github.com/amancodit47/KavachAI](https://github.com/amancodit47/KavachAI)                                     |
| 📋 **Issues**    | [https://github.com/amancodit47/KavachAI/issues](https://github.com/amancodit47/KavachAI/issues)                       |

---

# 👥 Team

**Kavach Defense Solutions**

Built for defensive cybersecurity research and autonomous vulnerability remediation.

---

<div align="center">

## 🛡️ KAVACH

### **Discover. Reason. Patch. Attack Again. Prove.**

**From suspicious signal → to evidence-backed security decision.**

*Kavach means “Shield” — defensive by design.*

</div>
