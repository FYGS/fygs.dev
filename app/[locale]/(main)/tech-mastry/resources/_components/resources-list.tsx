"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ExternalLink,
  Filter,
  GraduationCap,
  Headphones,
  Monitor,
  Star,
  Trophy,
  Users,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { ResourceCard, type Resource } from "./resource-card";

type Category =
  | "all"
  | "books"
  | "courses"
  | "youtube"
  | "podcasts"
  | "practice"
  | "communities";

interface CategoryInfo {
  id: Category;
  label: string;
  icon: React.ElementType;
  color: string;
}

const categories: CategoryInfo[] = [
  { id: "all", label: "Toutes", icon: Filter, color: "text-foreground" },
  { id: "books", label: "Livres", icon: BookOpen, color: "text-blue-500" },
  { id: "courses", label: "Cours", icon: GraduationCap, color: "text-green-500" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
  { id: "podcasts", label: "Podcasts", icon: Headphones, color: "text-purple-500" },
  { id: "practice", label: "Pratique", icon: Trophy, color: "text-orange-500" },
  { id: "communities", label: "Communautés", icon: Users, color: "text-cyan-500" },
];

const resources: Record<Exclude<Category, "all">, Resource[]> = {
  books: [
    {
      title: "Cracking the Coding Interview",
      author: "Gayle Laakmann McDowell",
      description: "La référence pour la préparation aux entretiens techniques. 189 questions et solutions avec stratégies de résolution.",
      level: "Tous niveaux",
      tags: ["Entretiens", "Algorithmes", "Structures de données"],
      recommended: true,
    },
    {
      title: "System Design Interview",
      author: "Alex Xu",
      description: "Guide complet de conception de systèmes avec des études de cas détaillées de vraies architectures.",
      level: "Intermédiaire",
      tags: ["System Design", "Architecture", "Scalabilité"],
      recommended: true,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "Principes et pratiques pour écrire du code lisible, maintenable et professionnel.",
      level: "Intermédiaire",
      tags: ["Qualité de code", "Bonnes pratiques", "Refactoring"],
      recommended: true,
    },
    {
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      description: "Exploration approfondie des systèmes de données modernes : bases de données, streaming, batch processing.",
      level: "Avancé",
      tags: ["Bases de données", "Systèmes distribués", "Architecture"],
      recommended: true,
    },
    {
      title: "Clean Architecture",
      author: "Robert C. Martin",
      description: "Principes d'architecture logicielle pour créer des systèmes durables et maintenables.",
      level: "Avancé",
      tags: ["Architecture", "SOLID", "Design Patterns"],
    },
    {
      title: "Head First Design Patterns",
      author: "Eric Freeman & Elisabeth Robson",
      description: "Introduction visuelle et ludique aux design patterns les plus importants.",
      level: "Débutant",
      tags: ["Design Patterns", "OOP", "Java"],
    },
    {
      title: "Domain-Driven Design",
      author: "Eric Evans",
      description: "L'ouvrage fondateur du DDD : bounded contexts, aggregates, et modélisation du domaine.",
      level: "Avancé",
      tags: ["DDD", "Architecture", "Modélisation"],
    },
    {
      title: "The Pragmatic Programmer",
      author: "David Thomas & Andrew Hunt",
      description: "Conseils pratiques et philosophie pour devenir un développeur complet et efficace.",
      level: "Tous niveaux",
      tags: ["Carrière", "Bonnes pratiques", "Productivité"],
    },
    {
      title: "Refactoring",
      author: "Martin Fowler",
      description: "Techniques systématiques pour améliorer le code existant sans changer son comportement.",
      level: "Intermédiaire",
      tags: ["Refactoring", "Code Quality", "Patterns"],
    },
    {
      title: "Introduction to Algorithms (CLRS)",
      author: "Cormen, Leiserson, Rivest & Stein",
      description: "Le manuel de référence universitaire sur les algorithmes. Exhaustif et rigoureux.",
      level: "Avancé",
      tags: ["Algorithmes", "Mathématiques", "Référence"],
    },
  ],
  courses: [
    {
      title: "Grokking the System Design Interview",
      author: "Design Gurus",
      description: "Cours interactif de system design avec 25+ études de cas et diagrammes.",
      level: "Intermédiaire",
      url: "https://www.designgurus.io/course/grokking-the-system-design-interview",
      tags: ["System Design", "Entretiens", "Architecture"],
      recommended: true,
    },
    {
      title: "NeetCode Roadmap",
      author: "NeetCode",
      description: "Parcours structuré de 150 problèmes LeetCode essentiels avec explications vidéo.",
      level: "Tous niveaux",
      url: "https://neetcode.io/roadmap",
      tags: ["Algorithmes", "LeetCode", "Roadmap"],
      recommended: true,
    },
    {
      title: "Frontend Masters — Complete Intro to React",
      author: "Brian Holt",
      description: "Introduction complète à React par un ingénieur Microsoft/Netflix.",
      level: "Débutant",
      url: "https://frontendmasters.com/courses/complete-react-v8/",
      tags: ["React", "Frontend", "JavaScript"],
    },
    {
      title: "MIT OpenCourseWare — Introduction to Algorithms",
      author: "MIT",
      description: "Le cours d'algorithmes du MIT gratuit en ligne avec vidéos, notes et exercices.",
      level: "Avancé",
      url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
      tags: ["Algorithmes", "Université", "Gratuit"],
    },
    {
      title: "Josh Comeau — The Joy of React",
      author: "Josh W. Comeau",
      description: "Cours interactif et visuel pour maîtriser React en profondeur.",
      level: "Intermédiaire",
      url: "https://www.joyofreact.com/",
      tags: ["React", "Frontend", "Interactif"],
    },
  ],
  youtube: [
    {
      title: "Fireship",
      author: "Jeff Delaney",
      description: "Vidéos courtes et incisives couvrant les technologies modernes en 100 secondes.",
      level: "Tous niveaux",
      url: "https://www.youtube.com/@Fireship",
      tags: ["Web", "Technologies", "Tutoriels rapides"],
      recommended: true,
    },
    {
      title: "NeetCode",
      author: "NeetCode",
      description: "Explications détaillées des problèmes LeetCode avec approche systématique.",
      level: "Intermédiaire",
      url: "https://www.youtube.com/@NeetCode",
      tags: ["LeetCode", "Algorithmes", "Entretiens"],
      recommended: true,
    },
    {
      title: "Theo — t3.gg",
      author: "Theo Browne",
      description: "Opinions argumentées sur l'écosystème TypeScript/React et les tendances tech.",
      level: "Intermédiaire",
      url: "https://www.youtube.com/@t3dotgg",
      tags: ["TypeScript", "React", "Next.js"],
    },
    {
      title: "ByteByteGo",
      author: "Alex Xu",
      description: "Explications visuelles de concepts de system design et d'architecture.",
      level: "Intermédiaire",
      url: "https://www.youtube.com/@ByteByteGo",
      tags: ["System Design", "Architecture", "Visualisations"],
    },
    {
      title: "Hussein Nasser",
      author: "Hussein Nasser",
      description: "Deep dives sur les bases de données, le networking et l'architecture backend.",
      level: "Avancé",
      url: "https://www.youtube.com/@haboretechnologies",
      tags: ["Backend", "Databases", "Networking"],
    },
  ],
  podcasts: [
    {
      title: "Syntax.fm",
      author: "Wes Bos & Scott Tolinski",
      description: "Le podcast web development le plus populaire. CSS, JS, tooling et carrière.",
      level: "Tous niveaux",
      url: "https://syntax.fm/",
      tags: ["Web Dev", "JavaScript", "CSS"],
      recommended: true,
    },
    {
      title: "Software Engineering Daily",
      author: "SE Daily",
      description: "Interviews avec des ingénieurs de grandes entreprises tech sur l'architecture et les pratiques.",
      level: "Intermédiaire",
      url: "https://softwareengineeringdaily.com/",
      tags: ["Architecture", "Interviews", "Tech"],
    },
    {
      title: "The Changelog",
      author: "Changelog Media",
      description: "Conversations avec les créateurs et mainteneurs de l'open source.",
      level: "Tous niveaux",
      url: "https://changelog.com/podcast",
      tags: ["Open Source", "Tech", "Communauté"],
    },
  ],
  practice: [
    {
      title: "LeetCode",
      author: "LeetCode",
      description: "La plateforme de référence avec 2000+ problèmes, contests et discussions.",
      level: "Tous niveaux",
      url: "https://leetcode.com/",
      tags: ["Algorithmes", "Entretiens", "Compétitions"],
      recommended: true,
    },
    {
      title: "HackerRank",
      author: "HackerRank",
      description: "Challenges de programmation avec certifications et préparation aux entretiens.",
      level: "Tous niveaux",
      url: "https://www.hackerrank.com/",
      tags: ["Certification", "Algorithmique", "Multi-langages"],
    },
    {
      title: "Exercism",
      author: "Exercism",
      description: "Exercices de code gratuits avec mentorat dans 65+ langages de programmation.",
      level: "Débutant",
      url: "https://exercism.org/",
      tags: ["Mentorat", "Multi-langages", "Gratuit"],
    },
    {
      title: "Project Euler",
      author: "Project Euler",
      description: "Problèmes mathématiques nécessitant de la programmation. Parfait pour algorithmique avancée.",
      level: "Avancé",
      url: "https://projecteuler.net/",
      tags: ["Mathématiques", "Algorithmes", "Défis"],
    },
    {
      title: "CodeWars",
      author: "CodeWars",
      description: "Kata de programmation avec système de classement et communauté active.",
      level: "Intermédiaire",
      url: "https://www.codewars.com/",
      tags: ["Kata", "Communauté", "Multi-langages"],
    },
  ],
  communities: [
    {
      title: "Stack Overflow",
      author: "Stack Exchange",
      description: "La communauté Q&A la plus grande pour les développeurs. Indispensable.",
      level: "Tous niveaux",
      url: "https://stackoverflow.com/",
      tags: ["Q&A", "Communauté", "Support"],
    },
    {
      title: "Dev.to",
      author: "Forem",
      description: "Plateforme de blogging et communauté pour développeurs. Articles et discussions.",
      level: "Tous niveaux",
      url: "https://dev.to/",
      tags: ["Blog", "Communauté", "Articles"],
    },
    {
      title: "Discord — Reactiflux",
      author: "Reactiflux",
      description: "La plus grande communauté Discord pour React/JS avec aide en temps réel.",
      level: "Tous niveaux",
      url: "https://www.reactiflux.com/",
      tags: ["React", "Discord", "Entraide"],
    },
    {
      title: "GitHub Discussions",
      author: "GitHub",
      description: "Discussions sur les projets open source, RFC et contributions.",
      level: "Tous niveaux",
      url: "https://github.com/",
      tags: ["Open Source", "Collaboration", "Code"],
    },
  ],
};

type LevelFilter = "all" | "Débutant" | "Intermédiaire" | "Avancé" | "Tous niveaux";

const learningPaths = [
  {
    title: "Frontend Developer",
    icon: Monitor,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    steps: [
      "Head First Design Patterns",
      "The Joy of React (cours)",
      "Frontend Masters",
      "LeetCode Easy/Medium",
      "NeetCode Roadmap",
    ],
  },
  {
    title: "Backend Developer",
    icon: Monitor,
    color: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    steps: [
      "Clean Code",
      "Designing Data-Intensive Applications",
      "System Design Interview",
      "HackerRank Backend",
      "LeetCode Medium/Hard",
    ],
  },
  {
    title: "Fullstack Developer",
    icon: Monitor,
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    steps: [
      "The Pragmatic Programmer",
      "Clean Architecture",
      "System Design Interview",
      "NeetCode 150",
      "Cracking the Coding Interview",
    ],
  },
];

export function ResourcesList() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");

  const filteredResources =
    activeCategory === "all"
      ? Object.entries(resources).flatMap(([cat, items]) =>
          items.map((r) => ({ ...r, _category: cat }))
        )
      : resources[activeCategory].map((r) => ({
          ...r,
          _category: activeCategory,
        }));

  const displayedResources =
    levelFilter === "all"
      ? filteredResources
      : filteredResources.filter((r) => r.level === levelFilter);

  return (
    <div className="space-y-12">
      {/* Learning Paths */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Parcours recommandés
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPaths.map((pathItem) => (
            <Card
              key={pathItem.title}
              className={`p-6 space-y-4 bg-gradient-to-br ${pathItem.color} border`}
            >
              <h3 className="font-semibold text-lg">{pathItem.title}</h3>
              <ol className="space-y-2">
                {pathItem.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? "" : cat.color}`} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2">
          {(["all", "Débutant", "Intermédiaire", "Avancé", "Tous niveaux"] as LevelFilter[]).map(
            (level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  levelFilter === level
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {level === "all" ? "Tous niveaux" : level}
              </button>
            )
          )}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedResources.map((resource) => (
          <ResourceCard key={resource.title} resource={resource} />
        ))}
      </div>

      {displayedResources.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune ressource ne correspond aux filtres sélectionnés.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Livres", count: resources.books.length, icon: BookOpen },
          { label: "Cours", count: resources.courses.length, icon: GraduationCap },
          { label: "Sites de pratique", count: resources.practice.length, icon: Trophy },
          {
            label: "Total ressources",
            count: Object.values(resources).flat().length,
            icon: Star,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-4 text-center space-y-1 border-border/40"
          >
            <stat.icon className="w-5 h-5 mx-auto text-primary" />
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
