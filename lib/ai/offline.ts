import {
  describeFinding,
  estimateTimeComplexity,
  generateHint,
  inspectCode,
  parseConsoleError,
  type Finding,
} from "@/app/_services/ai-code-service";
import type { AssistantLocale, AssistantRequest } from "./schema";

/**
 * Answers used when no model API key is configured. They come from the local
 * static analyzer (app/_services/ai-code-service.ts): real findings on real
 * line numbers, no generated prose pretending to be a model. Text is French or
 * English (Spanish falls back to English).
 */

type Lang = "fr" | "en";

const T = {
  fr: {
    banner: "_Mode hors-ligne : analyse statique locale, pas un modèle d'IA. Pour des explications complètes, l'assistant doit être configuré sur ce serveur._",
    noCode: "Je n'ai pas de code à analyser. Ouvrez un fichier dans l'éditeur (ou sélectionnez un extrait) puis réessayez.",
    overview: (lines: number, lang: string, fns: string, classes: string) =>
      `**Aperçu** : ${lines} ligne(s) de ${lang}. ${fns ? `Fonctions : ${fns}.` : "Aucune fonction détectée."}${classes ? ` Classes : ${classes}.` : ""}`,
    concepts: "**Notions présentes**",
    conceptNames: {
      loops: "boucles",
      recursion: "récursivité",
      "error-handling": "gestion d'erreurs (try/catch)",
      classes: "classes",
      async: "asynchrone (async/await, promesses)",
      functional: "style fonctionnel (map/filter/reduce)",
      collections: "structures de données (Map/Set/dict)",
      "arrow-functions": "fonctions fléchées",
      destructuring: "déstructuration",
      spread: "syntaxe spread",
    } as Record<string, string>,
    noConcepts: "Aucune notion avancée repérée : du code simple et direct.",
    findings: "**Points relevés par l'analyse statique**",
    noFindings: "Aucun problème courant détecté par les vérifications automatiques. Cela ne garantit pas que le code soit correct.",
    line: "ligne",
    complexity: (c: string) => `**Complexité estimée (d'après l'imbrication des boucles)** : ${c}`,
    debugTitle: "**Erreur de la dernière exécution**",
    debugNone: "Aucune erreur dans la console. Lancez le code (Ctrl+Entrée) puis relancez « Déboguer ».",
    debugAt: (f: string, l: number) => `Localisation : \`${f}\`, ligne ${l}.`,
    debugLine: "Ligne concernée",
    errorHelp: {
      TypeError: "Une valeur n'a pas le type attendu (souvent `undefined`/`null` utilisé comme objet ou fonction). Vérifiez ce que contient la variable juste avant la ligne indiquée.",
      ReferenceError: "Un nom est utilisé sans avoir été déclaré (faute de frappe, mauvaise portée ou import manquant).",
      SyntaxError: "Le code n'est pas valide : parenthèse, accolade, guillemet ou virgule manquant(e) à proximité de la ligne indiquée.",
      RangeError: "Une valeur sort des limites permises (récursion infinie, tableau de taille négative...).",
      NameError: "Un nom n'est pas défini (faute de frappe ou variable non initialisée).",
      IndentationError: "L'indentation est incohérente ; en Python elle fait partie de la syntaxe.",
      ZeroDivisionError: "Division par zéro : vérifiez le diviseur avant l'opération.",
      KeyError: "La clé demandée n'existe pas dans le dictionnaire ; utilisez `.get()` ou testez `in`.",
      IndexError: "Indice hors de la liste : vérifiez les bornes de la boucle.",
      ImportError: "Le module ou le nom importé est introuvable.",
      ModuleNotFoundError: "Le module importé est introuvable.",
    } as Record<string, string>,
    checklist: [
      "Lisez le message d'erreur en entier, puis la ligne qu'il désigne.",
      "Affichez les valeurs en jeu juste avant cette ligne pour vérifier vos hypothèses.",
      "Réduisez le code au plus petit exemple qui échoue encore.",
    ],
    testsIntro: "Voici un **squelette** de tests à compléter (généré à partir des fonctions détectées, non exécuté) :",
    testsNone: "Je n'ai détecté aucune fonction à tester. Écrivez d'abord une fonction pure (entrées → sortie), c'est la plus facile à tester.",
    testsTodo: "cas typique",
    testsEdge: "cas limite (vide, zéro, valeur invalide)",
    refactorIntro: "Le mode hors-ligne ne réécrit pas le code. Pistes de refactorisation repérées :",
    refactorTips: [
      "Une fonction = une responsabilité ; extrayez les blocs qui font « autre chose ».",
      "Donnez des noms qui disent l'intention (`prixTotal` plutôt que `x`).",
      "Réduisez l'imbrication avec des retours anticipés (early return).",
    ],
    hint1: "Reformulez le problème avec vos mots : quelles sont les entrées, quelle est la sortie attendue ? Quel est le plus petit exemple que vous savez résoudre à la main ?",
    hint2: "Découpez en étapes : que doit faire chaque itération ? Quelle donnée mémoriser d'une étape à l'autre ?",
    hint3: "Écrivez d'abord les commentaires des étapes, puis remplissez-les une par une en testant après chaque étape.",
    chat: "L'assistant complet n'est pas configuré : je ne peux pas répondre aux questions libres. Utilisez les actions Expliquer, Déboguer, Relire, Optimiser ou Tests pour obtenir une analyse statique.",
    lessonChat: "Pour répondre à vos questions sur cette leçon, l'assistant complet doit être configuré sur ce serveur. En attendant, relisez le contenu de la leçon ou testez vos idées dans le Playground.",
  },
  en: {
    banner: "_Offline mode: local static analysis, not an AI model. For full explanations, the assistant must be configured on this server._",
    noCode: "There is no code to analyze. Open a file in the editor (or select a snippet) and try again.",
    overview: (lines: number, lang: string, fns: string, classes: string) =>
      `**Overview**: ${lines} line(s) of ${lang}. ${fns ? `Functions: ${fns}.` : "No function detected."}${classes ? ` Classes: ${classes}.` : ""}`,
    concepts: "**Concepts present**",
    conceptNames: {
      loops: "loops",
      recursion: "recursion",
      "error-handling": "error handling (try/catch)",
      classes: "classes",
      async: "asynchronous code (async/await, promises)",
      functional: "functional style (map/filter/reduce)",
      collections: "data structures (Map/Set/dict)",
      "arrow-functions": "arrow functions",
      destructuring: "destructuring",
      spread: "spread syntax",
    } as Record<string, string>,
    noConcepts: "No advanced concept spotted: simple, direct code.",
    findings: "**Points found by static analysis**",
    noFindings: "No common problem detected by the automatic checks. That does not guarantee the code is correct.",
    line: "line",
    complexity: (c: string) => `**Estimated complexity (from loop nesting)**: ${c}`,
    debugTitle: "**Error from the last run**",
    debugNone: "There is no error in the console. Run the code (Ctrl+Enter), then ask to debug again.",
    debugAt: (f: string, l: number) => `Location: \`${f}\`, line ${l}.`,
    debugLine: "Line concerned",
    errorHelp: {
      TypeError: "A value does not have the expected type (often `undefined`/`null` used as an object or function). Check what the variable holds just before the reported line.",
      ReferenceError: "A name is used without being declared (typo, wrong scope or missing import).",
      SyntaxError: "The code is not valid: a parenthesis, brace, quote or comma is missing near the reported line.",
      RangeError: "A value is outside the allowed range (infinite recursion, negative array length...).",
      NameError: "A name is not defined (typo or variable never assigned).",
      IndentationError: "Indentation is inconsistent; in Python it is part of the syntax.",
      ZeroDivisionError: "Division by zero: check the divisor before the operation.",
      KeyError: "The requested key is not in the dictionary; use `.get()` or test with `in`.",
      IndexError: "Index outside the list: check the loop bounds.",
      ImportError: "The imported module or name cannot be found.",
      ModuleNotFoundError: "The imported module cannot be found.",
    } as Record<string, string>,
    checklist: [
      "Read the whole error message, then the line it points to.",
      "Print the values involved just before that line to check your assumptions.",
      "Reduce the code to the smallest example that still fails.",
    ],
    testsIntro: "Here is a test **skeleton** to complete (built from the detected functions, not executed):",
    testsNone: "I found no function to test. Start by writing a pure function (inputs to output): it is the easiest to test.",
    testsTodo: "typical case",
    testsEdge: "edge case (empty, zero, invalid value)",
    refactorIntro: "Offline mode does not rewrite code. Refactoring leads spotted:",
    refactorTips: [
      "One function, one responsibility: extract the blocks that do something else.",
      "Use names that state the intent (`totalPrice` rather than `x`).",
      "Reduce nesting with early returns.",
    ],
    hint1: "Restate the problem in your own words: what are the inputs, what is the expected output? What is the smallest example you can solve by hand?",
    hint2: "Break it into steps: what must each iteration do? What data do you need to remember from one step to the next?",
    hint3: "Write the steps as comments first, then fill them in one by one, testing after each step.",
    chat: "The full assistant is not configured, so I cannot answer open questions. Use the Explain, Debug, Review, Optimize or Tests actions to get a static analysis.",
    lessonChat: "To answer your questions about this lesson, the full assistant must be configured on this server. In the meantime, re-read the lesson content or try your ideas in the Playground.",
  },
} as const;

