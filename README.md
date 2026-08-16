# Kavach Defense Solutions

**AI-powered proof system for turning suspicious signals into evidence-backed security decisions.**

Kavach ("Shield" in Sanskrit) is a defensive-by-design proof console that provides controlled command view and verification workflows for security analysis, threat reproduction, and remediation tracking.

## Overview

Kavach is a monorepo application that enables:
- **Signal Analysis** - Collect and correlate security events
- **Proof Generation** - Reproduce and verify suspicious signals with structured evidence
- **Verification Workflows** - Track remediation and proof-of-fix with audit trails
- **Decision Support** - Make security decisions backed by independent verification

## Architecture

```
Kavach-Defense-Solutions/
├── artifacts/              # Production artifacts
│   ├── api-server/        # Express.js backend API
│   ├── kavach-console/    # React + Vite frontend UI
│   └── mockup-sandbox/    # UI component sandbox
├── lib/                   # Shared libraries
│   ├── api-client-react/  # Auto-generated React Query hooks
│   ├── api-spec/          # OpenAPI specification
│   ├── api-zod/           # Zod schema validation
│   └── db/                # Drizzle ORM database layer
└── scripts/               # Utility scripts
```

### Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Vite 7.x for build & dev server
- Tailwind CSS with Lightning CSS
- React Query for state management
- Shadcn/ui component library

**Backend:**
- Express.js 5.x
- Node.js 24.x with TypeScript
- PostgreSQL with Drizzle ORM
- OpenAPI specification with Orval code generation

**Development:**
- pnpm workspace monorepo
- esbuild for bundling
- Vite HMR for fast development

## Quick Start

### Prerequisites

- **Node.js**: 24.x or higher
- **pnpm**: 10.10.0 or higher
- **PostgreSQL**: 14+ (for backend)
- **Windows/macOS/Linux** with bash or PowerShell

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amancodit47/KavachAI.git
   cd KavachAI
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup (Windows PowerShell):**
   ```powershell
   $env:PORT=5173
   $env:BASE_PATH="/"
   ```

   **Linux/macOS (bash):**
   ```bash
   export PORT=5173
   export BASE_PATH="/"
   ```

### Development

**Start Frontend (Kavach Console):**
```bash
pnpm --filter @workspace/kavach-console run dev
```
Frontend runs on `http://localhost:5173`

**Start Backend (API Server):**

First, set up PostgreSQL:
```bash
# Option 1: Docker
docker run -d --name kavach-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kavach \
  -p 5432:5432 \
  postgres:latest

# Option 2: Local PostgreSQL
createdb kavach
```

Then start the API:
```bash
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kavach"
pnpm --filter @workspace/api-server run dev
```
Backend API runs on `http://localhost:3000`

**View Component Sandbox:**
```bash
pnpm --filter @workspace/mockup-sandbox run dev
```
Sandbox runs on `http://localhost:5174`

## Project Structure

### Frontend (`artifacts/kavach-console/`)
- **pages/** - Main application pages (Overview, Scan Room, Projects, etc.)
- **components/** - React components (UI, Activity, Error Boundary)
- **hooks/** - Custom React hooks (useListActivity, useToast, etc.)
- **lib/** - Utilities and API client integration

### Backend (`artifacts/api-server/`)
- **routes/** - Express route handlers
  - `health.ts` - Health check endpoint
  - `kavach.ts` - Main API endpoints
- **lib/** - Core engine and logger
- **middlewares/** - Express middleware (auth, validation, error handling)

### Shared Libraries (`lib/`)
- **api-client-react/** - Auto-generated React Query hooks from OpenAPI
- **api-spec/** - OpenAPI 3.0 specification (`openapi.yaml`)
- **api-zod/** - Zod schemas for runtime validation
- **db/** - Drizzle ORM schema and migrations

## API Endpoints

### Activity Management
- `GET /api/activity` - List security events
- `POST /api/activity` - Create security event

### Scan Management
- `GET /api/scans` - List scan records
- `GET /api/scans/:id` - Get scan details
- `POST /api/scans` - Create new scan

### Projects
- `GET /api/projects` - List protected targets
- `POST /api/projects` - Register new project

### Health
- `GET /health` - API health check

## Development Workflow

### Generate API Code
API client code is auto-generated from OpenAPI spec using Orval:

```bash
pnpm --filter @workspace/api-spec run generate
```

### Database Schema
Manage database schema with Drizzle:

```bash
# Generate migrations
pnpm --filter @workspace/db run migrate:generate

# Apply migrations
pnpm --filter @workspace/db run migrate:deploy
```

### Building for Production

**Frontend:**
```bash
pnpm --filter @workspace/kavach-console run build
```

**Backend:**
```bash
pnpm --filter @workspace/api-server run build
```

## Features

### Proof System
- **Signal Collection** - Capture security events with structured logging
- **Evidence Trail** - Maintain audit trail of all observations
- **Proof of Fix** - Track remediation state with verification
- **Assurance Scoring** - Evidence-based risk scoring

### Security Workflows
- **Finding Ledger** - Severity-aware queue of security findings
- **Scan Management** - Execute, track, and compare scans
- **Risk Verification** - Independent verification of remediation
- **Performance Monitoring** - Track assurance metrics over time

### User Interface
- **Dark-mode First Design** - Optimized for security operations centers
- **Responsive Layout** - Works on desktop and tablet
- **Real-time Updates** - HMR for instant development feedback
- **Accessibility** - WCAG-compliant component library

## Debugging

### Frontend Errors
Check browser DevTools Console for React/Vite errors:
```
F12 → Console tab → Filter by errors
```

### Runtime Issues
Look for API response type mismatches. The frontend includes defensive checks:
```typescript
const eventsList = Array.isArray(events) ? events : [];
```

### Backend Logs
Backend logs go to stdout/stderr with timestamp and level:
```
[ERROR] Database connection failed
[INFO] Server started on port 3000
```

## Known Limitations

- **Database Required** - Backend requires active PostgreSQL connection
- **Simulation Mode** - Current implementation uses seeded/mock data
- **Local Development** - Not designed for production deployment yet
- **Windows Dependencies** - Requires explicit platform-specific native modules (@rollup/rollup-win32-x64-msvc, lightningcss-win32-x64-msvc)

## Troubleshooting

### Port Already in Use
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Linux/macOS
lsof -ti:5173 | xargs kill -9
```

### Missing Native Modules
If you see errors about `@rollup/rollup-*.node`:
```bash
pnpm add -D @rollup/rollup-win32-x64-msvc
pnpm add -D lightningcss-win32-x64-msvc -w
```

### Database Connection Failed
Verify PostgreSQL is running:
```bash
# Test connection
psql -U postgres -d kavach -h localhost
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contact & Support

- **GitHub Issues** - Report bugs and request features
- **Discussions** - Ask questions and discuss development
- **Email** - Contact maintainers for security concerns

---

**Built with ❤️ for security-first development**

*Kavach means "Shield" - defensive by design.*
