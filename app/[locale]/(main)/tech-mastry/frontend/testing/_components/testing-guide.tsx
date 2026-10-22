"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { useState } from "react";

const testTypes = [
  {
    name: "Tests Unitaires (Vitest)",
    description: "Tester des fonctions et modules isolés. Rapides et nombreux.",
    code: `import { describe, it, expect, vi } from 'vitest';
import { formatCurrency, validateEmail, fetchUser } from './utils';

describe('formatCurrency', () => {
  it('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats with custom locale', () => {
    // Intl insère des espaces insécables (U+202F, U+00A0) : on les normalise
    expect(formatCurrency(1234.56, 'fr-FR').replace(/\\s/g, ' ')).toBe('1 234,56 €');
  });
});

describe('validateEmail', () => {
  it.each([
    ['user@example.com', true],
    ['invalid-email', false],
    ['a@b.c', false],
    ['user+tag@domain.co', true],
  ])('validates %s as %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});

// Mocking
describe('API service', () => {
  it('fetches user data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'John' }),
    });
    global.fetch = mockFetch;

    const user = await fetchUser('123');
    expect(user.name).toBe('John');
    expect(mockFetch).toHaveBeenCalledWith('/api/users/123');
  });
});`,
  },
  {
    name: "Tests de Composants (Testing Library)",
    description:
      "Tester les composants React comme l'utilisateur les voit et interagit.",
    code: `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders form fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connexion/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    expect(await screen.findByText(/email requis/i)).toBeInTheDocument();
    expect(screen.getByText(/mot de passe requis/i)).toBeInTheDocument();
  });

  it('calls onSubmit with valid data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('disables button while submitting', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={() => new Promise(r => setTimeout(r, 1000))} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});`,
  },
  {
    name: "Tests E2E (Playwright)",
    description:
      "Tester les parcours utilisateur complets dans un vrai navigateur.",
    code: `import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByRole('button', { name: 'Connexion' }).click();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Bienvenue')).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Mot de passe').fill('wrong');
    await page.getByRole('button', { name: 'Connexion' }).click();
    
    await expect(page.getByText(/identifiants invalides/i)).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Search Feature', () => {
  test('finds and displays results', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder('Rechercher...');
    await searchInput.fill('React');
    
    // Wait for results
    const results = page.getByTestId('search-results');
    await expect(results).toBeVisible();
    await expect(results.getByRole('link').first()).toBeVisible();
    
    // Click first result
    await results.getByRole('link').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('React');
  });
});`,
  },
  {
    name: "Hooks Testing",
    description: "Tester les custom hooks React de manière isolée.",
    code: `import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';
import { useDebounce } from './useDebounce';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments and decrements', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => result.current.increment());
    expect(result.current.count).toBe(11);
    
    act(() => result.current.decrement());
    expect(result.current.count).toBe(10);
  });

  it('respects min and max bounds', () => {
    const { result } = renderHook(() =>
      useCounter(5, { min: 0, max: 10 })
    );
    
    act(() => { for (let i = 0; i < 20; i++) result.current.increment(); });
    expect(result.current.count).toBe(10);
  });
});

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Not yet updated
    
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('updated'); // Now updated
  });
});`,
  },
];

const pyramid = [
  {
    name: "E2E",
    pct: 10,
    color: "bg-red-500",
    desc: "Peu, lents, parcours critiques",
  },
  {
    name: "Intégration",
    pct: 30,
    color: "bg-yellow-500",
    desc: "Composants + services",
  },
  {
    name: "Unitaires",
    pct: 60,
    color: "bg-green-500",
    desc: "Nombreux, rapides, isolés",
  },
];

export function TestingGuide() {
  const [activeTest, setActiveTest] = useState(0);

  return (
    <div className="space-y-12">
      {/* Testing Pyramid */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Pyramide des Tests</h2>
        <div className="flex flex-col items-center gap-2 py-4">
          {pyramid.map((level, i) => (
            <div
              key={level.name}
              className="flex items-center gap-4"
              style={{ width: `${40 + i * 30}%` }}
            >
              <div
                className={cn(
                  "h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium w-full",
                  level.color,
                )}
              >
                {level.name} (~{level.pct}%)
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {level.desc}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Test Type Selector */}
      <div className="flex flex-wrap gap-2">
        {testTypes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTest(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTest === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{testTypes[activeTest].name}</h2>
          <p className="text-muted-foreground">
            {testTypes[activeTest].description}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary" />
            Exemple
          </h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
            <code>{testTypes[activeTest].code}</code>
          </pre>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-3">Best Practices</h3>
        <ul className="space-y-2">
          {[
            "Testez le comportement, pas l'implémentation (Testing Library)",
            "Un test = un scénario. Pas de logique dans les tests.",
            "Nommez vos tests comme des phrases : 'should display error when email is invalid'",
            "Moquez les dépendances externes (API, localStorage), jamais la logique interne",
            "Utilisez data-testid en dernier recours — préférez les rôles ARIA et les labels",
          ].map((tip, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
