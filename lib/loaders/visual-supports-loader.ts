/**
 * This loader generates sample visual supports for courses that don't have them yet
 * It creates interactive slides similar to the example provided in the user's request
 */
export function generateSampleVisualSupports(
  courseTitle: string,
  courseSlug: string
): any[] {
  // If this is a Next.js course, we could generate sample content based on the example
  if (
    courseTitle.toLowerCase().includes("next") ||
    courseSlug.toLowerCase().includes("next")
  ) {
    return [
      {
        id: "vs-1",
        moduleId: 1,
        title: "Module 1 : Fondations & Écosystème",
        order: 1,
        content: {
          slides: [
            {
              title: "L'Évolution du Rendu Web",
              content: `
                <div class="space-y-6">
                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <h4 class="font-bold text-red-700 mb-2">CSR - Client Side</h4>
                      <div class="text-sm space-y-2">
                        <p class="font-semibold">📦 Bundle JS lourd</p>
                        <p>❌ SEO difficile</p>
                        <p>❌ First Paint lent</p>
                        <p>✅ Interactivité rapide</p>
                      </div>
                    </div>
                    <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                      <h4 class="font-bold text-blue-700 mb-2">SSR - Server Side</h4>
                      <div class="text-sm space-y-2">
                        <p>✅ SEO optimal</p>
                        <p>✅ First Paint rapide</p>
                        <p>⚠️ Charge serveur</p>
                        <p>⚠️ TTFB variable</p>
                      </div>
                    </div>
                    <div class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <h4 class="font-bold text-green-700 mb-2">SSG - Static</h4>
                      <div class="text-sm space-y-2">
                        <p>✅ Performance max</p>
                        <p>✅ SEO parfait</p>
                        <p>✅ Coût minimal</p>
                        <p>❌ Contenu figé</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-6">
                    <h4 class="font-bold text-purple-900 text-lg mb-3">🚀 Next.js : Le Meilleur des 3 Mondes</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p class="font-semibold mb-1">✨ Hybride intelligent</p>
                        <p class="text-gray-700">Choisir la stratégie par page</p>
                      </div>
                      <div>
                        <p class="font-semibold mb-1">⚡ ISR - Incremental</p>
                        <p class="text-gray-700">Static + mise à jour auto</p>
                      </div>
                      <div>
                        <p class="font-semibold mb-1">🔄 Streaming SSR</p>
                        <p class="text-gray-700">Rendu progressif</p>
                      </div>
                      <div>
                        <p class="font-semibold mb-1">🌐 Edge Runtime</p>
                        <p class="text-gray-700">Latence ultra-faible</p>
                      </div>
                    </div>
                  </div>
                </div>
              `,
            },
            {
              title: "Architecture Next.js App Router",
              content: `
                <div class="space-y-4">
                  <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div class="mb-2 text-white">📁 Structure de projet moderne</div>
                    <div class="ml-4 space-y-1">
                      <div>├── app/</div>
                      <div class="ml-4">
                        <div>├── layout.tsx <span class="text-gray-500"># Layout racine</span></div>
                        <div>├── page.tsx <span class="text-gray-500"># Page d'accueil</span></div>
                        <div>├── loading.tsx <span class="text-gray-500"># État de chargement</span></div>
                        <div>├── error.tsx <span class="text-gray-500"># Gestion d'erreurs</span></div>
                        <div>├── (marketing)/ <span class="text-gray-500"># Route Group</span></div>
                        <div class="ml-4">└── about/page.tsx</div>
                        <div>└── dashboard/</div>
                        <div class="ml-4">
                          <div>├── @sidebar/page.tsx <span class="text-gray-500"># Parallel Route</span></div>
                          <div>└── layout.tsx</div>
                        </div>
                      </div>
                      <div>├── components/</div>
                      <div>├── lib/</div>
                      <div>└── public/</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <h5 class="font-bold text-blue-900 mb-2">Server Components 🖥️</h5>
                      <ul class="text-sm space-y-1 text-gray-700">
                        <li>• Par défaut dans app/</li>
                        <li>• Accès direct à la BDD</li>
                        <li>• Pas de bundle client</li>
                        <li>• Pas d'interactivité</li>
                      </ul>
                    </div>
                    <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <h5 class="font-bold text-yellow-900 mb-2">Client Components 💻</h5>
                      <ul class="text-sm space-y-1 text-gray-700">
                        <li>• Directive "use client"</li>
                        <li>• Hooks React (useState...)</li>
                        <li>• Event handlers</li>
                        <li>• Browser APIs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              `,
            },
          ],
        },
      },
      {
        id: "vs-2",
        moduleId: 2,
        title: "Module 2 : App Router Avancé",
        order: 2,
        content: {
          slides: [
            {
              title: "Routing Patterns Avancés",
              content: `
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                      <h4 class="font-bold text-purple-800 mb-3">Routes Dynamiques</h4>
                      <div class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-2">
                        <div>[id]/page.tsx</div>
                        <div class="text-gray-500">/products/123</div>
                      </div>
                      <div class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                        <div>[...slug]/page.tsx</div>
                        <div class="text-gray-500">/blog/2024/01/post</div>
                      </div>
                    </div>
                    <div class="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4">
                      <h4 class="font-bold text-indigo-800 mb-3">Parallel Routes</h4>
                      <div class="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono mb-2">
                        <div>@team/page.tsx</div>
                        <div>@analytics/page.tsx</div>
                        <div class="text-gray-500 mt-1">// Rendus simultanément</div>
                      </div>
                      <p class="text-xs text-gray-600 mt-2">Dashboards complexes, modales</p>
                    </div>
                  </div>
                  <div class="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-400 rounded-lg p-5">
                    <h4 class="font-bold text-cyan-900 text-lg mb-3">Intercepting Routes - Modales Natives</h4>
                    <div class="grid grid-cols-3 gap-3 text-sm">
                      <div class="bg-white p-3 rounded shadow">
                        <p class="font-mono text-xs text-purple-600 mb-1">(.)segment</p>
                        <p class="text-gray-600">Même niveau</p>
                      </div>
                      <div class="bg-white p-3 rounded shadow">
                        <p class="font-mono text-xs text-purple-600 mb-1">(..)segment</p>
                        <p class="text-gray-600">Niveau parent</p>
                      </div>
                      <div class="bg-white p-3 rounded shadow">
                        <p class="font-mono text-xs text-purple-600 mb-1">(...)segment</p>
                        <p class="text-gray-600">Depuis racine</p>
                      </div>
                    </div>
                  </div>
                </div>
              `,
            },
          ],
        },
      },
    ];
  }

  return [];
}

