# Xandhopp - Your perfect move worldwide

A production-ready monorepo for managing residency and immigration programs worldwide with full user authentication and profile management.

## Architecture

This monorepo contains:

- **apps/web**: Next.js 14 frontend with i18n, user authentication, and profile management
- **apps/admin**: Next.js 14 admin panel with CRUD operations
- **apps/symfony-api**: Symfony 7 API with user authentication, email verification, and profile management
- **apps/ingestion-worker**: Background worker for data collection and processing
- **packages/ui**: Shared shadcn-based UI components
- **packages/shared**: Shared Zod schemas and TypeScript types
- **packages/connectors**: External API connectors for data collection
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
   - Admin panel: http://localhost:3003 (login: admin@portalis.com / admin)
   - API: http://localhost:8082
   - API docs: http://localhost:8082/docs
   - MailHog (email testing): http://localhost:8025

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

When running `docker compose up`, the following services are available:

- **Web (port 3000)**: Main frontend application with user authentication
- **Admin (port 3003)**: Administration panel
- **API (port 8082)**: Symfony API with user authentication and email verification
- **PostgreSQL (port 5433)**: Main database with user management
- **ClickHouse (port 8124)**: Analytics database for data processing
- **Meilisearch (port 7701)**: Search engine
- **Redis (port 6380)**: Cache and rate limiting
- **MinIO (ports 9004/9005)**: S3-compatible storage
- **MailHog (port 8025)**: Email testing interface

## Features

### User Authentication & Management
- **User Registration**: Complete registration with email verification
- **User Login**: JWT-based authentication
- **Profile Management**: Full user profile editing and saving
- **Email Verification**: Automated email verification system
- **Password Security**: Secure password hashing and validation

### Data Management
- **Country Data**: Countries with residency information
- **Residency Programs**: Available immigration programs
- **Service Providers**: Immigration service providers
- **Checklist Items**: Country-specific checklists
- **User Profiles**: Complete user profile management

### Technical Features
- **Real-time Data**: Live data from external APIs
- **Email System**: MailHog integration for development
- **Rate Limiting**: Redis-based rate limiting
- **Data Analytics**: ClickHouse integration for analytics
- **Search**: Meilisearch integration for fast search

## Demo Data

The seed command creates:

- 3 sample countries (Georgia, Paraguay, Hungary)
- 4 residency programs (including digital nomad visas)
- 3 service providers
- Sample checklist items
- Admin user (admin@portalis.com / admin)

## User Authentication Flow

