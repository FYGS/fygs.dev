# Performance Testing Guide

## Overview

This document outlines the performance testing strategy for the learning platform, including TTFB (Time To First Byte) budgets and testing procedures.

## Performance Targets

### Page Load Budgets (TTFB)
- **Lesson Pages**: < 200ms (critical user path)
- **Course Pages**: < 300ms (high-traffic pages)  
- **Dashboard**: < 400ms (authenticated, data-heavy)
- **Homepage/Catalog**: < 300ms (public pages)

### API Response Budgets
- **Progress Updates**: < 100ms (frequent calls)
- **Course Status**: < 100ms (real-time queries)
- **Progress Summary**: < 150ms (dashboard data)
- **Enrollment Actions**: < 500ms (transactional)

### Server Action Budgets
- **Update Lesson Progress**: < 100ms (real-time)
- **Enroll Course**: < 500ms (transactional with validation)
- **Issue Certificate**: < 1000ms (heavy computation)
- **Cancel Subscription**: < 500ms (payment processing)

## Testing Tools

### 1. Basic Performance Script
Location: `scripts/performance-test.js`

```bash
# Run basic performance tests
node scripts/performance-test.js http://localhost:3000

# With authentication (for protected routes)
node scripts/performance-test.js http://localhost:3000 "session_token=abc123"
```

### 2. Next.js Built-in Performance
Next.js provides built-in performance monitoring via:
- Web Vitals reporting
- Build analyzer
- Edge Runtime performance

### 3. Enhanced Testing (Future)
Consider integrating these tools for comprehensive performance testing:

**k6 (Load Testing)**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  let response = http.get('http://localhost:3000/formations');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });
}
```

**Autocannon (Simple Load Testing)**
```bash
# Install autocannon
npm install -g autocannon

# Test lesson page performance
autocannon -c 10 -d 30s http://localhost:3000/formations/javascript-fundamentals/lessons/introduction
```

## Performance Optimization Strategies

### 1. Next.js App Router Optimizations
- **Server Components**: Reduce client-side JavaScript
- **Streaming**: Use `loading.tsx` for progressive rendering
- **Edge Runtime**: Use edge runtime for API routes where possible
- **Static Generation**: Pre-generate static pages when possible

### 2. Database Optimizations
- **Prisma Optimizations**: 
  - Use `select` to limit fields
  - Implement connection pooling
  - Use database indexes for common queries
- **Caching Strategy**: Implement Redis caching for frequent queries

### 3. Better Auth Performance
- **Session Management**: Optimize session validation overhead
- **JWT Strategy**: Balance security with performance
- **Database Sessions**: Consider trade-offs vs JWT for performance

### 4. Asset Optimization
- **Next.js Image**: Use optimized image component
- **Code Splitting**: Implement route-based code splitting
- **Bundle Analysis**: Regular bundle size monitoring

## Monitoring & Alerting

### 1. Web Vitals Tracking
Monitor Core Web Vitals in production:
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### 2. Real User Monitoring (Future)
Consider implementing:
- Vercel Analytics
- Google Analytics Core Web Vitals
- Custom performance tracking

### 3. Server Performance
- Database query performance monitoring
- Server action execution time tracking
- API route response time monitoring

## Testing Procedures

### Development Testing
1. Run performance script before commits
2. Test with realistic data volumes
3. Validate performance impact of changes

### Pre-deployment Testing
1. Load test with production-like data
2. Validate all performance budgets
3. Test with different network conditions

### Production Monitoring
1. Set up performance alerts
2. Regular performance audits
3. Track performance trends over time

## Performance Budget Violations

### Investigation Process
1. **Identify Bottleneck**: Use browser dev tools, profiling
2. **Root Cause Analysis**: Database queries, network, rendering
3. **Optimization**: Apply appropriate optimization strategy
4. **Validation**: Re-test to confirm improvement
5. **Documentation**: Update performance notes

### Common Performance Issues
- **Database N+1 Queries**: Optimize with proper includes/joins
- **Large Bundle Size**: Implement code splitting
- **Slow Database Queries**: Add indexes, optimize queries
- **Unoptimized Images**: Use Next.js Image component
- **Client-Side Data Fetching**: Move to Server Components

## Current Performance Status

Last tested: [Date]
Test environment: Development/Production
Overall performance score: [Score]/100

### Recent Optimizations
- Migration to Server Actions (reduced client-side JavaScript)
- Implementation of Access Service (optimized permission checks)
- Structured logging (minimal performance impact)
- Better Auth integration (session optimization)

### Known Performance Debt
- Lesson order calculation (TODO in updateLessonProgress)
- Total watch time calculation (TODO in certificate service)  
- Bundle size optimization opportunities
- Database query optimization potential

## Next Steps
1. Implement k6 or autocannon for comprehensive load testing
2. Set up continuous performance monitoring
3. Establish performance regression testing in CI/CD
4. Implement caching strategy for frequently accessed data