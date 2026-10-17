# 🚀 Project Setup Guide

Welcome to the FYGS.dev development environment! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.17.0 (LTS recommended)
- **pnpm**: >= 9.0.0 (package manager)
- **Git**: >= 2.37.0
- **PostgreSQL**: >= 14.0 (local or hosted)
- **Redis**: >= 6.0 (local or hosted)

### Quick Installation Commands

```bash
# Install Node.js (using nvm)
nvm install --lts
nvm use --lts

# Install pnpm globally
npm install -g pnpm@latest

# Verify installations
node --version  # Should be >= 18.17.0
pnpm --version  # Should be >= 9.0.0
git --version   # Should be >= 2.37.0
```

## 🛠️ Development Setup

### 1. Clone the Repository

```bash
# Clone your fork (replace with your username)
git clone https://github.com/FYGS/fygs.dev.git
cd fygs.dev

# Add upstream remote for syncing
git remote add upstream https://github.com/FYGS/fygs.dev.git
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit the environment file with your values
# Use your preferred editor (nano, vim, code, etc.)
code .env.local
```

#### Required Environment Variables

Fill in these essential variables in `.env.local`:

```bash
# Database (required)
DATABASE_URL="postgresql://username:password@localhost:5432/fygs_dev"

# Redis (required for caching)
REDIS_URL="redis://localhost:6379"

# Auth (required for authentication)
BETTER_AUTH_SECRET="your-32-character-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Stripe (required for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Database Setup

```bash
# Generate the Prisma client (also runs after pnpm install; written to lib/generated/prisma)
pnpm prisma generate

# Create the tables
pnpm db:push

# Seed the database with initial data
pnpm db:seed

# Open Prisma Studio (optional)
pnpm db:studio
```

### 5. Redis Setup

#### Option A: Local Redis (Recommended for Development)

```bash
# Install Redis locally
# On macOS
brew install redis
brew services start redis

# On Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# On Windows (using WSL or Docker)
docker run -d -p 6379:6379 redis:7-alpine
```

#### Option B: Hosted Redis

Use a hosted Redis service like:
- **Railway**: redis://default:password@host:port
- **Upstash**: redis://user:password@host:port
- **Redis Cloud**: redis://user:password@host:port

### 6. OAuth Provider Setup (Optional)

For social authentication, configure OAuth providers:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### 7. Stripe Setup (Required for Payments)

1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the dashboard
3. Set up webhooks:
   - Endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`

## 🚀 Running the Application

### Development Mode

```bash
# Start the development server
pnpm dev

# Application will be available at:
# http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Integration tests: need nothing installed, a disposable PostgreSQL is started
pnpm test:integration

# Run linting
pnpm lint
```

Prisma 7 reads `DATABASE_URL` from `.env` through `prisma.config.ts`, and the app
connects through the `pg` driver adapter (`lib/db.ts`). The integration suite never
uses `DATABASE_URL`: see [tests/README.md](tests/README.md) for the test database.

## 📁 Project Structure

```
fygs.dev/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes and webhooks
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard-specific components
├── lib/                   # Utility functions and configurations
│   ├── auth/             # Authentication configuration
│   ├── db/               # Database utilities
│   ├── redis.ts          # Redis client (native ioredis)
│   └── utils.ts          # General utilities
├── hooks/                 # Custom React hooks
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Database seeding script
├── public/               # Static assets
├── .github/              # GitHub workflows and templates
│   ├── workflows/        # CI/CD pipelines
│   └── ISSUE_TEMPLATE/   # Issue templates
└── docs/                 # Project documentation
```

## 🔧 Development Tools

### Available Scripts

```bash
# Development
pnpm dev                   # Start development server
pnpm build                 # Build for production
pnpm start                 # Start production server

# Database
pnpm db:push              # Push schema changes
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed database
pnpm db:reset             # Reset and reseed database

# Testing & Quality
pnpm test                 # Run tests
pnpm test:watch           # Run tests in watch mode
pnpm test:integration     # Integration tests on a disposable embedded PostgreSQL
pnpm test:db              # Keep that PostgreSQL running (port 54329)
pnpm lint                 # Run ESLint

# Utilities
pnpm generate:preview     # Generate preview images
```

### Recommended VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

#### "Cannot connect to database"
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

#### "Redis connection failed"
- Verify Redis is running on port 6379
- Check REDIS_URL format
- Test connection: `redis-cli ping`

#### "Module not found" errors
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Next.js cache: `rm -rf .next`

#### Authentication not working
- Verify BETTER_AUTH_SECRET is set
- Check OAuth provider configurations
- Ensure redirect URLs match

### Getting Help

1. **Check the documentation**: Start with this README and docs/
2. **Search existing issues**: Look for similar problems
3. **Create an issue**: Use our issue templates
4. **Join discussions**: Participate in GitHub Discussions

## 🚀 Deployment

### Environment Setup

For production deployment, ensure you have:

1. **PostgreSQL database** (Railway, Supabase, etc.)
2. **Redis instance** (Railway, Upstash, etc.)
3. **Environment variables** configured
4. **OAuth providers** configured with production URLs

### Coolify Deployment

This project is configured for Coolify deployment with GitHub Actions:

1. **Push to main branch** triggers automatic deployment
2. **Environment variables** are managed in Coolify
3. **Database migrations** run automatically
4. **Health checks** ensure successful deployment

### Manual Deployment Commands

```bash
# Build and deploy
pnpm build
pnpm start

# Database migration in production
pnpm db:push:prod
pnpm db:seed:prod
```

## 📊 Monitoring & Analytics

### Built-in Analytics

- **Vercel Analytics**: Web vitals and page views
- **Vercel Speed Insights**: Performance monitoring
- **Custom Analytics**: User behavior tracking

### Error Monitoring

- **Console logging**: Structured logging in development
- **Error boundaries**: React error handling
- **API error tracking**: Comprehensive error reporting

## 🤝 Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our development process and how to submit pull requests.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pnpm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎉**

For questions or support, please [open an issue](https://github.com/FYGS/fygs.dev/issues) or [start a discussion](https://github.com/FYGS/fygs.dev/discussions).