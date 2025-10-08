# Expert Next.js 15+ Development Guidelines

You are assisting with a modern Next.js 15+ application. Follow these guidelines for all code generation:

## 🎯 Core Principles

1. Write type-safe, maintainable, and performant code
2. Follow SOLID principles and clean architecture, follow DRY basics (centralize repetitive logics: css into app/globals.css, and code accordingly)
3. Optimize with using server actions as far as possible by default
4. Implement proper error boundaries and logging
5. Ensure code is testable and well-documented, do not keep non used variables, code not needed and useless has to be removed/deleted
6. Do not produced non-sense code, any provided code MUST work fine and perform it goal feature actions

## 🏗️ Technical Requirements

- Use TypeScript strict mode
- Implement Server Components by default
- Generate Zod schemas for all data validation
- Follow the REST/tRPC API design patterns
- Utilize React Server Components (RSC) patterns
- Implement proper error handling and logging
- Ensure edge-first deployment readiness

## 📐 Code Organization

Always follow this structure:

```typescript
// Component Pattern
import { z } from "zod";
import type { Metadata } from "next";

// 1. Types/Schemas
// 2. Server-side code
// 3. Client hooks (if needed)
// 4. Component logic
// 5. Export
```

## 🔒 Security Requirements

1. Validate all inputs with Zod
2. Use server actions for data mutations
3. Implement proper CORS policies
4. Follow security headers best practices
5. Handle rate limiting appropriately

## ⚡ Performance Guidelines

1. Optimize images and assets
2. Implement proper caching strategies
3. Use streaming and suspense boundaries
4. Minimize client-side JavaScript
5. Leverage Edge Runtime when possible

## 🎨 UI/UX Standards

1. Follow Atomic Design principles
2. Use Tailwind CSS with proper structuring
3. Implement responsive design patterns
4. Follow accessibility guidelines
5. Use Shadcn UI components consistently

## 🌟 Enhanced User Experience Guidelines

1. Performance Excellence

- Implement View Transitions API
- Use Intersection Observer for lazy loading
- Enable Streaming SSR with Suspense
- Optimize assets with next/image and next/font
- Implement predictive prefetching

2. Modern Features

- Implement progressive web app (PWA) capabilities
- Use CSS Container Queries for adaptive layouts
- Enable offline functionality with Service Workers
- Implement smooth page transitions
- Use React Concurrent features

3. UI/UX Enhancement

- Apply glass morphism strategically:
  ```css
  .glass-effect {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  ```
- Implement micro-interactions
- Use subtle parallax effects
- Add responsive 3D transforms
- Enable dark/light theme transitions

4. Development Workflow

- Test each feature independently
- Fix existing issues before adding features
- Implement proper error boundaries
- Use performance monitoring
- Follow semantic versioning

5. Quality Assurance

- Run Lighthouse audits regularly
- Test across multiple devices
- Monitor Core Web Vitals
- Implement error tracking
- Use automated testing

Remember: Progress systematically, validate each step, then proceed.

## 🧪 Testing Requirements

1. Write unit tests for utilities
2. Include integration tests for APIs
3. Add E2E tests for critical flows
4. Test error scenarios
5. Ensure proper test coverage

## 📝 Documentation Standards

1. Add JSDoc comments for functions
2. Document component props
3. Include usage examples
4. Document error scenarios
5. Add changelog entries

## ❌ Anti-Patterns to Avoid

1. No direct DB queries in components
2. No prop drilling beyond 2 levels
3. No client components in layouts
4. No nested server/client components
5. No unnecessary re-renders

## 🔍 Response Format

For each code generation request:

1. Start with types and schemas
2. Follow with server-side logic
3. Add client-side code if needed
4. Include error handling
5. Add appropriate tests
6. Document usage examples

## 📚 Example Request

"Create a user profile page with:

- Server component for data fetching
- Client component for interactions
- Form validation with Zod
- Error boundaries
- Loading states"

---

Remember:

- Every feature must be type-safe
- Include error handling
- Follow Edge Runtime patterns
- Optimize for performance
- Add proper documentation
- Do not repeat yourself
- Do not break existing code already valided. ONLY improvements
- Always fix linter issues before pursuing
