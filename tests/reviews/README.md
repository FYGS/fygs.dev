# Review System Testing Suite

## Overview

This comprehensive testing suite provides complete coverage for the course review system, including unit tests, integration tests, performance tests, and end-to-end tests.

## Test Structure

```
tests/reviews/
├── fixtures/          # Test data and mock objects
│   ├── review-fixtures.ts
│   └── test-utils.ts
├── unit/              # Fast isolated unit tests
│   ├── review-analytics.test.ts
│   └── review-cache.test.ts
├── integration/       # API and service integration tests
│   └── api-endpoints.test.ts
├── performance/       # Load and performance tests
│   └── system-performance.test.ts
├── e2e/              # End-to-end browser tests
│   └── review-workflows.spec.ts
├── setup.ts          # Global test configuration
├── vitest.config.ts  # Vitest configuration
└── test-runner.js    # Test execution script
```

## Quick Start

### Prerequisites

1. **Node.js 18+** with npm/pnpm
2. **PostgreSQL** for database tests
3. **Redis** for cache tests
4. **Playwright** for E2E tests (optional)

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Running Tests

```bash
# Run all tests
node tests/reviews/test-runner.js

# Run specific category
node tests/reviews/test-runner.js --category=unit
node tests/reviews/test-runner.js --category=integration
node tests/reviews/test-runner.js --category=performance
node tests/reviews/test-runner.js --category=e2e

# Run with coverage
node tests/reviews/test-runner.js --coverage

# Run in watch mode
node tests/reviews/test-runner.js --watch

# Run with verbose output
node tests/reviews/test-runner.js --verbose

# Stop on first failure
node tests/reviews/test-runner.js --bail
```

### Using Vitest directly

```bash
# Run all tests
npx vitest run tests/reviews

# Run specific test file
npx vitest run tests/reviews/unit/review-analytics.test.ts

# Run with coverage
npx vitest run tests/reviews --coverage

# Watch mode
npx vitest tests/reviews
```

## Test Categories

### Unit Tests (`tests/reviews/unit/`)

Fast, isolated tests for individual components and services.

**Coverage:**
- Review analytics service
- Review cache service
- Data validation
- Utility functions

**Characteristics:**
- Execution time: < 30 seconds
- No external dependencies
- Mocked database and Redis
- High code coverage requirements (85%+)

**Example:**
```typescript
describe('ReviewAnalyticsService', () => {
  it('should calculate course review statistics', async () => {
    const stats = await reviewAnalytics.getCourseReviewStats('course_123');
    expect(stats.averageRating).toBe(4.2);
    expect(stats.totalReviews).toBe(150);
  });
});
```

### Integration Tests (`tests/reviews/integration/`)

Tests for API endpoints and service interactions.

**Coverage:**
- API route handlers
- Database operations
- Cache interactions
- Service integrations

**Characteristics:**
- Execution time: < 60 seconds
- Real database connections (test DB)
- Real Redis connections (test Redis)
- API response validation

**Example:**
```typescript
describe('Review API Endpoints', () => {
  it('POST /api/reviews should create new review', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send(mockReviewData)
      .expect(201);
      
    expect(response.body.id).toBeDefined();
  });
});
```

### Performance Tests (`tests/reviews/performance/`)

Load testing and performance benchmarks.

**Coverage:**
- Database query performance
- Cache performance
- API response times
- Concurrent user scenarios

**Characteristics:**
- Execution time: < 2 minutes
- High-load scenarios
- Performance thresholds
- Memory usage monitoring

**Example:**
```typescript
describe('Performance Benchmarks', () => {
  it('should handle 1000 concurrent review reads', async () => {
    const start = Date.now();
    await Promise.all(
      Array(1000).fill(0).map(() => getReviews('course_123'))
    );
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```

### End-to-End Tests (`tests/reviews/e2e/`)

Full user workflow testing with browser automation.

**Coverage:**
- Complete user workflows
- UI interactions
- Cross-browser compatibility
- Accessibility testing

**Characteristics:**
- Execution time: < 5 minutes
- Real browser automation
- Visual regression testing
- User scenario simulation

**Example:**
```typescript
test('User can submit and edit review', async ({ page }) => {
  await page.goto('/courses/test-course');
  await page.click('[data-testid="write-review"]');
  await page.fill('[name="comment"]', 'Great course!');
  await page.click('[data-testid="submit-review"]');
  await expect(page.locator('.review-success')).toBeVisible();
});
```

## Test Configuration

### Environment Variables

```bash
# Test database
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fygs_test"

# Test Redis
REDIS_TEST_URL="redis://localhost:6379/1"

# Debug mode
DEBUG_TESTS=true

# Performance monitoring
MONITOR_PERFORMANCE=true
```

