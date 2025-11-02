# Auth Translation & Course Progression Implementation Plan

## Phase 1: Auth Translation (ACTIVE)

### ✅ Completed
- Mobile menu modernization with locale switcher
- Created `auth.content.ts` - consolidated auth translations
- Created `login-form.content.ts` - login form translations
- Created `login-page.content.ts` - login page translations  
- Created `register-form.content.ts` - register form translations

### 🔄 In Progress - Auth Component Updates

#### 1. Login Page & Form
- [ ] Update `login/page.tsx` - integrate `useIntlayer("login-page")`
- [ ] Update `login-form.tsx` - integrate `useIntlayer("login-form")`
- [ ] Update Zod validation messages to use translations
- [ ] Update toast notifications to use translations

#### 2. Register Page & Form  
- [ ] Update `register/page.tsx` - integrate `useIntlayer("auth")` 
- [ ] Update `register-form.tsx` - integrate `useIntlayer("register-form")`
- [ ] **Add callbackUrl prop to form**
- [ ] **Preserve callbackUrl in sessionStorage for social logins**
- [ ] Update Zod validation messages
- [ ] Update toast notifications

#### 3. Other Auth Pages
- [ ] Update `verify/page.tsx` - use `useIntlayer("auth").verify`
- [ ] Update `forgot-password/page.tsx` - use `useIntlayer("auth").forgotPassword`
- [ ] Update `reset-password/page.tsx` - use `useIntlayer("auth").resetPassword`
- [ ] Update `callback/page.tsx` - use `useIntlayer("auth").callback`
- [ ] Update `error/page.tsx` - use `useIntlayer("auth").error`

#### 4. Testing
- [ ] Test all auth flows in EN/FR/ES
- [ ] Test callbackUrl preservation through login flow
- [ ] Test callbackUrl preservation through register flow
- [ ] Test social login callbackUrl with sessionStorage

## Phase 2: Course Progression Redesign

### Database Schema Updates
```prisma
model FinalExam {
  id          String   @id @default(cuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  title       String
  description String?
  passingScore Int     @default(70) // Percentage needed to pass
  timeLimit   Int?    // Minutes (optional)
  questions   Json    // Array of question objects
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  results     ExamResult[]

  @@index([courseId])
}

model ExamResult {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  examId      String
  exam        FinalExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  score       Int
  total       Int
  percentage  Float
  passed      Boolean
  answers     Json     // User's answers
  completedAt DateTime @default(now())

  @@unique([userId, examId])
  @@index([userId])
  @@index([examId])
}
```

### Completion Calculation Logic
```typescript
// lib/course-completion.service.ts
async function calculateCourseCompletion(userId: string, courseId: string) {
  // Get course structure
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: true,
          quizzes: true,
        },
      },
      finalExam: true,
    },
  });

  // Count totals
  const totalLessons = course.modules.flatMap(m => m.lessons).length;
  const totalQuizzes = course.modules.flatMap(m => m.quizzes).length;
  const hasFinalExam = !!course.finalExam;

  // Get user progress
  const completedLessons = await prisma.progress.count({
    where: { userId, completed: true, lesson: { courseId } },
  });

  const passedQuizzes = await prisma.quizResult.count({
    where: { 
      userId, 
      quiz: { module: { courseId } },
      percentage: { gte: 70 }, // Passing score
    },
  });

  const examResult = hasFinalExam
    ? await prisma.examResult.findFirst({
        where: { userId, exam: { courseId }, passed: true },
      })
    : null;

  // Calculate weighted completion
  const lessonWeight = 0.333;
  const quizWeight = 0.333;
  const examWeight = 0.334;

  const lessonCompletion = totalLessons > 0 ? (completedLessons / totalLessons) : 0;
  const quizCompletion = totalQuizzes > 0 ? (passedQuizzes / totalQuizzes) : 0;
  const examCompletion = hasFinalExam ? (examResult ? 1 : 0) : 1; // If no exam, consider complete

  const totalCompletion = 
    lessonCompletion * lessonWeight +
    quizCompletion * quizWeight +
    examCompletion * examWeight;

  return {
    percentage: Math.round(totalCompletion * 100),
    lessons: { completed: completedLessons, total: totalLessons },
    quizzes: { passed: passedQuizzes, total: totalQuizzes },
    exam: { passed: !!examResult, required: hasFinalExam },
    isComplete: totalCompletion >= 1,
  };
}
```

