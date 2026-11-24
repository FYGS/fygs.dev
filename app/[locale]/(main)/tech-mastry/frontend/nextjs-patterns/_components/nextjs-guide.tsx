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
// ✅ fetch, db, fs, env secrets → Server

// Next.js 15+ : params et searchParams sont des Promises (Next.js 16 : l'accès synchrone est supprimé)
// app/blog/[slug]/page.tsx
export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  return <Post slug={slug} page={Number(page)} />;
}

// Dans un Client Component, utilisez use(params) pour lire la Promise`,
    keyPoints: [
      "Rendu côté serveur par défaut",
      "params et searchParams sont asynchrones (await)",
      "Turbopack est le bundler par défaut (dev et build) en Next.js 16",
      "React Compiler stable : reactCompiler: true (opt-in, non activé par défaut)",
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
  revalidatePath('/posts'); // Invalide le cache de la route
  redirect('/posts');
}

// Avec Cache Components : updateTag (Server Actions uniquement) expire
// immédiatement le tag, l'utilisateur voit ses propres écritures
// import { updateTag } from 'next/cache';
// updateTag('posts');

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
      "Revalidation explicite (updateTag / revalidatePath / revalidateTag)",
      "Progressive enhancement (fonctionne sans JS)",
      "Validation Zod intégrée",
    ],
  },
  {
    name: "Caching & Revalidation",
    code: `// ─── Cache Components (Next.js 16) ───
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true, // remplace experimental.ppr et experimental.dynamicIO
  partialPrefetching: true, // à définir explicitement avec cacheComponents (Next.js 16.4)
};
export default nextConfig;

// Avec Cache Components, tout est dynamique par défaut (rendu à la requête).
// Vous choisissez ce qui est mis en cache avec la directive 'use cache'.
// Les fonctions et composants concernés doivent être async.

// lib/posts.ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getPosts() {
  'use cache';
  cacheLife('hours');   // profil intégré : seconds, minutes, hours, days, weeks, max
  cacheTag('posts');    // étiquette pour l'invalidation à la demande
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}
// Sans cacheLife, le profil 'default' s'applique : stale 5 min (client),
// revalidate 15 min (serveur), pas d'expiration par le temps.

// Les données de requête (cookies(), headers(), searchParams) sont interdites
// DANS un scope 'use cache' : lisez-les à l'extérieur et passez la valeur
// en argument (elle fait alors partie de la clé de cache).

// Les parties dynamiques doivent être entourées de <Suspense> :
// le shell statique est servi immédiatement, le reste est streamé.
// C'est ce que fait Cache Components : il remplace le flag expérimental PPR.

// ─── Invalidation à la demande (app/actions.ts) ───
'use server';
import { updateTag, revalidateTag, revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.post.create({ data: parse(formData) });
  updateTag('posts'); // Server Actions uniquement : expire tout de suite (read-your-own-writes)
}

// Route Handler / webhook (app/api/webhook/route.ts) : stale-while-revalidate
// (le 2e argument, profil cacheLife, est requis en Next.js 16)
// export async function POST() {
//   revalidateTag('posts', 'max');
//   return Response.json({ revalidated: true });
// }

// ─── Sans Cache Components (fetch classique) ───
// Depuis Next.js 15, fetch n'est plus mis en cache par défaut
await fetch(url, { cache: 'force-cache' });                 // mis en cache
await fetch(url, { next: { revalidate: 3600 } });           // revalidé toutes les heures
await fetch(url, { next: { tags: ['posts'] } });            // avec tag
// revalidatePath('/blog') invalide une route entière

// Note : avec cacheComponents, les options de segment de route
// (export const dynamic / revalidate / fetchCache) provoquent une erreur :
// remplacez-les par 'use cache' + cacheLife. Le fetch classique reste
// utilisable ; dans un scope 'use cache', les fetch sont mis en cache.`,
    keyPoints: [
      "Cache Components : cacheComponents: true dans next.config",
      "'use cache' + cacheLife + cacheTag (Next.js 16, stable)",
      "Dynamique par défaut, cache opt-in : remplace le PPR expérimental",
      "updateTag (Server Actions) vs revalidateTag(tag, profil) vs revalidatePath",
      "Pas de cookies()/headers() dans un scope 'use cache'",
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
      "Avec Cache Components : cookies(), headers(), searchParams hors Suspense signalés",
    ],
  },
  {
    name: "Proxy & config Next.js 16",
    code: `// proxy.ts (à la racine, au niveau de app/)
// Next.js 16 : le fichier middleware.ts est déprécié et renommé proxy.ts,
// la fonction exportée s'appelle proxy. Codemod :
//   npx @next/codemod@canary middleware-to-proxy .
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Sans matcher, le proxy s'exécute sur TOUTES les requêtes
  // (y compris _next/static et _next/image) : excluez-les
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// ⚠️ Runtime : Node.js uniquement (le runtime edge n'est pas supporté dans proxy.ts,
// l'option runtime y est refusée ; gardez middleware.ts si vous avez besoin d'edge).
// ⚠️ Un proxy est une première barrière : vérifiez aussi l'authentification
// dans chaque Server Action / route (les Server Functions sont des requêtes POST
// vers la route où elles sont utilisées).

// ─── Autres défauts de Next.js 16 ───
// • Turbopack : bundler par défaut pour next dev ET next build
//   (--webpack pour revenir à Webpack)
// • React Compiler : stable, activez-le avec reactCompiler: true
//   (+ babel-plugin-react-compiler) ; non activé par défaut
// • params / searchParams / cookies() / headers() : accès asynchrone uniquement
// • next/image : minimumCacheTTL par défaut 4 h (14400 s, au lieu de 60 s),
//   qualities par défaut [75], imageSizes sans 16, IP locales bloquées,
//   maximumRedirects: 3 ; images.domains est déprécié -> remotePatterns
// • next lint supprimé : utilisez ESLint ou Biome directement
// • Node.js 20.9+ et TypeScript 5.1+ requis`,
    keyPoints: [
      "middleware.ts renommé proxy.ts (runtime Node.js)",
      "Fonction exportée : proxy(request)",
      "Toujours définir un matcher",
      "Turbopack par défaut, React Compiler stable (opt-in)",
      "next/image : nouveaux défauts (TTL 4 h, qualities [75])",
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
