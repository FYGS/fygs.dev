#!/usr/bin/env node

/**
 * Accessibility Testing Script for Learning Platform
 * 
 * This script provides basic accessibility validation for key user flows.
 * Can be enhanced with axe-core when available.
 */

const fs = require('fs');
const path = require('path');

// Critical pages to test for accessibility
const pagesToTest = [
  {
    name: "Homepage",
    path: "/",
    priority: "high",
    userFlow: "Landing page experience"
  },
  {
    name: "Course Catalog",
    path: "/formations",
    priority: "high", 
    userFlow: "Course discovery"
  },
  {
    name: "Course Detail",
    path: "/formations/[slug]",
    priority: "critical",
    userFlow: "Course evaluation and enrollment"
  },
  {
    name: "Lesson Page",
    path: "/formations/[slug]/lessons/[lessonSlug]",
    priority: "critical",
    userFlow: "Primary learning experience"
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    priority: "high",
    userFlow: "User progress tracking"
  },
  {
    name: "Login Page",
    path: "/auth/login",
    priority: "critical",
    userFlow: "Authentication"
  },
  {
    name: "Register Page", 
    path: "/auth/register",
    priority: "critical",
    userFlow: "User onboarding"
  },
  {
    name: "Billing Dashboard",
    path: "/dashboard/billing",
    priority: "high",
    userFlow: "Subscription management"
  }
];

// Accessibility requirements based on WCAG 2.1 AA
const accessibilityRequirements = {
  semantic: {
    name: "Semantic HTML",
    description: "Proper heading hierarchy, landmarks, form labels",
    level: "AA",
    priority: "critical"
  },
  keyboard: {
    name: "Keyboard Navigation", 
    description: "All interactive elements accessible via keyboard",
    level: "AA",
    priority: "critical"
  },
  contrast: {
    name: "Color Contrast",
    description: "4.5:1 ratio for normal text, 3:1 for large text",
    level: "AA",
    priority: "high"
  },
  focus: {
    name: "Focus Management",
    description: "Visible focus indicators, logical focus order",
    level: "AA", 
    priority: "critical"
  },
  labels: {
    name: "Form Labels",
    description: "All form inputs have associated labels",
    level: "A",
    priority: "critical"
  },
  images: {
    name: "Image Alt Text",
    description: "Meaningful alt text for informative images",
    level: "A",
    priority: "high"
  },
  errors: {
    name: "Error Identification",
    description: "Clear error messages and validation feedback",
    level: "A",
    priority: "high"
  },
  responsive: {
    name: "Responsive Design",
    description: "Usable at 320px width, 200% zoom",
    level: "AA",
    priority: "high"
  }
};

// Manual accessibility checklist
const manualChecklist = [
  {
    category: "Semantic HTML",
    checks: [
      "Page has proper heading hierarchy (h1 -> h2 -> h3)",
      "Main content areas use semantic landmarks (main, nav, aside)",
      "Lists use proper ul/ol/li structure",
      "Form elements have associated labels",
      "Interactive elements use appropriate ARIA roles"
    ]
  },
  {
    category: "Keyboard Navigation",
    checks: [
      "All interactive elements reachable via Tab key",
      "Tab order follows logical reading order", 
      "Modal dialogs trap focus appropriately",
      "Skip links provided for main content",
      "Custom components support keyboard interaction"
    ]
  },
  {
    category: "Focus Management", 
    checks: [
      "Focus indicators clearly visible",
      "Focus not lost when content changes",
      "Focus moves logically through interface",
      "Focus restored appropriately after modal close",
      "No keyboard traps (except intentional modal traps)"
    ]
  },
  {
    category: "Color and Contrast",
    checks: [
      "Text meets 4.5:1 contrast ratio (normal text)",
      "Large text meets 3:1 contrast ratio",
      "Interactive elements have sufficient contrast",
      "Information not conveyed by color alone",
      "Focus indicators have adequate contrast"
    ]
  },
  {
    category: "Forms and Inputs",
    checks: [
      "All inputs have descriptive labels",
      "Required fields clearly marked",
      "Error messages associated with fields",
      "Validation feedback is immediate and clear",
      "Form submission provides feedback"
    ]
  },
  {
    category: "Images and Media",
    checks: [
      "Informative images have descriptive alt text",
      "Decorative images use empty alt attribute",
      "Video content has captions/transcripts",
      "Audio content has transcripts",
      "Complex images have detailed descriptions"
    ]
  },
  {
    category: "Responsive and Mobile",
    checks: [
      "Content reflows properly at 320px width",
      "Interface usable at 200% zoom level",
      "Touch targets at least 44x44px",
      "Content remains accessible when zoomed",
      "Horizontal scrolling not required"
    ]
  },
  {
    category: "Screen Reader Support",
    checks: [
      "Page structure navigable by headings",
      "Dynamic content changes announced",
      "Status messages communicated to assistive tech",
      "Complex widgets have proper ARIA",
      "Reading order matches visual order"
    ]
  }
];

