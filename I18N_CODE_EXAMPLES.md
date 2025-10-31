# i18n Code Examples & Patterns

## 1. Server Components

### Basic Page Component
```tsx
// app/[locale]/(main)/about/page.tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";

const AboutContent = () => {
  const content = useIntlayer("about");
  
  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.description}</p>
    </div>
  );
};

const AboutPage: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  
  return (
    <IntlayerServerProvider locale={locale}>
      <AboutContent />
    </IntlayerServerProvider>
  );
};

export default AboutPage;
```

### With Data Fetching
```tsx
// app/[locale]/(main)/formations/page.tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";
import { db } from "@/lib/db";

const FormationsContent = ({ courses }: { courses: any[] }) => {
  const content = useIntlayer("formations");
  
  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
      <div className="grid gap-4">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

const FormationsPage: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;
  
  // Fetch data on server
  const courses = await db.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  
  return (
    <IntlayerServerProvider locale={locale}>
      <FormationsContent courses={courses} />
    </IntlayerServerProvider>
  );
};

export default FormationsPage;
```

## 2. Client Components

### Basic Client Component
```tsx
// components/forms/contact-form.tsx
'use client';

import { useIntlayer } from "next-intlayer";
import { useLocale } from "next-intlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ContactForm() {
  const content = useIntlayer("contact-form");
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form
    const response = await fetch(`/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    
    if (response.ok) {
      alert(content.successMessage);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>{content.title}</h2>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={content.emailPlaceholder}
      />
      <Button type="submit">{content.submitButton}</Button>
    </form>
  );
}
```

### With Navigation
```tsx
// components/navigation/main-nav.tsx
'use client';