### Coverage Thresholds

```typescript
export default {
  test: {
    coverage: {
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 80,
        statements: 85,
      },
    },
  },
};
```

### Performance Benchmarks

| Operation | Threshold | Description |
|-----------|-----------|-------------|
| Review Read | < 100ms | Single review fetch |
| Review List | < 500ms | Paginated review list |
| Review Create | < 200ms | New review submission |
| Cache Hit | < 10ms | Redis cache retrieval |
| DB Query | < 50ms | Database operations |

## Fixtures and Test Data

### Mock Data Structure

```typescript
const mockReview = {
  id: 'review_123',
  userId: 'user_456',
  courseId: 'course_789',
  rating: 4,
  comment: 'Excellent course content!',
  status: 'APPROVED',
  verified: true,
  helpfulCount: 15,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
```

### Factory Functions

```typescript
// Create test review
const review = createMockReview({
  rating: 5,
  comment: 'Custom comment',
});

// Create test user
const user = createMockUser({
  email: 'test@example.com',
  name: 'Test User',
});

// Create performance test data
const perfData = createPerformanceTestData({
  reviewCount: 1000,
  userCount: 100,
});
```

## Utilities and Helpers

### Database Utilities

```typescript
// Setup test database
await DatabaseTestUtils.setupTestDatabase();

// Create test data
await DatabaseTestUtils.seedTestData();

// Cleanup after tests
await DatabaseTestUtils.cleanupTestData();
```

### API Utilities

```typescript
// Authenticated request
const response = await MockApiUtils.authenticatedRequest(
  'POST',
  '/api/reviews',
  reviewData,
  userToken
);

// Mock external services
MockApiUtils.mockEmailService();
MockApiUtils.mockNotificationService();
```

### Assertion Helpers

```typescript
// Validate review object
testUtils.expectValidReview(review);

// Validate pagination
testUtils.expectValidPagination(pagination);

// Performance assertion
testUtils.expectPerformanceWithinLimits(duration, 1000);
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Review System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Setup test database
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE fygs_test;"
      
      - name: Run tests
        run: node tests/reviews/test-runner.js --coverage
        env:
          TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fygs_test
          REDIS_TEST_URL: redis://localhost:6379/1
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Debugging Tests

### Debug Mode

```bash
# Enable debug output
DEBUG_TESTS=true node tests/reviews/test-runner.js --verbose

# Debug specific test
DEBUG_TESTS=true npx vitest run tests/reviews/unit/review-analytics.test.ts --reporter=verbose
```

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Create test database
   createdb fygs_test
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Use different Redis database
   REDIS_TEST_URL=redis://localhost:6379/2
   ```

3. **Playwright Issues**
   ```bash
   # Install browsers
   npx playwright install
   
   # Run in headed mode
   npx playwright test --headed
   ```

## Best Practices

### Test Organization

1. **One concept per test** - Each test should verify one specific behavior
2. **Descriptive names** - Test names should clearly describe what's being tested
3. **Arrange-Act-Assert** - Structure tests with clear setup, execution, and verification
4. **Independent tests** - Tests should not depend on each other

### Performance Considerations

1. **Use transactions** - Wrap database operations in transactions for easy cleanup
2. **Parallel execution** - Run independent tests in parallel
3. **Efficient mocking** - Mock external dependencies to improve speed
4. **Resource cleanup** - Always clean up resources after tests

### Maintenance

1. **Regular updates** - Keep test data and scenarios up to date
2. **Monitoring** - Track test execution times and failure rates
3. **Documentation** - Maintain clear documentation for test scenarios
4. **Refactoring** - Regularly refactor tests to maintain quality

## Reporting

### Coverage Reports

Coverage reports are generated in `tests/reviews/coverage/` directory:
- `lcov.info` - LCOV format for CI integration
- `index.html` - HTML coverage report
- `coverage-summary.json` - JSON summary

### Test Reports

Test execution reports are saved in `tests/reviews/reports/`:
- `test-results.json` - Detailed test results
- `performance-results.json` - Performance benchmarks
- `error-logs.txt` - Error details for failed tests

### Metrics Dashboard

Key metrics tracked:
- Test execution time trends
- Coverage percentage over time
- Failure rate by category
- Performance benchmark results

## Support

For issues or questions about the testing suite:

1. Check this documentation first
2. Review test logs and error messages
3. Ensure all prerequisites are properly installed
4. Check environment variable configuration
5. Verify database and Redis connectivity

## Contributing

When adding new tests:

1. Follow existing naming conventions
2. Add appropriate test fixtures
3. Update this documentation
4. Ensure tests are independent and reliable
5. Add performance benchmarks for new features