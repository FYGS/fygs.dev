- **Context**: Implement secure authentication with JWT sessions
- **Patterns**:
  1. Always create `withAuth` wrappers for protected routes
  2. Use HTTPOnly cookies for token storage
  3. Validate tokens server-side with Zod
- **Example**:
  "Create a Better-Auth middleware that checks user roles and logs failed attempts"