import { useIntlayer } from "next-intlayer";
import { useLocale } from "next-intlayer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const content = useIntlayer("main-nav");
  const { locale } = useLocale();
  const pathname = usePathname();
  
  const links = [
    { href: `/${locale}/`, label: content.home },
    { href: `/${locale}/formations`, label: content.formations },
    { href: `/${locale}/blog`, label: content.blog },
    { href: `/${locale}/pricing`, label: content.pricing },
  ];
  
  return (
    <nav className="flex gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "hover:text-primary transition-colors",
            pathname === link.href && "text-primary font-semibold"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

## 3. Content Dictionary Files

### Basic Content
```typescript
// locale-content/about.content.ts
import { t, type Dictionary } from "intlayer";

const aboutContent = {
  key: "about",
  content: {
    title: t({
      fr: "À propos de nous",
      en: "About Us",
      es: "Sobre Nosotros",
    }),
    description: t({
      fr: "Nous sommes une plateforme d'apprentissage en ligne.",
      en: "We are an online learning platform.",
      es: "Somos una plataforma de aprendizaje en línea.",
    }),
  },
} satisfies Dictionary;

export default aboutContent;
```

### Complex Content with Arrays
```typescript
// locale-content/features.content.ts
import { t, type Dictionary } from "intlayer";

const featuresContent = {
  key: "features",
  content: {
    title: t({
      fr: "Nos fonctionnalités",
      en: "Our Features",
      es: "Nuestras características",
    }),
    items: [
      {
        title: t({
          fr: "Cours interactifs",
          en: "Interactive Courses",
          es: "Cursos interactivos",
        }),
        description: t({
          fr: "Apprenez avec des exercices pratiques",
          en: "Learn with practical exercises",
          es: "Aprende con ejercicios prácticos",
        }),
      },
      {
        title: t({
          fr: "Certificats",
          en: "Certificates",
          es: "Certificados",
        }),
        description: t({
          fr: "Obtenez des certifications reconnues",
          en: "Get recognized certifications",
          es: "Obtén certificaciones reconocidas",
        }),
      },
    ],
  },
} satisfies Dictionary;

export default featuresContent;
```

### With Dynamic Content
```typescript
// locale-content/pricing.content.ts
import { t, type Dictionary } from "intlayer";

const pricingContent = {
  key: "pricing",
  content: {
    title: t({
      fr: "Nos tarifs",
      en: "Our Pricing",
      es: "Nuestros precios",
    }),
    plans: {
      free: {
        name: t({
          fr: "Gratuit",
          en: "Free",
          es: "Gratis",
        }),
        price: t({
          fr: "0€/mois",
          en: "$0/month",
          es: "0€/mes",
        }),
        features: [
          t({
            fr: "Accès aux cours gratuits",
            en: "Access to free courses",
            es: "Acceso a cursos gratuitos",
          }),
          t({
            fr: "Support communautaire",
            en: "Community support",
            es: "Soporte comunitario",
          }),
        ],
      },
      premium: {
        name: t({
          fr: "Premium",
          en: "Premium",
          es: "Premium",
        }),
        price: t({
          fr: "29€/mois",
          en: "$29/month",
          es: "29€/mes",
        }),
        features: [
          t({
            fr: "Accès illimité à tous les cours",
            en: "Unlimited access to all courses",
            es: "Acceso ilimitado a todos los cursos",
          }),
          t({
            fr: "Support prioritaire",
            en: "Priority support",
            es: "Soporte prioritario",
          }),
          t({
            fr: "Certificats de complétion",
            en: "Completion certificates",
            es: "Certificados de finalización",
          }),
        ],
      },
    },
  },
} satisfies Dictionary;

export default pricingContent;
```

## 4. Server Actions with Locale

### Form Submission
```typescript
// app/actions/contact.ts
'use server';

import { z } from "zod";
import { redirect } from "next/navigation";

const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
  locale: z.enum(["fr", "en", "es"]),
});

export async function submitContact(formData: FormData) {
  const data = {
    email: formData.get("email"),
    message: formData.get("message"),
    locale: formData.get("locale"),
  };
  
  const validated = contactSchema.parse(data);
  
  // Save to database
  await db.contactMessage.create({
    data: validated,
  });
  
  // Redirect with locale
  redirect(`/${validated.locale}/contact/success`);
}
```

### Authentication Action
```typescript
// app/actions/auth.ts
'use server';

import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(["fr", "en", "es"]),
  callbackUrl: z.string().optional(),
});

export async function login(formData: FormData) {
  const data = loginSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    locale: formData.get("locale"),
    callbackUrl: formData.get("callbackUrl"),
  });
  
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });
  
  const redirectUrl = data.callbackUrl 
    ? decodeURIComponent(data.callbackUrl)
    : `/${data.locale}/dashboard`;
    
  redirect(redirectUrl);
}
```

## 5. Layouts with Locale

### Main Layout with Navigation
```tsx
// app/[locale]/(main)/layout.tsx
import { type NextLayoutIntlayer } from "next-intlayer";
import { MainNav } from "@/components/navigation/main-nav";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";

const MainLayout: NextLayoutIntlayer = async ({ children, params }) => {
  const { locale } = await params;
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <MainNav />
          <LocaleSwitcher />
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <p>© 2024 FYGS</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
```

## 6. Dynamic Routes with Locale

### Course Detail Page
```tsx
// app/[locale]/(main)/formations/[slug]/page.tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

const CourseDetailContent = ({ course }: { course: any }) => {
  const content = useIntlayer("course-detail");
  
  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <div>
        <strong>{content.level}:</strong> {course.level}
      </div>
      <div>
        <strong>{content.duration}:</strong> {course.duration}
      </div>
    </div>
  );
};

const CoursePage: NextPageIntlayer = async ({ params }) => {
  const { locale, slug } = await params;
  
  const course = await db.course.findUnique({
    where: { slug },
    include: { lessons: true },
  });
  
  if (!course) {
    notFound();
  }
  
  return (
    <IntlayerServerProvider locale={locale}>
      <CourseDetailContent course={course} />
    </IntlayerServerProvider>
  );
};

export default CoursePage;
```

## 7. Utility Functions Usage

### Adding Locale to Paths
```tsx
import { addLocaleToPath } from "@/lib/locale-utils";
import { useLocale } from "next-intlayer";

export function CourseCard({ course }: { course: any }) {
  const { locale } = useLocale();
  const courseUrl = addLocaleToPath(`/formations/${course.slug}`, locale);
  
  return (
    <Link href={courseUrl}>
      <h3>{course.title}</h3>
    </Link>
  );
}
```

### Removing Locale from Paths
```tsx
import { removeLocaleFromPath } from "@/lib/locale-utils";
import { usePathname } from "next/navigation";

export function BreadcrumbNav() {
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const segments = pathWithoutLocale.split("/").filter(Boolean);
  
  return (
    <nav>
      {segments.map((segment, index) => (
        <span key={index}>{segment}</span>
      ))}
    </nav>
  );
}
```

## 8. Metadata with Locale

### Static Metadata
```tsx
// app/[locale]/(main)/about/page.tsx
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - FYGS",
  description: "Learn more about our online learning platform",
  alternates: {
    languages: {
      fr: "/fr/about",
      en: "/en/about",
      es: "/es/about",
    },
  },
};
```

### Dynamic Metadata
```tsx
// app/[locale]/(main)/formations/[slug]/page.tsx
import { type Metadata } from "next";

export async function generateMetadata({ params }: { 
  params: Promise<{ locale: string; slug: string }> 
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const course = await db.course.findUnique({
    where: { slug },
  });
  
  if (!course) {
    return {
      title: "Course Not Found",
    };
  }
  
  return {
    title: course.title,
    description: course.description,
    alternates: {
      languages: {
        fr: `/fr/formations/${slug}`,
        en: `/en/formations/${slug}`,
        es: `/es/formations/${slug}`,
      },
    },
  };
}
```

## 9. Error Handling with Locale

### Not Found Page
```tsx
// app/[locale]/not-found.tsx
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";
import Link from "next/link";

const NotFoundContent = ({ locale }: { locale: string }) => {
  const content = useIntlayer("not-found");
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">{content.message}</p>
      <Link href={`/${locale}/`} className="mt-8 btn">
        {content.backHome}
      </Link>
    </div>
  );
};

export default async function NotFound() {
  // Try to get locale from URL, fallback to 'fr'
  const locale = "fr"; // You might want to extract this from headers
  
  return (
    <IntlayerServerProvider locale={locale}>
      <NotFoundContent locale={locale} />
    </IntlayerServerProvider>
  );
}
```

## 10. Testing Examples

### Unit Test with Locale
```typescript
// tests/utils/locale-utils.test.ts
import { describe, it, expect } from "vitest";
import { addLocaleToPath, removeLocaleFromPath, isValidLocale } from "@/lib/locale-utils";

describe("Locale Utils", () => {
  it("should add locale to path", () => {
    expect(addLocaleToPath("/dashboard", "fr")).toBe("/fr/dashboard");
    expect(addLocaleToPath("/dashboard", "en")).toBe("/en/dashboard");
  });
  
  it("should remove locale from path", () => {
    expect(removeLocaleFromPath("/fr/dashboard")).toBe("/dashboard");
    expect(removeLocaleFromPath("/en/profile")).toBe("/profile");
  });
  
  it("should validate locales", () => {
    expect(isValidLocale("fr")).toBe(true);
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("es")).toBe(true);
    expect(isValidLocale("de")).toBe(false);
  });
});
```

### E2E Test with Locale
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Locale Navigation", () => {
  test("should redirect to detected locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(fr|en|es)\//);
  });
  
  test("should navigate with locale", async ({ page }) => {
    await page.goto("/fr/");
    await page.click('a[href="/fr/formations"]');
    await expect(page).toHaveURL("/fr/formations");
  });
  
  test("should switch locales", async ({ page }) => {
    await page.goto("/fr/dashboard");
    await page.click('[data-testid="locale-switcher"]');
    await page.click('[data-locale="en"]');
    await expect(page).toHaveURL("/en/dashboard");
  });
});
```

---

These examples cover the most common use cases for working with i18n in your Next.js application.
Copy and adapt them to your specific needs!
