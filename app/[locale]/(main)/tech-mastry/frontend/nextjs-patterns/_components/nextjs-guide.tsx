"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useState } from "react";

const patterns = [
  {
    name: "Server Components",
    code: `// app/dashboard/page.tsx — Server Component (default)
import { Suspense } from 'react';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  // ✅ Accès direct à la DB (jamais envoyé au client)
  const stats = await db.analytics.getStats();
  const user = await db.user.getCurrent();
  
  return (
    <main>
      <h1>Bonjour {user.name}</h1>
      <StatsGrid stats={stats} />
      {/* Client Component imbriqué */}
      <Suspense fallback={<Skeleton />}>
        <InteractiveChart data={stats.chartData} />
      </Suspense>
    </main>
  );
}

// Règle d'or : Server par défaut, Client seulement quand nécessaire
// ❌ useState, useEffect, onClick → Client
// ✅ fetch, db, fs, env secrets → Server`,
    keyPoints: [
      "Rendu côté serveur par défaut",
      "Accès direct DB/API/env",
      "Pas de JS envoyé au client",
      "Suspense pour le streaming",
    ],
  },
  {
    name: "Server Actions",
    code: `// app/actions.ts
'use server'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreatePostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
});

export async function createPost(formData: FormData) {
  const validated = CreatePostSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  
  await db.post.create({ data: validated });
  revalidatePath('/posts'); // Invalide le cache
  redirect('/posts');
}

// Usage dans un formulaire
// <form action={createPost}>
//   <input name="title" />
//   <textarea name="content" />
//   <button type="submit">Publier</button>
// </form>

// Avec useActionState (React 19)
export async function updateProfile(prevState, formData) {
  try {
    const data = ProfileSchema.parse(Object.fromEntries(formData));
    await db.user.update({ data });
    return { success: true, message: 'Profil mis à jour' };
  } catch (error) {
    return { success: false, message: 'Erreur de validation' };
  }
}`,
    keyPoints: [
      "Mutations côté serveur type-safe",
      "Revalidation explicite (revalidatePath / revalidateTag)",
      "Progressive enhancement (fonctionne sans JS)",
      "Validation Zod intégrée",
    ],
  },
  {
    name: "Caching & Revalidation",
    code: `// Stratégies de cache Next.js

// 1. Static (build time) — à demander explicitement
// Depuis Next.js 15, fetch n'est plus mis en cache par défaut
async function getStaticData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache'
  });
  return res.json();
}

// 2. Time-based revalidation
async function getISRData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Revalider toutes les heures
  });
  return res.json();
}

// 3. On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache';

// Par path
export async function publishPost() {
  await db.post.publish();
  revalidatePath('/blog');
}

// Par tag
async function getTaggedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { tags: ['posts'] }
  });
  return res.json();
}

export async function updatePost() {
  await db.post.update();
  revalidateTag('posts', 'max'); // Invalide les fetches taguées (Next.js 16 : 2e argument = profil cacheLife)
}

// 4. No cache
async function getDynamicData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  return res.json();
}`,
    keyPoints: [
      "4 stratégies : Static (force-cache), ISR, On-demand, Dynamic (no-store)",
      "Depuis Next.js 15, fetch n'est plus mis en cache par défaut",
      "Tags pour invalidation granulaire",
      "revalidatePath vs revalidateTag",
      "Partial Prerendering (PPR) en expérimental",
    ],
  },
  {
    name: "Streaming & Suspense",
    code: `// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      
      {/* Contenu rapide — envoyé immédiatement */}
      <QuickStats />
      
      {/* Contenu lent — streamé progressivement */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <SlowDataTable />
      </Suspense>
    </main>
  );
}

// loading.tsx — Streaming automatique par route
export default function Loading() {
  return <DashboardSkeleton />;
}

// Parallel data fetching
async function ParallelPage() {
  // ✅ Fetch en parallèle
  const [users, posts, analytics] = await Promise.all([
    getUsers(),
    getPosts(),
    getAnalytics(),
  ]);
  
  return <Dashboard users={users} posts={posts} analytics={analytics} />;
}`,
    keyPoints: [
      "Streaming HTML progressif",
      "Suspense boundaries granulaires",
      "loading.tsx par segment de route",
      "Promise.all pour le parallélisme",
    ],
  },
];

export function NextjsGuide() {
  const [activePattern, setActivePattern] = useState(0);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2">
        {patterns.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActivePattern(i)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activePattern === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">{patterns[activePattern].name}</h2>
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto" tabIndex={0}>
          <code>{patterns[activePattern].code}</code>
        </pre>
        <div>
          <h4 className="font-semibold mb-2">Points clés</h4>
          <div className="flex flex-wrap gap-2">
            {patterns[activePattern].keyPoints.map((kp, i) => (
              <Badge key={i} variant="outline">
                {kp}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Server vs Client Decision Tree */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Server ou Client Component ?</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Besoin</th>
                <th className="p-3 text-left font-semibold text-blue-500">
                  Server
                </th>
                <th className="p-3 text-left font-semibold text-purple-500">
                  Client
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Fetch data</td>
                <td className="p-3">✅</td>
                <td className="p-3">⚠️ (useEffect)</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Accès DB/API directe</td>
                <td className="p-3">✅</td>
                <td className="p-3">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Secrets/env vars</td>
                <td className="p-3">✅</td>
                <td className="p-3">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Interactivité (onClick)</td>
                <td className="p-3">❌</td>
                <td className="p-3">✅</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">State (useState)</td>
                <td className="p-3">❌</td>
                <td className="p-3">✅</td>
              </tr>
              <tr className="border-b">
                <td className="p-3">Effects (useEffect)</td>
                <td className="p-3">❌</td>
                <td className="p-3">✅</td>
              </tr>
              <tr>
                <td className="p-3">Browser APIs</td>
                <td className="p-3">❌</td>
                <td className="p-3">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
