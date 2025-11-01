import { t, type DeclarationContent } from "intlayer";

export const localeUiContent = {
  key: "locale-ui",
  content: {
    // Language Switcher
    languageSwitcher: {
      label: t({
        en: "Language",
        fr: "Langue",
        es: "Idioma",
      }),
      changeLanguage: t({
        en: "Change language",
        fr: "Changer de langue",
        es: "Cambiar idioma",
      }),
      currentLanguage: t({
        en: "Current",
        fr: "Actuel",
        es: "Actual",
      }),
    },

    // First Time Modal
    firstTimeModal: {
      title: t({
        en: "Choose Your Language",
        fr: "Choisissez votre langue",
        es: "Elige tu idioma",
      }),
      description: t({
        en: "Select your preferred language to get started",
        fr: "Sélectionnez votre langue préférée pour commencer",
        es: "Selecciona tu idioma preferido para comenzar",
      }),
      changeLater: t({
        en: "You can change this later in settings",
        fr: "Vous pourrez modifier cela plus tard dans les paramètres",
        es: "Puedes cambiar esto más tarde en configuración",
      }),
    },

    // Loading States
    loading: {
      general: t({
        en: "Loading...",
        fr: "Chargement...",
        es: "Cargando...",
      }),
      preparingExperience: t({
        en: "Preparing your experience",
        fr: "Préparation de votre expérience",
        es: "Preparando tu experiencia",
      }),
      changingLanguage: t({
        en: "Changing language...",
        fr: "Changement de langue...",
        es: "Cambiando idioma...",
      }),
      pleaseWait: t({
        en: "Please wait",
        fr: "Veuillez patienter",
        es: "Por favor espera",
      }),
    },

    // Toast Messages
    toasts: {
      languageChanged: t({
        en: "Language changed to",
        fr: "Langue changée en",
        es: "Idioma cambiado a",
      }),
      languageChangeFailed: t({
        en: "Failed to change language",
        fr: "Échec du changement de langue",
        es: "Error al cambiar el idioma",
      }),
      preferencesSaved: t({
        en: "Preferences saved successfully",
        fr: "Préférences enregistrées avec succès",
        es: "Preferencias guardadas exitosamente",
      }),
    },

    // Language Names
    languages: {
      english: t({
        en: "English",
        fr: "Anglais",
        es: "Inglés",
      }),
      french: t({
        en: "French",
        fr: "Français",
        es: "Francés",
      }),
      spanish: t({
        en: "Spanish",
        fr: "Espagnol",
        es: "Español",
      }),
    },

    // Accessibility
    accessibility: {
      openLanguageMenu: t({
        en: "Open language menu",
        fr: "Ouvrir le menu des langues",
        es: "Abrir menú de idiomas",
      }),
      closeLanguageMenu: t({
        en: "Close language menu",
        fr: "Fermer le menu des langues",
        es: "Cerrar menú de idiomas",
      }),
      selectLanguage: t({
        en: "Select language",
        fr: "Sélectionner la langue",
        es: "Seleccionar idioma",
      }),
      currentlySelected: t({
        en: "Currently selected",
        fr: "Actuellement sélectionné",
        es: "Seleccionado actualmente",
      }),
    },

    // Settings
    settings: {
      languagePreferences: t({
        en: "Language Preferences",
        fr: "Préférences de langue",
        es: "Preferencias de idioma",
      }),
      interfaceLanguage: t({
        en: "Interface Language",
        fr: "Langue de l'interface",
        es: "Idioma de la interfaz",
      }),
      contentLanguage: t({
        en: "Content Language",
        fr: "Langue du contenu",
        es: "Idioma del contenido",
      }),
      automaticDetection: t({
        en: "Automatic Detection",
        fr: "Détection automatique",
        es: "Detección automática",
      }),
      automaticDetectionDescription: t({
        en: "Automatically detect language from browser settings",
        fr: "Détecter automatiquement la langue à partir des paramètres du navigateur",
        es: "Detectar automáticamente el idioma desde la configuración del navegador",
      }),
    },

    // Common Actions
    actions: {
      save: t({
        en: "Save",
        fr: "Enregistrer",
        es: "Guardar",
      }),
      cancel: t({
        en: "Cancel",
        fr: "Annuler",
        es: "Cancelar",
      }),
      close: t({
        en: "Close",
        fr: "Fermer",
        es: "Cerrar",
      }),
      confirm: t({
        en: "Confirm",
        fr: "Confirmer",
        es: "Confirmar",
      }),
      reset: t({
        en: "Reset",
        fr: "Réinitialiser",
        es: "Restablecer",
      }),
    },
  },
} satisfies DeclarationContent;

export default localeUiContent;
