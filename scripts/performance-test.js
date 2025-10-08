/**
 * Basic Performance Test Script for Learning Platform
 * 
 * This script provides a foundation for performance testing key user flows.
 * Can be enhanced with k6 or autocannon when available.
 * 
 * Target metrics:
 * - Lesson page TTFB < 200ms
 * - Course page TTFB < 300ms  
 * - Dashboard page TTFB < 400ms
 * - Enrollment action < 500ms
 * - Progress update < 100ms
 */

const scenarios = [
  {
    name: "Homepage Load",
    url: "/",
    maxTTFB: 300
  },
  {
    name: "Course Catalog",
    url: "/formations",
    maxTTFB: 300
  },
  {
    name: "Course Detail Page",
    url: "/formations/javascript-fundamentals",
    maxTTFB: 300
  },
  {
    name: "Lesson Page (authenticated required)",
    url: "/formations/javascript-fundamentals/lessons/introduction",
    maxTTFB: 200,
    requireAuth: true
  },
  {
    name: "Dashboard",
    url: "/dashboard",
    maxTTFB: 400,
    requireAuth: true
  },
  {
    name: "My Courses",
    url: "/dashboard/my-courses", 
    maxTTFB: 400,
    requireAuth: true
  }
];

const apiEndpoints = [
  {
    name: "Course Status API",
    url: "/api/courses/status",
    maxTTFB: 100,
    requireAuth: true
  },
  {
    name: "Progress Summary API",
    url: "/api/progress/summary",
    maxTTFB: 150,
    requireAuth: true
  }
];

/**
 * Basic timing function using fetch API
 */
async function measureEndpoint(scenario, baseUrl = 'http://localhost:3000', authCookie = null) {
  const fullUrl = `${baseUrl}${scenario.url}`;
  const headers = {};
  
  if (authCookie && scenario.requireAuth) {
    headers['Cookie'] = authCookie;
  }
  
  const startTime = performance.now();
  
  try {
    const response = await fetch(fullUrl, { headers });
    const endTime = performance.now();
    const ttfb = endTime - startTime;
    
    return {
      name: scenario.name,
      url: scenario.url,
      status: response.status,
      ttfb: Math.round(ttfb),
      maxTTFB: scenario.maxTTFB,
      passed: ttfb <= scenario.maxTTFB,
      requireAuth: scenario.requireAuth || false
    };
  } catch (error) {
    return {
      name: scenario.name,
      url: scenario.url,
      status: 'ERROR',
      ttfb: null,
      maxTTFB: scenario.maxTTFB,
      passed: false,
      error: error.message,
      requireAuth: scenario.requireAuth || false
    };
  }
}

/**
 * Run performance test suite
 */
async function runPerformanceTests(baseUrl = 'http://localhost:3000', authCookie = null) {
  console.log('🚀 Running Performance Tests\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Auth Cookie: ${authCookie ? 'Provided' : 'None'}\n`);
  
  const results = [];
  
  // Test page endpoints
  console.log('📄 Testing Page Endpoints:');
  for (const scenario of scenarios) {
    if (scenario.requireAuth && !authCookie) {
      console.log(`⏭️  Skipping ${scenario.name} (requires auth)`);
      continue;
    }
    
    const result = await measureEndpoint(scenario, baseUrl, authCookie);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    const authIndicator = result.requireAuth ? '🔒' : '🌐';
    console.log(`${status} ${authIndicator} ${result.name}: ${result.ttfb || 'ERROR'}ms (max: ${result.maxTTFB}ms)`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log('\n🔌 Testing API Endpoints:');
  for (const scenario of apiEndpoints) {
    if (scenario.requireAuth && !authCookie) {
      console.log(`⏭️  Skipping ${scenario.name} (requires auth)`);
      continue;
    }
    
    const result = await measureEndpoint(scenario, baseUrl, authCookie);
    results.push(result);
    
    const status = result.passed ? '✅' : '❌';
    const authIndicator = result.requireAuth ? '🔒' : '🌐';
    console.log(`${status} ${authIndicator} ${result.name}: ${result.ttfb || 'ERROR'}ms (max: ${result.maxTTFB}ms)`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log('\n📊 Performance Test Summary:');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(result => {
      console.log(`- ${result.name}: ${result.ttfb || 'ERROR'}ms (expected <${result.maxTTFB}ms)`);
    });
  }
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: Math.round((passedTests / totalTests) * 100),
    results
  };
}

// Export for use in test frameworks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPerformanceTests,
    measureEndpoint,
    scenarios,
    apiEndpoints
  };
}

// CLI usage
if (typeof process !== 'undefined' && process.argv) {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  const authCookie = args[1] || null;
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node performance-test.js [baseUrl] [authCookie]

Examples:
  node performance-test.js
  node performance-test.js http://localhost:3000
  node performance-test.js http://localhost:3000 "session_token=abc123"

Options:
  --help, -h     Show this help message
    `);
    process.exit(0);
  }
  
  // Run tests if script is executed directly
  runPerformanceTests(baseUrl, authCookie).then(summary => {
    process.exit(summary.failedTests > 0 ? 1 : 0);
  }).catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
}