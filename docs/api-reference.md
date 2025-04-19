# API Reference Documentation

This document provides a comprehensive reference for TechMastry Platform's API endpoints, including request formats, response structures, and authentication requirements.

## Overview

The platform exposes a set of API endpoints for various features, including code execution, AI assistance, user management, and learning progress tracking. These APIs are used by the frontend application and can also be accessed by external integrations.

## Authentication

Most API endpoints require authentication. The platform uses JWT (JSON Web Tokens) for authentication.

### Authentication Headers

```
Authorization: Bearer <token>
```

### Obtaining a Token

Tokens can be obtained through the authentication endpoints:

- `POST /api/auth/login`: Log in with credentials
- `POST /api/auth/register`: Create a new account
- `POST /api/auth/refresh`: Refresh an expired token

## API Endpoints

### Code Execution API

#### Execute Code

```
POST /api/code/execute
```

Executes code in a specified programming language.

**Request Body:**

```json
{
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "timeout": 30000
}
```

**Response:**

```json
{
  "output": "Hello, World!",
  "logs": ["Hello, World!"],
  "errors": [],
  "executionTime": 42
}
```

**Status Codes:**

- `200 OK`: Code executed successfully
- `400 Bad Request`: Invalid request parameters
- `408 Request Timeout`: Execution timed out
- `500 Internal Server Error`: Server error during execution

#### Save Code Snippet

```
POST /api/code/save
```

Saves a code snippet to the user's account.

**Request Body:**

```json
{
  "code": "function sum(a, b) { return a + b; }",
  "language": "javascript",
  "title": "Sum Function",
  "description": "A simple function to add two numbers",
  "isPublic": false
}
```

**Response:**

```json
{
  "id": "snippet_123456",
  "url": "/snippets/snippet_123456",
  "createdAt": "2023-06-15T10:30:00Z"
}
```

### AI Assistant API

#### Analyze Code

```
POST /api/ai/analyze
```

Analyzes code and provides suggestions, explanations, and metrics.

**Request Body:**

```json
{
  "code": "function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); }",
  "language": "javascript"
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "type": "performance",
      "description": "Consider memoization to optimize recursive calls",
      "severity": "info",
      "lineNumber": 1
    }
  ],
  "explanation": "This JavaScript code defines a recursive factorial function...",
  "complexity": {
    "time": "O(n)",
    "space": "O(n)",
    "score": 4
  },
  "summary": "Recursive factorial implementation with potential for optimization."
}
```

#### Get Hint

```
POST /api/ai/hint
```

Provides a hint for a specific coding challenge.

**Request Body:**

```json
{
  "challengeId": "challenge_123",
  "code": "function twoSum(nums, target) { /* incomplete code */ }",
  "language": "javascript"
}
```

**Response:**

```json
{
  "hint": "Try using a hash map to store values you've seen so far.",
  "explanation": "By storing each number in a hash map, you can check if the complement exists in constant time.",
  "code": "function twoSum(nums, target) {\n  const seen = {};\n  // More code here\n}"
}
```

#### Chat with AI

```
POST /api/ai/chat
```

Sends a message to the AI assistant and receives a response.

**Request Body:**

```json
{
  "message": "How can I optimize my recursive function?",
  "code": "function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }",
  "language": "javascript",
  "challengeId": "challenge_123"
}
```

**Response:**

```json
{
  "response": "Your recursive Fibonacci function has exponential time complexity...",
  "suggestions": [
    {
      "title": "Use memoization",
      "description": "Cache results to avoid redundant calculations",
      "code": "function fibonacci(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo);\n  return memo[n];\n}"
    }
  ]
}
```

### Learning Progress API

#### Get User Progress

```
GET /api/learning/progress
```

Retrieves the user's learning progress.

**Response:**

```json
{
  "completedChallenges": 42,
  "currentStreak": 7,
  "totalLearningTime": 3600000,
  "skillLevels": {
    "algorithms": 0.75,
    "dataStructures": 0.6,
    "javascript": 0.85,
    "python": 0.4
  },
  "achievements": [
    {
      "id": "achievement_123",
      "title": "Algorithm Master",
      "description": "Complete 50 algorithm challenges",
      "progress": 0.84,
      "unlockedAt": null
    }
  ]
}
```

#### Update Challenge Progress

```
POST /api/learning/challenges/:challengeId/progress
```

Updates the user's progress on a specific challenge.

**Request Body:**

