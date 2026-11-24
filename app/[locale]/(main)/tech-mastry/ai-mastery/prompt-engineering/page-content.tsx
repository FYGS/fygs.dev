"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Zap, Brain, Target, ArrowRight, Thermometer, List, Layers, Sparkles, RefreshCw } from "lucide-react";

/* ========== PROMPT BUILDER ========== */
function PromptBuilder() {
  const [role, setRole] = useState("Tu es un expert en développement web.");
  const [task, setTask] = useState("Explique le concept de closures en JavaScript.");
  const [format, setFormat] = useState("Réponds avec un exemple de code commenté.");
  const [constraints, setConstraints] = useState("Maximum 200 mots. Niveau débutant.");

  const fullPrompt = useMemo(() => {
    const parts: string[] = [];
    if (role) parts.push(`<role>\n${role}\n</role>`);
    if (task) parts.push(`<task>\n${task}\n</task>`);
    if (format) parts.push(`<format>\n${format}\n</format>`);
    if (constraints) parts.push(`<constraints>\n${constraints}\n</constraints>`);
    return parts.join("\n\n");
  }, [role, task, format, constraints]);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Target className="w-5 h-5 text-violet-500" />
        Prompt Builder Interactif
      </div>
      <p className="text-sm text-muted-foreground">
        Construisez un prompt structuré en remplissant chaque section. Le résultat est assemblé en temps réel avec des balises XML, une pratique recommandée pour délimiter clairement les parties du prompt (notamment avec Claude).
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Rôle (System Prompt)</label>
          <textarea value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 rounded-lg border bg-muted/30 text-sm min-h-[60px] resize-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Tâche</label>
          <textarea value={task} onChange={(e) => setTask(e.target.value)}
            className="w-full p-2 rounded-lg border bg-muted/30 text-sm min-h-[60px] resize-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Format de sortie</label>
          <textarea value={format} onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 rounded-lg border bg-muted/30 text-sm min-h-[60px] resize-none" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Contraintes</label>
          <textarea value={constraints} onChange={(e) => setConstraints(e.target.value)}
            className="w-full p-2 rounded-lg border bg-muted/30 text-sm min-h-[60px] resize-none" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-primary">Prompt généré</label>
        <pre className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap border border-primary/20 font-mono">
          {fullPrompt}
        </pre>
      </div>
    </Card>
  );
}

