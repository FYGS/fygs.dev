# Next.js 15.2+ Expert Configuration

_Modern Fullstack Development Guidelines - Last Updated: 2024_

## 🏗️ Architecture Foundations

```typescript
// Core Technology Stack
const stack = {
  framework: "Next.js 15.2+",
  auth: "Better-Auth w/JWT",
  validation: "Zod",
  database: {
    orm: "Prisma",
    type: "PostgreSQL",
    extensions: ["pgvector", "timescaledb"],
  },
  state: {
    client: "Zustand",
    server: "React Server Components",
    url: "nuqs",
  },
  styling: {
    core: "Tailwind CSS",
    components: "shadcn/ui",
    animations: "Framer Motion",
  },
  testing: {
    e2e: "Playwright",
    component: "Vitest",
    api: "MSW",
  },
};
```

## 📁 Project Organization

```
src/
├── app/
│   ├── (auth)/        # Auth routes (login, register, etc.)
│   ├── (marketing)/   # Public marketing pages
│   ├── (dashboard)/   # Protected app routes
│   ├── api/           # Route handlers
│   └── sitemap.ts     # Auto-generated sitemap
├── lib/
│   ├── auth/         # Auth config & middlewares
│   ├── db/          # Prisma client & extensions
│   ├── validators/  # Zod schemas
│   └── utils/      # Shared utilities
├── components/
│   ├── ui/         # Reusable UI components
│   ├── forms/      # Form components & hooks
│   └── providers/  # Context providers
├── hooks/          # Custom React hooks
├── stores/         # Zustand stores
├── styles/         # Global styles & themes
└── types/         # TypeScript declarations
```

## 🔒 Auth Pattern (Better-Auth)

```typescript
// Authentication Configuration
export const authConfig = {
  providers: ["credentials", "google", "github"],
  callbacks: {
    authorized: async ({ auth, request }) => {
      const user = auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      return isOnDashboard ? !!user : true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
};
```

## 🎯 Component Architecture

```tsx
// Pattern for Server Components
export default async function DashboardPage() {
  // Data fetching at the component level
  const data = await fetchDataFromDB();

  return (
    <Suspense fallback={<Loading />}>
      <Dashboard data={data} />
    </Suspense>
  );
}

// Pattern for Client Components
("use client");
export function InteractiveComponent() {
  // Client-side state & interactions
  const store = useStore();
  return <div>Interactive Content</div>;
}
```

## 🔄 State Management

```typescript
// Zustand Store Pattern
interface AppStore {
  data: Data[];
  status: "idle" | "loading" | "error";
  fetch: () => Promise<void>;
}

export const useAppStore = create<AppStore>()((set) => ({
  data: [],
  status: "idle",
  fetch: async () => {
    set({ status: "loading" });
    try {
      const data = await fetchData();
      set({ data, status: "idle" });
    } catch {
      set({ status: "error" });
    }
  },
}));
```

## 📊 Data Fetching Patterns

```typescript
// Server Action Pattern
'use server'
export async function updateData(input: FormData) {
  const validated = await schema.parseAsync(input)
  return prisma.$transaction(async (tx) => {
    const result = await tx.data.update(...)
    revalidatePath('/dashboard')
    return result
  })
}
```

## 🎨 UI Component Guidelines

```tsx
// Shadcn/UI Component Pattern
export function DataCard({ title, children, className }: DataCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border bg-card p-4",
        "hover:shadow-md transition-shadow",
        className
      )}
    >
      <CardHeader>{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

## 🧪 Testing Strategy

```typescript
// Playwright Test Pattern
test("user flow", async ({ page }) => {
  await test.step("login", async () => {
    await page.goto("/login");
    await page.fill("[name=email]", "test@example.com");
    await expect(page.locator("role=button")).toBeEnabled();
  });
});
```

## 🚨 Error Handling

```typescript
// Global Error Pattern
export function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 📝 Type Safety Guidelines

```typescript
// Type-Safe API Routes
import { z } from "zod";

export const runtime = "edge";

const schema = z.object({
  id: z.string().cuid(),
  data: z.record(z.unknown()),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = schema.parse(body);
  // Process validated data
}
```

## 🎭 Performance Optimizations

```typescript
// Image Optimization Pattern
export function OptimizedImage({ src, alt }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      placeholder="blur"
      loading="lazy"
      className="object-cover"
    />
  );
}
```

## 🚫 Anti-Patterns to Avoid

1. ❌ Direct DB queries in components
2. ❌ Client components in `layout.tsx`
3. ❌ Nested server/client components
4. ❌ Multiple data fetches for same data
5. ❌ Non-edge API routes by default
6. ❌ Inline styles or CSS-in-JS
7. ❌ Non-typed API responses

_Version: 2024.1 - Next.js 15.2+ Optimization Profile_
_Maintained by FYGS (fygs.dev@gmail.com)_
