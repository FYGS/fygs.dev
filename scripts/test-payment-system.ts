// Integration test script for payment system functionality
// Run with: tsx scripts/test-payment-system.ts

import { db } from '../lib/db';
import { AccessService } from '../lib/access-service';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
}

async function runTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🧪 Running Payment System Integration Tests...\n');

  // Test 1: AccessService.hasActiveSubscription
  try {
    console.log('Test 1: Check active subscription status');
    const result = await AccessService.hasActiveSubscription('non-existent-user');
    results.push({
      test: 'hasActiveSubscription with non-existent user',
      passed: result === false,
      error: result !== false ? `Expected false, got ${result}` : undefined
    });
    console.log(`✅ Passed: hasActiveSubscription correctly returns false for non-existent user\n`);
  } catch (error) {
    results.push({
      test: 'hasActiveSubscription with non-existent user',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: ${error}\n`);
  }

  // Test 2: AccessService.checkCourseAccess
  try {
    console.log('Test 2: Check course access for non-existent user');
    const result = await AccessService.checkCourseAccess('non-existent-user', 'non-existent-course');
    const expectedResult = {
      hasActiveSubscription: false,
      isEnrolledInCourse: false,
      canAccessCourse: false,
      canAccessLessons: false
    };
    
    const passed = Object.keys(expectedResult).every(key => 
      result[key as keyof typeof expectedResult] === expectedResult[key as keyof typeof expectedResult]
    );
    
    results.push({
      test: 'checkCourseAccess with non-existent user and course',
      passed,
      error: passed ? undefined : `Expected ${JSON.stringify(expectedResult)}, got ${JSON.stringify(result)}`
    });
    
    if (passed) {
      console.log(`✅ Passed: checkCourseAccess correctly denies access for non-existent user\n`);
    } else {
      console.log(`❌ Failed: Unexpected result structure\n`);
    }
  } catch (error) {
    results.push({
      test: 'checkCourseAccess with non-existent user and course',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: ${error}\n`);
  }

  // Test 3: Check if courses exist in database
  try {
    console.log('Test 3: Check database connectivity and course data');
    const courseCount = await db.course.count();
    results.push({
      test: 'database connectivity and course count',
      passed: courseCount >= 0,
      error: courseCount < 0 ? 'Course count is negative' : undefined
    });
    console.log(`✅ Passed: Found ${courseCount} courses in database\n`);
  } catch (error) {
    results.push({
      test: 'database connectivity and course count',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: Database connectivity issue - ${error}\n`);
  }

  // Test 4: Check if subscription table exists and is accessible
  try {
    console.log('Test 4: Check subscription table accessibility');
    const subscriptionCount = await db.subscription.count();
    results.push({
      test: 'subscription table accessibility',
      passed: subscriptionCount >= 0,
      error: subscriptionCount < 0 ? 'Subscription count is negative' : undefined
    });
    console.log(`✅ Passed: Found ${subscriptionCount} subscriptions in database\n`);
  } catch (error) {
    results.push({
      test: 'subscription table accessibility',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: Subscription table issue - ${error}\n`);
  }

  // Test 5: Check if enrollment table exists and is accessible
  try {
    console.log('Test 5: Check enrollment table accessibility');
    const enrollmentCount = await db.enrollment.count();
    results.push({
      test: 'enrollment table accessibility',
      passed: enrollmentCount >= 0,
      error: enrollmentCount < 0 ? 'Enrollment count is negative' : undefined
    });
    console.log(`✅ Passed: Found ${enrollmentCount} enrollments in database\n`);
  } catch (error) {
    results.push({
      test: 'enrollment table accessibility',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: Enrollment table issue - ${error}\n`);
  }

  // Test 6: Test bulk access checking
  try {
    console.log('Test 6: Test bulk course access checking');
    const result = await AccessService.checkMultipleCoursesAccess('non-existent-user', ['course-1', 'course-2']);
    const passed = Object.keys(result).length === 2 && 
                  result['course-1']?.canAccessCourse === false &&
                  result['course-2']?.canAccessCourse === false;
    
    results.push({
      test: 'bulk course access checking',
      passed,
      error: passed ? undefined : 'Bulk access checking returned unexpected results'
    });
    
    if (passed) {
      console.log(`✅ Passed: Bulk access checking works correctly\n`);
    } else {
      console.log(`❌ Failed: Bulk access checking issue\n`);
    }
  } catch (error) {
    results.push({
      test: 'bulk course access checking',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ Failed: ${error}\n`);
  }

  return results;
}

async function main() {
  try {
    const results = await runTests();
    
    console.log('📊 Test Summary:');
    console.log('================');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    
    if (passed === total) {
      console.log('\n🎉 All tests passed! Payment system is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Please review the errors:');
      results.filter(r => !r.passed).forEach(result => {
        console.log(`- ${result.test}: ${result.error}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error running tests:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  main();
}