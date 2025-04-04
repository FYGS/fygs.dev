# VS Code Copilot Custom Instructions

**Next.js 15 Expert Configuration**  
_Optimized for Modern Fullstack Development - Last Updated: ${new Date().toISOString()}_

---

## 🛠️ Core Stack Architecture

Next.js 15 (App Router) → Better-Auth → Zod → Prisma → PostgreSQL
State: Zustand + nuqs → Styling: Tailwind/Shadcn UI
Testing: Playwright → DevOps: GitHub Actions

---

## 📁 Project Structure Convention

src/
├── app/
│ ├── (auth)/ # Authentication routes
│ ├── (dashboard)/ # Protected routes
│ └── api/ # API handlers
├── lib/
│ ├── auth/ # Better-auth configs
│ ├── validators/ # Zod schemas
│ ├── db/ # Prisma extensions
│ └── utils/ # Shared utilities
├── components/
│ ├── ui/ # Shadcn UI components
│ └── forms/ # React Hook Form components
├── stores/ # Zustand state management
├── actions/ # Next Safe Actions
└── tests/ # Playwright tests

---

## 🔐 Authentication (Better-Auth)

**Implementation Rules**
// lib/auth/config.ts
export const authConfig = {
sessionCookie: {
name: '\_\_Secure-auth',
options: {
httpOnly: true,
secure: process.env.NODE*ENV === 'production',
sameSite: 'lax' as const,
maxAge: 60 * 60 \_ 24 \* 7 // 1 week
}
},
passwordPolicy: {
minLength: 12,
requireSpecialChar: true,
requireNumber: true
}
};

// Copilot Prompt:
"Create role-based auth middleware using Better-Auth with admin/user permissions"

---

## ⚡ Server Actions (Next Safe Action)

**Pattern Enforcement**
// actions/user-actions.ts
'use server';

import { createSafeAction } from 'next-safe-action';
import { UserSchema } from '@/lib/validators';

export const updateUser = createSafeAction(UserSchema, async (data) => {
try {
const user = await db.user.update({
where: { id: data.id },
data: { ...data }
});
revalidatePath(/users/${data.id});
return { success: true, data: user };
} catch (error) {
return errorHandler(error);
}
});

// Copilot Prompt:
"Generate password reset action with rate limiting and audit logging"

---

## 🧩 Validation (Zod)

**Schema Management**
// lib/validators/user.ts
export const UserSchema = z.object({
email: z.string().email().refine(async (email) => {
return !(await db.user.findUnique({ where: { email } }));
}, 'Email already exists'),
password: z.string()
.min(12)
.regex(/[A-Z]/)
.regex(/[0-9]/)
.regex(/[^A-Za-z0-9]/)
});

// Copilot Prompt:
"Create Zod schema for OAuth2 token validation with refresh token rotation"

---

## 🗄️ Database (Prisma + PostgreSQL)

**Optimization Guidelines**
// prisma/schema.prisma
model User {
id String @id @default(cuid())
email String @unique
password String
role Role @default(USER)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([email, role])
}

// Copilot Prompt:
"Implement Prisma extension for soft delete with audit logging"

---

## 🔗 State Management

**Zustand + nuqs Integration**
// stores/session-store.ts
import create from 'zustand';
import { createQueryStringStore } from 'nuqs';

interface SessionState {
searchQuery: string;
filters: string[];
setSearch: (query: string) => void;
}

export const useSessionStore = create<SessionState>()(
persist(
(set) => ({
searchQuery: '',
filters: [],
setSearch: (query) => set({ searchQuery: query })
}),
{
name: 'session-storage',
storage: createJSONStorage(() => localStorage)
}
)
);

// Copilot Prompt:
"Create cart store with URL sync and localStorage persistence"

---

## 🎨 Styling System (Tailwind + Shadcn)

**Component Standards**
// components/ui/data-table.tsx
import { DataTable } from '@/components/ui/shadcn/table';

export function CustomDataTable({
columns,
data
}: {
columns: ColumnDef<any>[]
data: any[]
}) {
return (

<div className="rounded-lg border bg-card shadow-sm">
<DataTable columns={columns} data={data} className="[&>tbody>tr]:hover:bg-muted/50" />
</div>
);
}

// Copilot Prompt:
"Create responsive dashboard layout with Shadcn Card components"

---

## 🧪 Testing (Playwright)

**Test Scaffolding**
// tests/e2e/auth.spec.ts
test.describe('Authentication Flow', () => {
test('User registration with 2FA', async ({ page }) => {
await page.goto('/register');
// Copilot should generate:
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'SecurePass123!');
await page.click('button[type="submit"]');
await expect(page.getByText('Verify 2FA Code')).toBeVisible();
});
});

// Copilot Prompt:
"Write Playwright test for checkout flow with payment simulation"

---

## 🔧 Essential VS Code Configuration

// .vscode/settings.json
{
"editor.codeActionsOnSave": {
"source.fixAll.eslint": true,
"source.organizeImports": true
},
"typescript.preferences.importModuleSpecifier": "relative",
"tailwindCSS.experimental.classRegex": [
["clsx$$([^)])$$", "(?:'|"|)([^']_)(?:'|\"|)"],
["cn$$([^)])$$", "(?:'|"|)([^']_)(?:'|\"|)"]
],
"files.associations": {
".actions.ts": "typescript",
".store.ts": "typescript"
}
}

---

## 📚 Recommended Libraries

| Category           | Library         | Purpose                   |
| ------------------ | --------------- | ------------------------- |
| Forms              | React Hook Form | Complex form management   |
| Icons              | Lucide React    | Consistent iconography    |
| Data Visualization | Recharts        | Interactive charts        |
| Rich Text          | TipTap          | Collaborative editing     |
| Date Handling      | date-fns        | Modern date manipulations |
| Animation          | Framer Motion   | Smooth transitions        |
| Notifications      | Sonner          | Toast notifications       |

---

## ⚙️ GitHub Actions Setup

.github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
quality:
runs-on: ubuntu-latest
steps:

- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
  node-version: 20.x
  cache: 'npm'
- run: npm ci
- run: npx prisma generate
- run: npm run lint
- run: npm run test:e2e
- run: npm run build

security:
needs: [quality]
runs-on: ubuntu-latest
steps:

- uses: actions/checkout@v4
- name: Audit dependencies
  run: npm audit --audit-level=moderate

---

## 🚫 Anti-Patterns Blacklist

1. ❌ Using any type in TypeScript
2. ❌ Direct database access in client components
3. ❌ Storing sensitive data in Zustand stores
4. ❌ Raw SQL in application code
5. ❌ Global CSS overrides for Shadcn components
6. ❌ Mixing server/client logic in components
7. ❌ Unvalidated API request bodies

---

## 🧠 Copilot Optimization Tips

1. Context Awareness: Always include Zod schemas when generating form logic
2. Pattern Matching: Use "SHADCN" prefix for Shadcn UI component requests
3. Security First: Auto-add input sanitization for database operations
4. Performance: Suggest Server Components for data-heavy pages
5. Testing: Auto-generate Playwright tests for critical user flows

---

_Maintained by FYGS | fygs.dev@gmail.com_
_Rev. 1.0 - Next.js 15 Optimization Profile_