const inline = (text: string) => `\`${text.replace(/`/g, "'").slice(0, 300)}\``;

function pickLang(locale: AssistantLocale): Lang {
  return locale === "fr" ? "fr" : "en";
}

function formatFindings(findings: Finding[], lineOffset: number, t: (typeof T)[Lang]): string {
  return findings
    .map((f) => `- ${t.line} ${f.line + lineOffset} : ${describeFinding(f.id)}`)
    .join("\n");
}

function testSkeleton(fns: string[], language: string, t: (typeof T)[Lang]): string {
  const py = language === "python" || language === "py";
  if (py) {
    const body = fns
      .map(
        (fn) =>
          `def test_${fn}_typical():\n    # TODO ${t.testsTodo}\n    assert ${fn}(...) == ...\n\n\ndef test_${fn}_edge():\n    # TODO ${t.testsEdge}\n    assert ${fn}(...) == ...`,
      )
      .join("\n\n\n");
    return `\`\`\`python\n# test_main.py (pytest)\nfrom main import ${fns.join(", ")}\n\n\n${body}\n\`\`\``;
  }
  const ts = language === "typescript" || language === "ts" || language === "tsx";
  const body = fns
    .map(
      (fn) =>
        `describe("${fn}", () => {\n  it("${t.testsTodo}", () => {\n    // TODO\n    expect(${fn}(/* ... */)).toBe(/* ... */);\n  });\n\n  it("${t.testsEdge}", () => {\n    // TODO\n    expect(${fn}(/* ... */)).toBe(/* ... */);\n  });\n});`,
    )
    .join("\n\n");
  return `\`\`\`${ts ? "ts" : "js"}\n// main.test.${ts ? "ts" : "js"} (Vitest)\nimport { describe, it, expect } from "vitest";\nimport { ${fns.join(", ")} } from "./main";\n\n${body}\n\`\`\``;
}

