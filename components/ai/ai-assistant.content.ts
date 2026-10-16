import { t, type Dictionary } from "intlayer";

const mode = (
  label: { en: string; fr: string; es: string },
  prompt: { en: string; fr: string; es: string },
  followUps: { en: string; fr: string; es: string }[],
) => ({
  label: t(label),
  prompt: t(prompt),
  followUps: followUps.map((f) => t(f)),
});

const aiAssistantContent = {
  key: "ai-assistant",
  content: {
    title: t({ en: "AI assistant", fr: "Assistant IA", es: "Asistente IA" }),
    subtitle: t({
      en: "Your programming tutor",
      fr: "Votre tuteur de programmation",
      es: "Tu tutor de programación",
    }),
    shortLabel: t({ en: "AI", fr: "IA", es: "IA" }),
    close: t({ en: "Close the assistant", fr: "Fermer l'assistant", es: "Cerrar el asistente" }),
    openTooltip: t({
      en: "AI assistant (Ctrl+I)",
      fr: "Assistant IA (Ctrl+I)",
      es: "Asistente IA (Ctrl+I)",
    }),
    badge: {
      offline: t({ en: "Offline mode", fr: "Mode hors-ligne", es: "Modo sin conexión" }),
      offlineHint: t({
        en: "Local static analysis only. The full assistant is not configured on this server.",
        fr: "Analyse statique locale uniquement. L'assistant complet n'est pas configuré sur ce serveur.",
        es: "Solo análisis estático local. El asistente completo no está configurado en este servidor.",
      }),
      online: t({ en: "AI online", fr: "IA en ligne", es: "IA en línea" }),
    },
    empty: {
      title: t({
        en: "Ask me anything about your code",
        fr: "Posez-moi vos questions sur votre code",
        es: "Pregúntame lo que quieras sobre tu código",
      }),
      lessonTitle: t({
        en: "Ask me about this lesson",
        fr: "Posez-moi vos questions sur cette leçon",
        es: "Pregúntame sobre esta lección",
      }),
      description: t({
        en: "I can explain, debug, review and test your code. I only see your active file, your selection and the console output.",
        fr: "Je peux expliquer, déboguer, relire et tester votre code. Je ne vois que votre fichier actif, votre sélection et la sortie de la console.",
        es: "Puedo explicar, depurar, revisar y probar tu código. Solo veo tu archivo activo, tu selección y la salida de la consola.",
      }),
      lessonDescription: t({
        en: "Ask about this lesson: I'll explain, give examples and check your understanding.",
        fr: "Posez vos questions sur cette leçon : j'explique, je donne des exemples et je vérifie votre compréhension.",
        es: "Pregunta sobre esta lección: explico, doy ejemplos y compruebo tu comprensión.",
      }),
    },
    placeholder: {
      playground: t({
        en: "Ask a question about your code…",
        fr: "Posez une question sur votre code…",
        es: "Haz una pregunta sobre tu código…",
      }),
      lesson: t({
        en: "Ask a question about this lesson…",
        fr: "Posez une question sur cette leçon…",
        es: "Haz una pregunta sobre esta lección…",
      }),
    },
    composerLabel: t({ en: "Your message", fr: "Votre message", es: "Tu mensaje" }),
    composerHint: t({
      en: "Enter to send, Shift+Enter for a new line",
      fr: "Entrée pour envoyer, Maj+Entrée pour un retour à la ligne",
      es: "Intro para enviar, Mayús+Intro para nueva línea",
    }),
    send: t({ en: "Send", fr: "Envoyer", es: "Enviar" }),
    stop: t({ en: "Stop", fr: "Arrêter", es: "Detener" }),
    regenerate: t({ en: "Regenerate", fr: "Régénérer", es: "Regenerar" }),
    clear: t({ en: "Clear conversation", fr: "Effacer la conversation", es: "Borrar la conversación" }),
    clearConfirm: t({
      en: "Clear this conversation? This cannot be undone.",
      fr: "Effacer cette conversation ? Cette action est irréversible.",
      es: "¿Borrar esta conversación? No se puede deshacer.",
    }),
    confirm: t({ en: "Confirm", fr: "Confirmer", es: "Confirmar" }),
    continue: t({ en: "Continue", fr: "Continuer", es: "Continuar" }),
    continuePrompt: t({
      en: "Continue from where you stopped.",
      fr: "Continue là où tu t'es arrêté.",
      es: "Continúa donde lo dejaste.",
    }),
    truncated: t({
      en: "The answer was cut because it reached the maximum length.",
      fr: "La réponse a été coupée : elle a atteint la longueur maximale.",
      es: "La respuesta se cortó al alcanzar la longitud máxima.",
    }),
    stopped: t({ en: "Stopped", fr: "Interrompue", es: "Detenida" }),
    you: t({ en: "You", fr: "Vous", es: "Tú" }),
    tutor: t({ en: "Tutor", fr: "Tuteur", es: "Tutor" }),
    thinking: t({ en: "The tutor is thinking…", fr: "Le tuteur réfléchit…", es: "El tutor está pensando…" }),
    announce: {
      answering: t({ en: "The tutor is answering", fr: "Le tuteur répond", es: "El tutor está respondiendo" }),
      done: t({ en: "Answer complete", fr: "Réponse terminée", es: "Respuesta completa" }),
    },
    disclaimer: t({
      en: "AI can make mistakes: check the code before relying on it.",
      fr: "L'IA peut se tromper : vérifiez le code avant de vous y fier.",
      es: "La IA puede equivocarse: comprueba el código antes de fiarte.",
    }),
    storedNote: t({
      en: "Saved on this device only.",
      fr: "Enregistré uniquement sur cet appareil.",
      es: "Guardado solo en este dispositivo.",
    }),
    scope: {
      file: t({ en: "Context", fr: "Contexte", es: "Contexto" }),
      selection: t({ en: "Selection, lines", fr: "Sélection, lignes", es: "Selección, líneas" }),
      none: t({ en: "No file open", fr: "Aucun fichier ouvert", es: "Ningún archivo abierto" }),
      consoleError: t({ en: "+ console error", fr: "+ erreur console", es: "+ error de consola" }),
    },
    modes: {
      explain: mode(
        { en: "Explain", fr: "Expliquer", es: "Explicar" },
        { en: "Explain this code step by step.", fr: "Explique ce code pas à pas.", es: "Explica este código paso a paso." },
        [
          { en: "Give me a simpler example", fr: "Donne-moi un exemple plus simple", es: "Dame un ejemplo más sencillo" },
          { en: "What are the common pitfalls?", fr: "Quels sont les pièges courants ?", es: "¿Cuáles son los errores comunes?" },
        ],
      ),
      debug: mode(
        { en: "Debug", fr: "Déboguer", es: "Depurar" },
        {
          en: "Why does this code fail? Help me fix it.",
          fr: "Pourquoi ce code échoue-t-il ? Aide-moi à le corriger.",
          es: "¿Por qué falla este código? Ayúdame a corregirlo.",
        },
        [
          { en: "How do I avoid this next time?", fr: "Comment l'éviter à l'avenir ?", es: "¿Cómo evitarlo la próxima vez?" },
          { en: "Show the complete fixed code", fr: "Montre le code corrigé complet", es: "Muestra el código corregido completo" },
        ],
      ),
      review: mode(
        { en: "Review", fr: "Relire", es: "Revisar" },
        {
          en: "Review this code: bugs, security, readability.",
          fr: "Fais une revue de ce code : bugs, sécurité, lisibilité.",
          es: "Revisa este código: errores, seguridad, legibilidad.",
        },
        [
          { en: "Fix the most important issue", fr: "Corrige le problème le plus important", es: "Corrige el problema más importante" },
          { en: "Write tests for it", fr: "Écris des tests pour ça", es: "Escribe pruebas para esto" },
        ],
      ),
      optimize: mode(
        { en: "Optimize", fr: "Optimiser", es: "Optimizar" },
        { en: "How can I optimize this code?", fr: "Comment optimiser ce code ?", es: "¿Cómo puedo optimizar este código?" },
        [
          { en: "What are the trade-offs?", fr: "Quels sont les compromis ?", es: "¿Cuáles son las contrapartidas?" },
          { en: "Explain the complexity", fr: "Explique la complexité", es: "Explica la complejidad" },
        ],
      ),
      tests: mode(
        { en: "Tests", fr: "Tests", es: "Pruebas" },
        { en: "Write unit tests for this code.", fr: "Écris des tests unitaires pour ce code.", es: "Escribe pruebas unitarias para este código." },
        [
          { en: "Add more edge cases", fr: "Ajoute des cas limites", es: "Añade más casos límite" },
          { en: "How do I run these tests?", fr: "Comment lancer ces tests ?", es: "¿Cómo ejecuto estas pruebas?" },
        ],
      ),
      refactor: mode(
        { en: "Refactor", fr: "Refactoriser", es: "Refactorizar" },
        {
          en: "Refactor this code to make it clearer.",
          fr: "Refactorise ce code pour le rendre plus clair.",
          es: "Refactoriza este código para que sea más claro.",
        },
        [
          { en: "Explain each change", fr: "Explique chaque changement", es: "Explica cada cambio" },
          { en: "Can it be simpler still?", fr: "Peut-on encore le simplifier ?", es: "¿Se puede simplificar más?" },
        ],
      ),
      hint: mode(
        { en: "Hint", fr: "Indice", es: "Pista" },
        {
          en: "Give me a hint, without the solution.",
          fr: "Donne-moi un indice, sans la solution.",
          es: "Dame una pista, sin la solución.",
        },
        [{ en: "Another hint, please", fr: "Un autre indice, s'il te plaît", es: "Otra pista, por favor" }],
      ),
      chat: mode(
        { en: "Question", fr: "Question", es: "Pregunta" },
        { en: "", fr: "", es: "" },
        [
          { en: "Can you give an example?", fr: "Peux-tu donner un exemple ?", es: "¿Puedes dar un ejemplo?" },
          { en: "Summarize in one sentence", fr: "Résume en une phrase", es: "Resume en una frase" },
        ],
      ),
    },
    explainError: {
      button: t({ en: "Explain this error", fr: "Expliquer l'erreur", es: "Explicar el error" }),
      title: t({
        en: "Ask the AI tutor to explain this error",
        fr: "Demander au tuteur IA d'expliquer cette erreur",
        es: "Pedir al tutor IA que explique este error",
      }),
      prompt: t({
        en: "Explain this error and help me fix it.",
        fr: "Explique cette erreur et aide-moi à la corriger.",
        es: "Explica este error y ayúdame a corregirlo.",
      }),
    },
    code: {
      copy: t({ en: "Copy", fr: "Copier", es: "Copiar" }),
      copied: t({ en: "Copied", fr: "Copié", es: "Copiado" }),
      insert: t({ en: "Insert", fr: "Insérer", es: "Insertar" }),
      insertTitle: t({
        en: "Insert at the cursor in the editor",
        fr: "Insérer au curseur dans l'éditeur",
        es: "Insertar en el cursor del editor",
      }),
      replace: t({ en: "Replace", fr: "Remplacer", es: "Reemplazar" }),
      replaceTitle: t({
        en: "Replace the selection, or the whole file when nothing is selected",
        fr: "Remplacer la sélection, ou tout le fichier s'il n'y a pas de sélection",
        es: "Reemplazar la selección, o todo el archivo si no hay selección",
      }),
      run: t({ en: "Run", fr: "Exécuter", es: "Ejecutar" }),
      runTitle: t({
        en: "Run this code without changing your file",
        fr: "Exécuter ce code sans modifier votre fichier",
        es: "Ejecutar este código sin modificar tu archivo",
      }),
      inserted: t({ en: "Code inserted. Ctrl+Z to undo.", fr: "Code inséré. Ctrl+Z pour annuler.", es: "Código insertado. Ctrl+Z para deshacer." }),
      replacedSelection: t({
        en: "Selection replaced. Ctrl+Z to undo.",
        fr: "Sélection remplacée. Ctrl+Z pour annuler.",
        es: "Selección reemplazada. Ctrl+Z para deshacer.",
      }),
      replacedFile: t({
        en: "File replaced. Ctrl+Z to undo.",
        fr: "Fichier remplacé. Ctrl+Z pour annuler.",
        es: "Archivo reemplazado. Ctrl+Z para deshacer.",
      }),
      noEditor: t({ en: "Open a file in the editor first.", fr: "Ouvrez d'abord un fichier dans l'éditeur.", es: "Abre primero un archivo en el editor." }),
    },
    errors: {
      rate_limited: t({
        en: "You have asked a lot of questions. Please wait before trying again.",
        fr: "Vous avez posé beaucoup de questions. Patientez avant de réessayer.",
        es: "Has hecho muchas preguntas. Espera antes de volver a intentarlo.",
      }),
      busy: t({
        en: "The AI service is busy. Please try again in a moment.",
        fr: "Le service d'IA est très sollicité. Réessayez dans un instant.",
        es: "El servicio de IA está saturado. Inténtalo de nuevo en un momento.",
      }),
      unavailable: t({
        en: "The assistant is unavailable right now.",
        fr: "L'assistant est indisponible pour le moment.",
        es: "El asistente no está disponible por ahora.",
      }),
      timeout: t({
        en: "The assistant took too long to answer. Please try again.",
        fr: "L'assistant a mis trop de temps à répondre. Réessayez.",
        es: "El asistente tardó demasiado en responder. Inténtalo de nuevo.",
      }),
      upstream_error: t({
        en: "The AI service returned an error. Please try again.",
        fr: "Le service d'IA a renvoyé une erreur. Réessayez.",
        es: "El servicio de IA devolvió un error. Inténtalo de nuevo.",
      }),
      invalid_request: t({
        en: "This request could not be processed.",
        fr: "Cette demande n'a pas pu être traitée.",
        es: "No se pudo procesar esta solicitud.",
      }),
      too_large: t({
        en: "Your code is too large to send. Select a smaller part.",
        fr: "Votre code est trop volumineux. Sélectionnez une partie plus petite.",
        es: "Tu código es demasiado grande. Selecciona una parte más pequeña.",
      }),
      network: t({
        en: "Could not reach the server. Check your connection.",
        fr: "Impossible de joindre le serveur. Vérifiez votre connexion.",
        es: "No se pudo contactar con el servidor. Comprueba tu conexión.",
      }),
      internal: t({
        en: "Something went wrong. Please try again.",
        fr: "Une erreur est survenue. Réessayez.",
        es: "Algo salió mal. Inténtalo de nuevo.",
      }),
      retryIn: t({ en: "Retry in", fr: "Réessayer dans", es: "Reintentar en" }),
      retry: t({ en: "Try again", fr: "Réessayer", es: "Reintentar" }),
      seconds: t({ en: "s", fr: " s", es: " s" }),
      minutes: t({ en: "min", fr: "min", es: "min" }),
    },
    lesson: {
      trigger: t({ en: "Ask the AI tutor", fr: "Demander au tuteur IA", es: "Preguntar al tutor IA" }),
      title: t({ en: "AI tutor", fr: "Tuteur IA", es: "Tutor IA" }),
      about: t({ en: "About the lesson", fr: "À propos de la leçon", es: "Sobre la lección" }),
      prompts: [
        t({ en: "Summarize this lesson in 5 points", fr: "Résume cette leçon en 5 points", es: "Resume esta lección en 5 puntos" }),
        t({ en: "Give me a concrete example", fr: "Donne-moi un exemple concret", es: "Dame un ejemplo concreto" }),
        t({ en: "Quiz me on this lesson", fr: "Pose-moi des questions sur cette leçon", es: "Hazme preguntas sobre esta lección" }),
      ],
    },
  },
} satisfies Dictionary;

export default aiAssistantContent;