// Component-specific accessibility patterns
const componentPatterns = {
  "Course Card": {
    requirements: [
      "Proper heading for course title",
      "Descriptive link text for course access",
      "Price information programmatically associated", 
      "Badge information accessible to screen readers",
      "Focus management for hover states"
    ]
  },
  "Video Player": {
    requirements: [
      "Video controls keyboard accessible",
      "Play/pause accessible via Space/Enter",
      "Progress control accessible",
      "Caption toggle available",
      "Video element has descriptive title"
    ]
  },
  "Progress Indicators": {
    requirements: [
      "Progress value announced to screen readers",
      "Progress updates don't interrupt user flow",
      "Visual and programmatic progress match",
      "Completion status clearly communicated"
    ]
  },
  "Modal Dialogs": {
    requirements: [
      "Focus trapped within modal when open",
      "Focus returned to trigger on close",
      "Modal announced to screen readers",
      "Close button accessible via Escape key",
      "Modal overlay click-to-close accessible"
    ]
  },
  "Form Validation": {
    requirements: [
      "Errors associated with specific fields",
      "Error summary provided for screen readers",
      "Success states clearly communicated",
      "Real-time validation doesn't interrupt typing",
      "Required field indicators accessible"
    ]
  }
};

/**
 * Generate accessibility testing report
 */
function generateA11yReport() {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      totalPages: pagesToTest.length,
      totalRequirements: Object.keys(accessibilityRequirements).length,
      totalChecks: manualChecklist.reduce((sum, cat) => sum + cat.checks.length, 0)
    },
    pages: pagesToTest,
    requirements: accessibilityRequirements,
    manualChecklist: manualChecklist,
    componentPatterns: componentPatterns,
    recommendations: []
  };

  // Add specific recommendations for our platform
  report.recommendations = [
    {
      priority: "high",
      component: "Video Player",
      issue: "Ensure video controls are fully keyboard accessible",
      solution: "Implement proper ARIA labels and keyboard event handlers for custom video controls"
    },
    {
      priority: "high", 
      component: "Course Enrollment",
      issue: "Enrollment state changes need screen reader announcements",
      solution: "Use aria-live regions to announce enrollment status changes"
    },
    {
      priority: "medium",
      component: "Progress Tracking",
      issue: "Progress updates should not interrupt screen reader flow",
      solution: "Use aria-live='polite' for non-critical progress updates"
    },
    {
      priority: "high",
      component: "Form Validation", 
      issue: "Real-time validation needs accessibility improvements",
      solution: "Associate error messages with inputs using aria-describedby"
    },
    {
      priority: "medium",
      component: "Course Cards",
      issue: "Ensure all course information is accessible to screen readers",
      solution: "Use proper semantic structure and ARIA labels for course metadata"
    }
  ];

  return report;
}

/**
 * Generate testing checklist for manual review
 */