### Certificate Eligibility Update
```typescript
// lib/certificate-service.ts
async checkCertificateEligibility(userId: string, courseId: string) {
  const completion = await calculateCourseCompletion(userId, courseId);
  
  return {
    eligible: completion.isComplete,
    completion: completion.percentage,
    requirements: {
      lessons: completion.lessons.completed === completion.lessons.total,
      quizzes: completion.quizzes.passed === completion.quizzes.total,
      exam: !completion.exam.required || completion.exam.passed,
    },
  };
}
```

### Certificate Auto-Generation Triggers

#### 1. Lesson Completion (EXISTS - needs enhancement)
```typescript
// hooks/use-lesson-progress.ts (lines 75-106)
// Keep existing logic, enhance certificate check
```

#### 2. Quiz Completion (NEW)
```typescript
// hooks/use-quiz-completion.ts (NEW FILE)
export function useQuizCompletion() {
  const checkCertificate = async (courseId: string) => {
    const response = await fetch(`/api/progress/summary?courseId=${courseId}`);
    const data = await response.json();
    
    if (data.justEarnedCertificate) {
      toast.success("Congratulations! You've earned a certificate!");
    }
  };
  
  return { checkCertificate };
}
```

#### 3. Exam Completion (NEW)
```typescript
// hooks/use-exam-completion.ts (NEW FILE)
export function useExamCompletion() {
  const checkCertificate = async (courseId: string) => {
    const response = await fetch(`/api/progress/summary?courseId=${courseId}`);
    const data = await response.json();
    
    if (data.justEarnedCertificate) {
      toast.success("Congratulations! You've earned a certificate!");
      // Auto-redirect to certificate page
      router.push(`/dashboard/certificates?courseId=${courseId}`);
    }
  };
  
  return { checkCertificate };
}
```

### API Updates
- [ ] Create `/api/courses/[courseId]/completion` - comprehensive progress endpoint
- [ ] Update `/api/progress/summary` - use new completion calculation
- [ ] Create `/api/exams/[examId]/submit` - exam submission endpoint
- [ ] Update certificate issuance to check all 3 components

## Phase 3: Testing & Validation

### Auth Testing
- [ ] E2E test: Login → Protected page with callbackUrl
- [ ] E2E test: Register → Verify → Protected page with callbackUrl
- [ ] E2E test: Social login with callbackUrl preservation
- [ ] E2E test: Password reset flow
- [ ] Unit test: Middleware callbackUrl encoding/decoding

### Course Progression Testing
- [ ] Unit test: Completion calculation with all components
- [ ] Unit test: Certificate eligibility with partial completion
- [ ] E2E test: Complete course → Auto-certificate generation
- [ ] E2E test: Quiz completion → Certificate check
- [ ] E2E test: Exam completion → Certificate generation + redirect

## Implementation Order

1. **Auth Translation** (Immediate - 2-3 hours)
   - Update all auth pages with useIntlayer
   - Add callbackUrl to register flow
   - Rebuild intlayer dictionaries
   - Test all flows in 3 languages

2. **Database Schema** (1 hour)
   - Add FinalExam and ExamResult models
   - Create and run migration
   - Update Prisma client

3. **Course Completion Logic** (2-3 hours)
   - Create course-completion.service.ts
   - Update CertificateService
   - Create quiz/exam completion hooks
   - Update Progress API

4. **Final Exam UI** (3-4 hours)
   - Create exam taking interface
   - Create exam results page
   - Add exam admin panel
   - Integrate with course dashboard

5. **Testing & Polish** (2-3 hours)
   - Write E2E tests
   - Manual testing all flows
   - Fix any bugs
   - Performance optimization

## Anti-Patterns to Avoid
- ❌ Don't create duplicate translation keys
- ❌ Don't bypass existing CertificateService transaction logic
- ❌ Don't calculate completion in multiple places
- ❌ Don't hardcode passing scores (make configurable)
- ❌ Don't forget to revalidate paths after state changes

## Quality Checklist
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All translations in 3 languages
- [ ] All callbackUrls preserved correctly
- [ ] Certificate auto-generation works for all triggers
- [ ] Database transactions used for certificate issuance
- [ ] Proper error handling and user feedback
- [ ] Code follows project architecture patterns
