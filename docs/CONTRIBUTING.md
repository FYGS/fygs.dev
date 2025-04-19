# Contributing to TechMastry Platform

Thank you for your interest in contributing to TechMastry Platform! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/tech-mastry-platform.git
   cd tech-mastry-platform
   ```
3. Add the original repository as a remote:
   ```bash
   git remote add upstream https://github.com/originalowner/tech-mastry-platform.git
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your local configuration.
6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

We follow a simplified Git flow:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent fixes for production

### Creating a New Feature

1. Ensure your fork is up to date:
   ```bash
   git checkout develop
   git pull upstream develop
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, following the [coding standards](#coding-standards)
4. Commit your changes with meaningful commit messages:
   ```bash
   git commit -m "feat: add new feature"
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
5. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a pull request to the `develop` branch of the original repository

### Keeping Your Fork Updated

Regularly update your fork with changes from the upstream repository:

```bash
git checkout develop
git pull upstream develop
git push origin develop
```

## Pull Request Process

1. Ensure your code follows the project's [coding standards](#coding-standards)
2. Update documentation as necessary
3. Add or update tests as needed
4. Ensure all tests pass:
   ```bash
   pnpm test
   ```
5. Fill out the pull request template completely
6. Request a review from maintainers
7. Address any feedback from reviewers
8. Once approved, a maintainer will merge your pull request

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the principle of least surprise
- Keep functions small and focused
- Use meaningful variable and function names
- Comment complex logic, but prefer self-documenting code

### TypeScript Guidelines

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid using `any` type
- Use type guards for runtime type checking

### React Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use React Server Components where appropriate
- Follow the React hooks rules
- Use proper component composition

### CSS Guidelines

- Use Tailwind CSS for styling
- Follow the project's design system
- Ensure responsive design
- Maintain accessibility

### Code Formatting

We use ESLint and Prettier for code formatting:

```bash
# Check code formatting
pnpm lint

# Fix formatting issues
pnpm lint:fix
```

## Testing Guidelines

### Types of Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user flows

### Writing Tests

- Write tests for all new features
- Maintain or improve test coverage
- Test edge cases and error conditions
- Use meaningful test descriptions

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Documentation Guidelines

### Code Documentation

- Use JSDoc comments for functions and classes
- Document complex algorithms
- Explain non-obvious behavior
- Keep comments up to date with code changes

### Feature Documentation

- Update relevant documentation for new features
- Create new documentation files as needed
- Use clear, concise language
- Include examples where appropriate

### README Updates

- Keep the README up to date
- Document new features and changes
- Update installation and usage instructions as needed

## Issue Reporting

### Bug Reports

When reporting a bug, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment information (browser, OS, etc.)

### Security Issues

For security issues, please do not create a public issue. Instead, email security@fygs.dev with details.

## Feature Requests

When suggesting a feature, please include:

- A clear, descriptive title
- Detailed description of the proposed feature
- Rationale for adding the feature
- Potential implementation approach if you have one

## Community

### Communication Channels

- **GitHub Discussions**: For general questions and discussions
- **Discord**: For real-time communication
- **Weekly Meetings**: For contributors and maintainers

### Mentoring

We welcome new contributors and provide mentoring:

- Join the #new-contributors channel on Discord
- Look for issues labeled "good first issue"
- Reach out to maintainers for guidance

### Recognition

Contributors are recognized in several ways:

- Listed in the CONTRIBUTORS.md file
- Mentioned in release notes
- Featured on the project website

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).