1. **Registration**: Users can register with email, password, first name, and last name
2. **Email Verification**: Users receive a verification email via MailHog
3. **Login**: Users can log in with their verified credentials
4. **Profile Management**: Users can edit and save their complete profile
5. **Data Persistence**: All user data is stored in PostgreSQL database

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
- Email Verification System
- User Profile Management
- Rate Limiting with Redis
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
│   ├── web/                 # Next.js frontend with authentication
│   ├── admin/               # Next.js admin panel
│   ├── symfony-api/         # Symfony API with user management
│   └── ingestion-worker/    # Background data processing
├── packages/
│   ├── config/              # Shared configs
│   ├── shared/              # Shared schemas & types
│   ├── ui/                  # Shared UI components
│   └── connectors/          # External API connectors
├── docker-compose.yml       # Development services
├── Makefile                 # Convenience commands
└── pnpm-workspace.yaml      # Monorepo configuration
```

## Production Deployment - Server Requirements

### Managed Server Requirements

For hosting the Xandhopp application on a managed server, the following features and software must be available:

#### **Core Runtime Environment**
- **Node.js**: Version 18.20.8 or higher (LTS recommended)
- **pnpm**: Version 8+ (package manager)
- **Git**: For deployment and version control

#### **Web Server & Reverse Proxy**
- **Nginx** or **Apache**: For serving static files and reverse proxy
- **SSL/TLS Support**: Let's Encrypt or commercial certificates
- **HTTP/2 Support**: For better performance
- **Gzip Compression**: For static asset optimization

#### **Database Requirements**
- **PostgreSQL**: Version 14+ (main database)
- **Database Management**: pgAdmin or similar tool access
- **Backup System**: Automated daily backups
- **Connection Pooling**: For optimal database performance

#### **File System & Storage**
- **SSD Storage**: Minimum 20GB for application files
- **File Permissions**: Proper user/group permissions for web server
- **Log Rotation**: Automated log management
- **Static File Serving**: Optimized delivery of images, CSS, JS

#### **Security Features**
- **Firewall**: Port restrictions (80, 443, 22, 5432)
- **DDoS Protection**: Basic protection against attacks
- **SSL/TLS**: HTTPS enforcement
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Regular Updates**: OS and software security patches

#### **Performance & Monitoring**
- **CDN Integration**: For global asset delivery
- **Caching**: Redis or Memcached for session storage
- **Monitoring**: Server resource monitoring (CPU, RAM, Disk)
- **Uptime Monitoring**: Service availability tracking
- **Error Logging**: Centralized error collection

#### **Development & Deployment**
- **SSH Access**: Secure shell for server management
- **CI/CD Pipeline**: Automated deployment (GitHub Actions, GitLab CI)
- **Environment Variables**: Secure configuration management
- **Process Manager**: PM2 or similar for Node.js process management

#### **Domain & DNS**
- **Domain Management**: DNS configuration access
- **Subdomain Support**: For staging/testing environments
- **Email Configuration**: For contact forms and notifications

### **Minimum Server Specifications**

#### **Shared Hosting (Not Recommended)**
- **RAM**: 2GB minimum
- **CPU**: 2 cores
- **Storage**: 20GB SSD
- **Bandwidth**: 100GB/month

#### **VPS/Cloud Server (Recommended)**
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2-4 cores
- **Storage**: 50GB SSD
- **Bandwidth**: 1TB/month
- **OS**: Ubuntu 22.04 LTS or CentOS 8+

#### **Dedicated Server (Enterprise)**
- **RAM**: 16GB+
- **CPU**: 8+ cores
- **Storage**: 200GB+ SSD
- **Bandwidth**: Unlimited
- **Redundancy**: RAID configuration

### **Deployment Checklist**

#### **Pre-Deployment**
- [ ] Server meets minimum requirements
- [ ] Domain configured and pointing to server
- [ ] SSL certificate obtained and configured
- [ ] Database server provisioned
- [ ] Environment variables prepared

#### **Application Setup**
- [ ] Node.js and pnpm installed
- [ ] Application code deployed
- [ ] Dependencies installed (`pnpm install`)
- [ ] Database migrations run
- [ ] Static assets built (`pnpm build`)
- [ ] Process manager configured (PM2)

#### **Web Server Configuration**
- [ ] Nginx/Apache configured for reverse proxy
- [ ] Static file serving optimized
- [ ] SSL/TLS properly configured
- [ ] Security headers implemented
- [ ] Gzip compression enabled

#### **Post-Deployment**
- [ ] Application accessible via HTTPS
- [ ] Database connections working
- [ ] Email functionality tested
- [ ] Monitoring and logging active
- [ ] Backup system verified
- [ ] Performance testing completed

### **Recommended Hosting Providers**

#### **Budget-Friendly Options**
- **DigitalOcean**: VPS starting at $6/month
- **Linode**: Reliable VPS with good support
- **Vultr**: High-performance VPS options

#### **Enterprise Solutions**
- **AWS**: EC2 with RDS and CloudFront
- **Google Cloud**: Compute Engine with Cloud SQL
- **Azure**: Virtual Machines with managed databases

#### **Managed WordPress/Node.js Hosts**
- **Heroku**: Easy deployment but limited customization
- **Railway**: Modern platform with good Node.js support
- **Render**: Simple deployment with automatic SSL

### **Environment Variables for Production**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portalis_prod

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.portalis.com
NEXT_PUBLIC_APP_URL=https://portalis.com

# Security
JWT_SECRET=your-super-secure-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret

# Email (for user verification and notifications)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@portalis.com
SMTP_PASS=your-email-password
MAILER_DSN=smtp://user:password@smtp.your-provider.com:587
```

## Contributing

1. Follow the existing code style (ESLint + Prettier configured)
2. Add types for new API endpoints in `packages/shared`
3. Update the OpenAPI types after API changes
4. Test changes in both web and admin applications

## License

Proprietary - All rights reserved.