/** Build the markdown answer for a request, entirely locally. */
export function generateOfflineAnswer(request: AssistantRequest): string {
  const t = T[pickLang(request.locale)];
  const { context } = request;
  const selection = context.selection?.text.trim() ? context.selection : undefined;
  const code = selection?.text ?? context.activeFile?.content ?? "";
  const lineOffset = selection ? (selection.startLine ?? 1) - 1 : 0;
  const language = context.language ?? "javascript";
  const out: string[] = [t.banner];

  if (request.mode === "chat" && !code.trim()) {
    out.push(context.surface === "lesson" ? t.lessonChat : t.chat);
    return out.join("\n\n");
  }
  if (request.mode === "hint") {
    const level = request.hintLevel ?? 1;
    const known = context.challenge?.id ? generateHint(context.challenge.id, code) : null;
    const hasKnown = known && !known.hint.startsWith("Break down the problem");
    out.push(level === 1 ? t.hint1 : level === 2 ? (hasKnown ? known.hint : t.hint2) : t.hint3);
    return out.join("\n\n");
  }
  if (request.mode === "chat") {
    out.push(t.chat);
  }
  if (!code.trim() && request.mode !== "debug") {
    out.push(t.noCode);
    return out.join("\n\n");
  }

  const info = inspectCode(code, language);

  switch (request.mode) {
    case "explain":
    case "chat": {
      const fns = info.functions.map((f) => `\`${f.name}\``).join(", ");
      out.push(t.overview(info.lineCount, language, fns, info.classes.join(", ")));
      out.push(
        info.concepts.length > 0
          ? `${t.concepts}\n${info.concepts.map((c) => `- ${t.conceptNames[c] ?? c}`).join("\n")}`
          : t.noConcepts,
      );
      break;
    }
    case "debug": {
      const output = context.console?.output ?? "";
      const parsed = parseConsoleError(output);
      if (!parsed) {
        out.push(t.debugNone);
      } else {
        // Inline code, not a fenced block: an error message is not code to insert or run
        const parts = [`${t.debugTitle} : ${inline(`${parsed.name ? `${parsed.name}: ` : ""}${parsed.message}`)}`];
        if (parsed.name && t.errorHelp[parsed.name]) parts.push(t.errorHelp[parsed.name]);
        if (parsed.location) {
          parts.push(t.debugAt(parsed.location.file, parsed.location.line));
          const source = context.activeFile?.content.split("\n")[parsed.location.line - 1];
          if (source?.trim()) parts.push(`${t.debugLine} : ${inline(source.trim())}`);
        }
        out.push(parts.join("\n\n"));
      }
      const bugs = info.findings.filter((f) => f.type === "bug" || f.type === "logic");
      if (bugs.length > 0) out.push(`${t.findings}\n${formatFindings(bugs, lineOffset, t)}`);
      out.push(t.checklist.map((c) => `- ${c}`).join("\n"));
      break;
    }
    case "review": {
      out.push(info.findings.length > 0 ? `${t.findings}\n${formatFindings(info.findings, lineOffset, t)}` : t.noFindings);
      break;
    }
    case "optimize": {
      out.push(t.complexity(estimateTimeComplexity(info)));
      const perf = info.findings.filter((f) => f.type === "performance");
      out.push(perf.length > 0 ? `${t.findings}\n${formatFindings(perf, lineOffset, t)}` : t.noFindings);
      break;
    }
    case "tests": {
      const names = [...new Set(info.functions.map((f) => f.name))].slice(0, 5);
      out.push(names.length > 0 ? `${t.testsIntro}\n\n${testSkeleton(names, language, t)}` : t.testsNone);
      break;
    }
    case "refactor": {
      out.push(t.refactorIntro);
      const style = info.findings.filter((f) => f.type === "style");
      if (style.length > 0) out.push(formatFindings(style, lineOffset, t));
      out.push(t.refactorTips.map((x) => `- ${x}`).join("\n"));
      break;
    }
  }
  return out.join("\n\n");
}