function generateTestingChecklist() {
  console.log('🔍 Accessibility Testing Checklist\n');
  console.log('='.repeat(50));
  
  pagesToTest.forEach((page, index) => {
    console.log(`\n${index + 1}. ${page.name} (${page.path})`);
    console.log(`   Priority: ${page.priority.toUpperCase()}`);
    console.log(`   User Flow: ${page.userFlow}`);
    console.log('   Manual Tests:');
    
    // Show relevant manual checks for each page
    manualChecklist.forEach(category => {
      console.log(`     ${category.category}:`);
      category.checks.slice(0, 2).forEach(check => {
        console.log(`       ☐ ${check}`);
      });
    });
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 Full Manual Testing Checklist\n');
  
  manualChecklist.forEach((category, index) => {
    console.log(`${index + 1}. ${category.category}`);
    category.checks.forEach(check => {
      console.log(`   ☐ ${check}`);
    });
    console.log('');
  });
}

/**
 * Save report to file
 */
function saveReport(report) {
  const outputPath = path.join(__dirname, '..', 'docs', 'accessibility-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`📄 Accessibility report saved to: ${outputPath}`);
  
  // Also generate a markdown version
  const mdPath = path.join(__dirname, '..', 'docs', 'accessibility-testing.md');
  const mdContent = generateMarkdownReport(report);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`📄 Accessibility guide saved to: ${mdPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  return `# Accessibility Testing Guide

Generated: ${new Date(report.generated).toLocaleDateString()}

## Overview

This document outlines accessibility testing procedures and requirements for the learning platform, ensuring WCAG 2.1 AA compliance.

## Summary

- **Total Pages to Test**: ${report.summary.totalPages}
- **Accessibility Requirements**: ${report.summary.totalRequirements}
- **Manual Test Checks**: ${report.summary.totalChecks}

## Critical User Flows

${report.pages.map(page => `
### ${page.name}
- **Path**: \`${page.path}\`
- **Priority**: ${page.priority.toUpperCase()}
- **User Flow**: ${page.userFlow}
`).join('')}

## Accessibility Requirements (WCAG 2.1 AA)

${Object.entries(report.requirements).map(([key, req]) => `
### ${req.name}
- **Level**: WCAG ${req.level}
- **Priority**: ${req.priority.toUpperCase()}
- **Description**: ${req.description}
`).join('')}

## Manual Testing Checklist

${report.manualChecklist.map((category, index) => `
### ${index + 1}. ${category.category}

${category.checks.map(check => `- [ ] ${check}`).join('\n')}
`).join('')}

## Component-Specific Patterns

${Object.entries(report.componentPatterns).map(([component, pattern]) => `
### ${component}

${pattern.requirements.map(req => `- ${req}`).join('\n')}
`).join('')}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.component} (${rec.priority.toUpperCase()} Priority)
**Issue**: ${rec.issue}
**Solution**: ${rec.solution}
`).join('')}

## Testing Tools

### Manual Testing
1. **Keyboard Navigation**: Test with Tab, Shift+Tab, Enter, Space, Arrow keys
2. **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
3. **Zoom Testing**: Test at 200% zoom level
4. **Color Testing**: Use browser dev tools to simulate color blindness

### Automated Testing (Future)
Consider integrating these tools:

\`\`\`bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/cli

# Run axe tests
npx axe http://localhost:3000 --include="main" --exclude="iframe"
\`\`\`

### Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation
- **Lighthouse**: Accessibility audit included
- **Colour Contrast Analyser**: Color contrast checking

## Testing Procedures

### Development Testing
1. Run accessibility checklist for modified components
2. Test keyboard navigation for interactive elements
3. Validate focus management changes
4. Check color contrast for new UI elements

### Pre-deployment Testing  
1. Complete manual testing checklist for critical flows
2. Run automated accessibility tests
3. Test with actual assistive technology
4. Validate responsive accessibility

### Production Monitoring
1. Set up accessibility monitoring alerts
2. Regular accessibility audits
3. User feedback collection for accessibility issues
4. Accessibility metrics tracking

## Current Status

Last manual test: [Date]
Test coverage: [Percentage]
Critical issues: [Count]
Overall accessibility score: [Score]/100

### Known Issues
- Video player keyboard navigation (In Progress)
- Form validation screen reader support (Planned)
- Modal focus management (Reviewed)
- Progress update announcements (Planned)

### Recent Improvements
- Better Auth integration with proper focus management
- Server Actions reducing client-side complexity
- Structured semantic HTML in components
- Improved form validation patterns

## Next Steps
1. Implement automated accessibility testing in CI/CD
2. Set up regular accessibility audits
3. Train development team on accessibility best practices
4. Establish accessibility testing protocols for new features
`;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Accessibility Testing Script

Usage: node a11y-test.js [options]

Options:
  --checklist, -c    Generate manual testing checklist
  --report, -r       Generate accessibility report
  --help, -h         Show this help message

Examples:
  node a11y-test.js --checklist
  node a11y-test.js --report
    `);
    process.exit(0);
  }
  
  if (args.includes('--checklist') || args.includes('-c')) {
    generateTestingChecklist();
  } else if (args.includes('--report') || args.includes('-r')) {
    const report = generateA11yReport();
    saveReport(report);
    console.log('✅ Accessibility report generated successfully');
  } else {
    // Default: show overview
    console.log('🔍 Accessibility Testing Overview\n');
    console.log(`Pages to test: ${pagesToTest.length}`);
    console.log(`Manual checks: ${manualChecklist.reduce((sum, cat) => sum + cat.checks.length, 0)}`);
    console.log(`Component patterns: ${Object.keys(componentPatterns).length}`);
    console.log('\nUse --checklist to generate testing checklist');
    console.log('Use --report to generate full accessibility report');
  }
}

module.exports = {
  generateA11yReport,
  generateTestingChecklist,
  pagesToTest,
  accessibilityRequirements,
  manualChecklist,
  componentPatterns
};