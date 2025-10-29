# Test Infrastructure Guide

## Overview

This project uses a consolidated test infrastructure with Vitest, Docker Compose, and isolated test databases.

## Test Setup

### Prerequisites

- Docker and Docker Compose installed
- Node.js and pnpm installed

### Test Database and Services

The test infrastructure uses Docker Compose to provide isolated test services:

- **PostgreSQL Test Database**: `localhost:5433` (isolated from development DB on port 5432)
- **Redis Test Instance**: `localhost:6380` (isolated from development Redis on port 6379)

### Running Tests

```bash
# Quick test run (assumes services are running)
pnpm test

# Watch mode for development
pnpm test:watch

# Full test cycle with setup and teardown
pnpm test:full

# Manual service management
pnpm test:setup    # Start Docker services and setup database
pnpm test:teardown # Stop Docker services and cleanup
```

### Test Configuration

- **Main Config**: `vitest.config.ts` (consolidated, no duplicates)
- **Setup File**: `tests/setup.ts` (handles database reset between tests)
- **Environment**: `.env.test` (test-specific configuration)
- **Docker Compose**: `docker-compose.test.yml` (test services)

### Test Organization

```
tests/
├── setup.ts              # Global test setup and cleanup
├── unit/                  # Unit tests
├── integration/           # Integration tests
├── e2e/                   # End-to-end tests
└── reviews/               # Review system specific tests
    ├── unit/              # Review unit tests
    ├── integration/       # Review integration tests
    ├── e2e/               # Review e2e tests
    └── fixtures/          # Test data and fixtures
```

### Database Management

The test infrastructure automatically:

1. **Setup**: Creates test database schema before tests
2. **Isolation**: Resets database between each test
3. **Cleanup**: Optionally tears down services after test suite

### Best Practices

1. **Test Isolation**: Each test starts with a clean database
2. **Service Management**: Use Docker Compose for consistent test environment
3. **Environment Separation**: Test services run on different ports than development
4. **No Duplicates**: Single vitest.config.ts and setup.ts for entire project
5. **Clean Code**: Remove unused test files and configurations

### Troubleshooting

**Services not starting:**
```bash
docker-compose -f docker-compose.test.yml logs
```

**Database connection issues:**
```bash
# Check if test database is accessible
docker-compose -f docker-compose.test.yml exec postgres-test psql -U postgres -d fygs_test -c '\dt'
```

**Port conflicts:**
- Test PostgreSQL: 5433 (dev uses 5432)
- Test Redis: 6380 (dev uses 6379)

### Environment Variables

Key test environment variables in `.env.test`:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5433/fygs_test"
REDIS_URL="redis://localhost:6380/0"
NODE_ENV="test"
```

## Review System Tests

The comprehensive review system includes tests for:

- ✅ Review creation and validation
- ✅ Voting system (helpful/not helpful)
- ✅ Reply system with moderation
- ✅ Reporting and content moderation
- ✅ Search and filtering
- ✅ Permission checks
- ✅ Rate limiting
- ✅ Email notifications
- ✅ Analytics and statistics

All review functionality is tested with proper database isolation and realistic test scenarios.