/* ========== TEMPERATURE VISUALIZER ========== */
function TemperatureVisualizer() {
  const [temp, setTemp] = useState(0.7);
  const [samples, setSamples] = useState<string[]>([]);

  const lowTempWords = ["Le", "chat", "est", "sur", "le", "tapis", "rouge", "du", "salon"];
  const medTempWords = ["Le", "félin", "repose", "sur", "le", "tapis", "coloré", "du", "séjour", "chaleureux"];
  const highTempWords = ["L'", "énigmatique", "félin", "somnole", "gracieusement", "sur", "le", "somptueux",
    "tapis", "cramoisie", "du", "fascinant", "salon", "baroque", "onirique"];

  const generate = () => {
    const newSamples: string[] = [];
    for (let i = 0; i < 3; i++) {
      let words: string[];
      if (temp < 0.3) words = lowTempWords;
      else if (temp < 0.7) words = medTempWords;
      else words = highTempWords;

      const shuffled = [...words];
      if (temp > 0.3) {
        for (let j = shuffled.length - 1; j > 0; j--) {
          if (Math.random() < temp * 0.5) {
            const k = Math.floor(Math.random() * (j + 1));
            [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
          }
        }
      }
      const len = Math.max(4, Math.floor(words.length * (0.6 + Math.random() * temp * 0.6)));
      newSamples.push(shuffled.slice(0, len).join(" ") + ".");
    }
    setSamples(newSamples);
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Thermometer className="w-5 h-5 text-orange-500" />
        Temperature & Créativité
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Temperature: <strong>{temp.toFixed(1)}</strong></span>
              <span className="text-muted-foreground">
                {temp < 0.3 ? "Quasi déterministe" : temp < 0.7 ? "Équilibré" : "Créatif"}
              </span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.0 - Précis</span><span>0.5 - Balancé</span><span>1.0 - Créatif</span>
            </div>
          </div>

          <button onClick={generate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
            <RefreshCw className="w-4 h-4" /> Générer des exemples
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Sorties simulées :</label>
          {samples.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Cliquez sur &quot;Générer&quot; pour voir l&apos;effet de la temperature.</p>
          ) : (
            samples.map((s, i) => (
              <div key={i} className="p-2 rounded bg-muted/40 text-sm border border-border/30">
                {s}
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Certains modèles récents (notamment les modèles de raisonnement) fixent
        ou refusent les paramètres d&apos;échantillonnage comme temperature :
        vérifiez la documentation du modèle utilisé.
      </p>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-center">
          <strong className="text-blue-400">temp=0.0</strong><br />Exact, répétitif
        </div>
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-center">
          <strong className="text-amber-400">temp=0.5</strong><br />Équilibré
        </div>
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-center">
          <strong className="text-red-400">temp=1.0</strong><br />Créatif, imprévisible
        </div>
      </div>
    </Card>
  );
}

/* ========== TECHNIQUE CARDS ========== */
const techniques = [
  {
    name: "Zero-Shot",
    desc: "Demander directement sans exemple. Le modèle utilise ses connaissances générales.",
    example: "Traduis en anglais : 'Bonjour le monde'",
    level: "fondamental",
    icon: Zap,
    color: "text-green-500",
  },
  {
    name: "Few-Shot",
    desc: "Fournir quelques exemples variés (souvent 3 à 5) pour guider le format et le style de réponse. Placez-les dans des balises dédiées (<example>) pour les distinguer des instructions.",
    example: "Exemple : 'chat' -> 'animal domestique'\n'voiture' -> 'véhicule motorisé'\n'python' -> ?",
    level: "fondamental",
    icon: List,
    color: "text-blue-500",
  },
  {
    name: "Chain-of-Thought (CoT)",
    desc: "Demander au modèle de réfléchir étape par étape avant de répondre. Avec les modèles de raisonnement (réflexion adaptative / extended thinking), inutile de le demander : réglez plutôt le niveau d'effort ou le budget de réflexion et laissez le modèle raisonner.",
    example: "Résous pas à pas : Si j'ai 23 pommes et j'en donne 7, puis j'en achète 12...",
    level: "intermédiaire",
    icon: Brain,
    color: "text-amber-500",
  },
  {
    name: "Tree-of-Thought",
    desc: "Explorer plusieurs chemins de raisonnement et choisir le meilleur. La méthode d'origine repose sur une recherche pilotée par du code ; l'exemple ci-contre en est une version simplifiée en un seul prompt.",
    example: "Explore 3 approches différentes pour résoudre ce problème, évalue chacune, puis choisis la meilleure.",
    level: "avancé",
    icon: Layers,
    color: "text-purple-500",
  },
  {
    name: "Self-Consistency",
    desc: "Générer N réponses indépendantes (appels séparés, temperature > 0) et retenir la plus fréquente (vote majoritaire). Coûte N fois plus de tokens.",
    example: "Côté code : envoyer 5 fois le même prompt (temperature > 0), puis extraire la réponse majoritaire.",
    level: "avancé",
    icon: RefreshCw,
    color: "text-cyan-500",
  },
  {
    name: "Structured Output",
    desc: "Obtenir une réponse conforme à un schéma. Préférez les sorties structurées natives de l'API (JSON Schema appliqué au décodage) à une simple consigne dans le prompt, puis validez côté code (Zod, Pydantic). À défaut de support natif, décrivez le format attendu avec un exemple.",
    example: "API : sortie structurée avec un JSON Schema { name, category, score }\nSans support natif : Réponds uniquement en JSON avec les clés { name, category, score }",
    level: "intermédiaire",
    icon: Target,
    color: "text-rose-500",
  },
];

function TechniqueCards() {
  const [selected, setSelected] = useState(0);
  const tech = techniques[selected];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Sparkles className="w-5 h-5 text-violet-500" />
        Techniques de Prompting
      </div>

      <div className="flex gap-2 flex-wrap">
        {techniques.map((t, i) => (
          <button key={t.name} onClick={() => setSelected(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              i === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <tech.icon className={`w-6 h-6 ${tech.color}`} />
            <h3 className="text-xl font-bold">{tech.name}</h3>
            <Badge variant="outline" className="text-[10px]">{tech.level}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{tech.desc}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Exemple de prompt</label>
          <pre className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap border font-mono">
            {tech.example}
          </pre>
        </div>
      </div>
    </Card>
  );
}

/* ========== SYSTEM PROMPT PATTERNS ========== */
function SystemPromptPatterns() {
  const patterns = [
    {
      name: "Expert Persona",
      prompt: "Tu es un architecte logiciel senior avec 15 ans d'expérience\nen systèmes distribués. Tu privilégies toujours la\nsimplicité, la maintenabilité et les patterns éprouvés.",
      why: "Définit l'expertise et les valeurs qui guident les réponses.",
    },
    {
      name: "Output Controller",
      prompt: "Réponds toujours en JSON valide avec cette structure :\n{\n  \"answer\": string,\n  \"confidence\": number (0-1),\n  \"sources\": string[]\n}",
      why: "Force un format de sortie prédictible et parsable. La confiance auto-déclarée n'est pas calibrée et les sources citées doivent être vérifiées.",
    },
    {
      name: "Guardrails",
      prompt: "Règles impératives :\n1. N'affirme jamais qu'un code est testé si tu ne l'as pas exécuté\n2. Cite tes sources\n3. Si tu n'es pas sûr, dis-le explicitement\n4. Privilégie la sécurité sur la performance",
      why: "Pose des limites claires pour réduire les hallucinations (sans les éliminer).",
    },
    {
      name: "Balises XML",
      prompt: "<instructions>\nRésume le document en 5 points.\n</instructions>\n\n<document>\n{{contenu}}\n</document>\n\nRéponds dans des balises <summary>.",
      why: "Les balises XML séparent instructions, données et exemples, réduisent les ambiguïtés et rendent la sortie facile à extraire. Avec un modèle sans raisonnement natif, on peut aussi demander une réflexion dans un bloc <thinking> avant la réponse.",
    },
  ];

  const [selected, setSelected] = useState(0);
  const p = patterns[selected];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        Patterns de System Prompts
      </div>

      <div className="flex gap-2 flex-wrap">
        {patterns.map((pat, i) => (
          <button key={pat.name} onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              i === selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/40 text-muted-foreground hover:border-primary/30"
            }`}>
            {pat.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-primary">System Prompt</label>
          <pre className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap border font-mono min-h-[120px]">
            {p.prompt}
          </pre>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Pourquoi ce pattern ?</label>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            {p.why}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ========== MAIN PAGE ========== */
export default function PromptEngineeringPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-500/10">
            <MessageSquare className="w-8 h-8 text-violet-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Prompt Engineering</h1>
            <p className="text-muted-foreground">De zéro à expert : maîtrisez l&apos;art de communiquer avec les LLMs</p>
          </div>
        </div>
      </div>

      <TechniqueCards />
      <PromptBuilder />
      <TemperatureVisualizer />
      <SystemPromptPatterns />

      {/* Best Practices Summary */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-green-500" />
          Bonnes Pratiques Résumées
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Soyez spécifique", desc: "Plus votre prompt est précis, meilleure sera la réponse." },
            { title: "Donnez du contexte", desc: "Le modèle ne connaît pas votre situation sans contexte." },
            { title: "Utilisez des exemples", desc: "Quelques exemples bien choisis améliorent souvent nettement la qualité." },
            { title: "Itérez", desc: "Affinez vos prompts basé sur les réponses obtenues." },
            { title: "Séparez les rôles", desc: "System prompt vs User prompt vs Assistant prompt." },
            { title: "Profitez du prompt caching", desc: "Placez le contenu stable (system prompt, documents, exemples) au début et la partie variable à la fin : un préfixe identique peut être mis en cache, ce qui réduit coût et latence." },
            { title: "Adaptez aux modèles de raisonnement", desc: "Décrivez l'objectif et les critères de réussite plutôt que chaque étape de raisonnement ; ajustez l'effort de réflexion." },
            { title: "Testez les limites", desc: "Essayez des cas edge pour valider la robustesse." },
          ].map((tip) => (
            <div key={tip.title} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
              <h3 className="text-sm font-semibold">{tip.title}</h3>
              <p className="text-xs text-muted-foreground">{tip.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}