```json
{
  "status": "completed",
  "solution": "function twoSum(nums, target) { /* solution code */ }",
  "timeSpent": 1200000,
  "hintsUsed": 2
}
```

**Response:**

```json
{
  "success": true,
  "newAchievements": [
    {
      "id": "achievement_456",
      "title": "Quick Solver",
      "description": "Solve a challenge in under 20 minutes"
    }
  ],
  "skillProgress": {
    "algorithms": 0.02,
    "javascript": 0.01
  }
}
```

### Collaboration API

#### Create Collaboration Session

```
POST /api/collaboration/sessions
```

Creates a new collaborative coding session.

**Request Body:**

```json
{
  "title": "Pair Programming Session",
  "language": "javascript",
  "initialCode": "// Let's solve this together",
  "isPublic": false,
  "maxParticipants": 4
}
```

**Response:**

```json
{
  "sessionId": "session_123456",
  "joinUrl": "https://fygs.dev/collaborate/session_123456",
  "hostToken": "host_token_xyz",
  "createdAt": "2023-06-15T14:30:00Z"
}
```

#### Join Collaboration Session

```
POST /api/collaboration/sessions/:sessionId/join
```

Joins an existing collaborative session.

**Request Body:**

```json
{
  "displayName": "Jane Doe",
  "role": "participant"
}
```

**Response:**

```json
{
  "participantId": "participant_789",
  "participantToken": "participant_token_abc",
  "sessionDetails": {
    "title": "Pair Programming Session",
    "language": "javascript",
    "currentCode": "// Let's solve this together",
    "participants": [
      {
        "id": "participant_123",
        "displayName": "John Doe",
        "role": "host"
      }
    ]
  }
}
```

### User Management API

#### Get User Profile

```
GET /api/users/profile
```

Retrieves the current user's profile information.

**Response:**

```json
{
  "id": "user_123456",
  "username": "coder123",
  "email": "coder@example.com",
  "displayName": "Awesome Coder",
  "joinedAt": "2023-01-15T10:00:00Z",
  "preferences": {
    "theme": "dark",
    "editorFontSize": 14,
    "language": "javascript"
  }
}
```

#### Update User Preferences

```
PATCH /api/users/preferences
```

Updates the user's preferences.

**Request Body:**

```json
{
  "theme": "light",
  "editorFontSize": 16,
  "language": "python"
}
```

**Response:**

```json
{
  "success": true,
  "preferences": {
    "theme": "light",
    "editorFontSize": 16,
    "language": "python"
  }
}
```

## Error Handling

All API endpoints follow a consistent error format:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid",
    "details": {
      "field": "language",
      "issue": "Unsupported language specified"
    }
  }
}
```

### Common Error Codes

- `invalid_request`: The request was malformed or contained invalid parameters
- `unauthorized`: Authentication is required or the provided credentials are invalid
- `forbidden`: The authenticated user doesn't have permission for the requested operation
- `not_found`: The requested resource doesn't exist
- `rate_limited`: The client has sent too many requests
- `internal_error`: An unexpected error occurred on the server

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse. Rate limits are specified in the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623766800
```

When a rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Versioning

The API uses URL versioning. The current version is v1:

```
/api/v1/code/execute
```

## Webhooks

The platform supports webhooks for real-time notifications of events:

### Available Events

- `challenge.completed`: Triggered when a user completes a challenge
- `session.created`: Triggered when a new collaboration session is created
- `session.joined`: Triggered when a user joins a collaboration session
- `achievement.unlocked`: Triggered when a user unlocks an achievement

### Webhook Format

```json
{
  "event": "challenge.completed",
  "timestamp": "2023-06-15T15:30:00Z",
  "data": {
    "userId": "user_123456",
    "challengeId": "challenge_789",
    "completedAt": "2023-06-15T15:29:45Z"
  }
}
```

## SDK

The platform provides a JavaScript SDK for easier integration:

```javascript
import { InterviewPrepSDK } from "@fygs/tech-mastry-sdk";

const sdk = new InterviewPrepSDK({
  apiKey: "your_api_key",
  baseUrl: "https://api.fygs.dev",
});

// Execute code
const result = await sdk.executeCode({
  code: 'console.log("Hello, World!");',
  language: "javascript",
});

console.log(result.output); // "Hello, World!"
```

## API Playground

An interactive API playground is available at `https://fygs.dev/api-playground` for testing API endpoints directly in the browser.
