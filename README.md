# Portalis - Your Gateway to the World

A production-ready monorepo for managing residency and immigration programs worldwide.

## Architecture

This monorepo contains:

- **apps/web**: Next.js 14 frontend with i18n, TanStack Query, and shadcn/ui
- **apps/admin**: Next.js 14 admin panel with CRUD operations
- **apps/symfony-api**: Symfony 7 API with API Platform, Doctrine, and JWT auth
- **packages/ui**: Shared shadcn-based UI components
- **packages/shared**: Shared Zod schemas and TypeScript types
- **packages/config**: Shared ESLint, Prettier, Tailwind, and tsconfig

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Make (optional, for convenience commands)

### Setup

#### Option 1: Automated Setup (Windows)

**PowerShell:**
```powershell
.\scripts\setup.ps1
```

**Command Prompt:**
```cmd
scripts\setup.bat
```

#### Option 2: Manual Setup (All Platforms)

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd portalis
   pnpm install
   ```

2. **Start services:**
   ```bash
   # Windows/Cross-platform
   pnpm run docker:up
   
   # Linux/macOS (if make is available)
   make up
   ```

3. **Setup database:**
   ```bash
   # Windows/Cross-platform
   pnpm run db:create
   pnpm run db:migrate
   pnpm run db:seed
   
   # Linux/macOS (if make is available)
   make db-create db-migrate db-seed
   ```

4. **Generate API types:**
   ```bash
   # Windows/Cross-platform
   pnpm run api:docs
   
   # Linux/macOS (if make is available)
   make api-docs
   ```

5. **Access the applications:**
   - Web app: http://localhost:3000
   - Admin panel: http://localhost:3001 (login: admin@portalis.com / admin)
   - API docs: http://localhost:8080/docs
   - API OpenAPI spec: http://localhost:8080/docs.json

## Development

### Available Commands

#### Development Commands
```bash
# Start all development servers
pnpm dev

# Build all packages and apps
pnpm build

# Lint all code
pnpm lint

# Type check all TypeScript
pnpm typecheck

# Clean build artifacts
pnpm clean
```

#### Docker Commands (Cross-platform)
```bash
pnpm run docker:up      # Start docker services
pnpm run docker:down    # Stop docker services
pnpm run docker:build   # Build docker images
pnpm run docker:logs    # View service logs
```

#### Database Commands (Cross-platform)
```bash
pnpm run db:create      # Create database
pnpm run db:migrate     # Run migrations
pnpm run db:seed        # Seed demo data
pnpm run api:docs       # Generate OpenAPI types
```

#### Make Commands (Linux/macOS only)
```bash
make help          # Show all available commands
make up            # Start docker services
make down          # Stop docker services
make setup         # Complete development setup
make db-migrate    # Run database migrations
make db-seed       # Seed demo data
make api-docs      # Generate OpenAPI types
```

## Services

When running `make up`, the following services are available:

- **Web (port 3000)**: Main frontend application
- **Admin (port 3001)**: Administration panel
- **API (port 8080)**: Symfony API with Caddy server
- **PostgreSQL (port 5432)**: Main database
- **Meilisearch (port 7700)**: Search engine (for future use)
- **Redis (port 6379)**: Cache and sessions (for future use)
- **MinIO (ports 9000/9001)**: S3-compatible storage (for future use)

## API Entities

The API provides the following main entities:

- **Country**: Countries with residency information
- **ResidencyProgram**: Available immigration programs
- **Provider**: Immigration service providers
- **ChecklistItem**: Country-specific checklists
- **User**: Admin users with JWT authentication

## Demo Data

The seed command creates:

- 3 sample countries (Georgia, Paraguay, Hungary)
- 4 residency programs (including digital nomad visas)
- 3 service providers
- Sample checklist items
- Admin user (admin@portalis.com / admin)

## Tech Stack

### Frontend (Web & Admin)
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Hook Form + Zod
- next-intl (i18n)

### Backend (API)
- Symfony 7
- API Platform 3
- Doctrine ORM
- PostgreSQL
- JWT Authentication (lexik/jwt-authentication-bundle)
- CORS support (nelmio/cors-bundle)

### DevOps
- Docker & Docker Compose
- Caddy web server
- pnpm workspaces
- Shared ESLint/Prettier configs

## Project Structure

```
portalis/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── admin/               # Next.js admin panel
│   └── symfony-api/         # Symfony API
├── packages/
│   ├── config/              # Shared configs
│   ├── shared/              # Shared schemas & types
│   └── ui/                  # Shared UI components
├── docker-compose.yml       # Development services
├── Makefile                 # Convenience commands
└── pnpm-workspace.yaml      # Monorepo configuration
```

## Contributing

1. Follow the existing code style (ESLint + Prettier configured)
2. Add types for new API endpoints in `packages/shared`
3. Update the OpenAPI types after API changes
4. Test changes in both web and admin applications

## License

Proprietary - All rights reserved.