/**
 * Generates sample quiz data for courses that don't have them yet
 */
export function generateSampleQuizzes(
  courseTitle: string,
  courseSlug: string
): any[] {
  // If this is a Next.js course, we could generate sample quiz content
  if (
    courseTitle.toLowerCase().includes("next") ||
    courseSlug.toLowerCase().includes("next")
  ) {
    return [
      {
        id: "quiz-1",
        moduleId: 1,
        title: "Module 1 : Fondations & Écosystème",
        questions: [
          {
            id: "q1",
            question:
              "Quelle est la principale innovation de Next.js par rapport à Create React App ?",
            options: [
              "Support natif de TypeScript",
              "Rendu hybride (SSR, SSG, CSR) selon les besoins",
              "Meilleure gestion du CSS",
              "Plus rapide à installer",
            ],
            correct: 1,
            explanation:
              "Next.js permet de choisir la stratégie de rendu (SSR, SSG, ISR, CSR) page par page, offrant ainsi flexibilité et performance optimale selon les besoins.",
            order: 1,
          },
          {
            id: "q2",
            question:
              "Dans l'App Router de Next.js, quel est le comportement par défaut des composants ?",
            options: [
              "Ce sont des Client Components",
              "Ce sont des Server Components",
              "Cela dépend de l'extension du fichier",
              "Il faut toujours spécifier explicitement",
            ],
            correct: 1,
            explanation:
              "Par défaut, tous les composants dans l'App Router sont des Server Components. Il faut utiliser la directive 'use client' pour créer un Client Component.",
            order: 2,
          },
          {
            id: "q3",
            question: "Qu'est-ce que l'ISR (Incremental Static Regeneration) ?",
            options: [
              "Une méthode pour optimiser les images",
              "Une stratégie pour mettre à jour les pages statiques après le build",
              "Un système de routing avancé",
              "Un outil de test automatisé",
            ],
            correct: 1,
            explanation:
              "L'ISR permet de régénérer des pages statiques après le déploiement, combinant les avantages de la génération statique et du contenu dynamique.",
            order: 3,
          },
        ],
      },
      {
        id: "quiz-2",
        moduleId: 2,
        title: "Module 2 : App Router Avancé",
        questions: [
          {
            id: "q4",
            question:
              "Quelle syntaxe permet de créer une Parallel Route dans Next.js ?",
            options: [
              "parallel/route.tsx",
              "@slot/page.tsx",
              "(parallel)/page.tsx",
              "parallel-route.tsx",
            ],
            correct: 1,
            explanation:
              "Les Parallel Routes utilisent la convention @nom pour créer des slots qui peuvent être rendus simultanément dans un layout parent.",
            order: 1,
          },
          {
            id: "q5",
            question: "À quoi servent les Intercepting Routes ?",
            options: [
              "À bloquer l'accès à certaines routes",
              "À afficher du contenu en modal tout en préservant l'URL",
              "À rediriger automatiquement les utilisateurs",
              "À optimiser le chargement des pages",
            ],
            correct: 1,
            explanation:
              "Les Intercepting Routes permettent de capturer une navigation et d'afficher du contenu alternatif (comme une modal) tout en préservant l'URL de destination.",
            order: 2,
          },
        ],
      },
    ];
  }

  return [];
}
