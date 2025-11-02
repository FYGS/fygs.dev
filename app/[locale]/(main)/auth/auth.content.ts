import { t, type Dictionary } from "intlayer";

const authContent = {
  key: "auth",
  content: {
    // Common
    common: {
      or: t({
        en: "Or",
        fr: "Ou",
        es: "O",
      }),
      loading: t({
        en: "Loading...",
        fr: "Chargement...",
        es: "Cargando...",
      }),
    },

    // Register page
    register: {
      title: t({
        en: "Create an account",
        fr: "Créer un compte",
        es: "Crear una cuenta",
      }),
      subtitle: t({
        en: "Join FYGS Learning Platform",
        fr: "Rejoignez FYGS Learning Platform",
        es: "Únete a FYGS Learning Platform",
      }),
      hasAccount: t({
        en: "Already have an account?",
        fr: "Vous avez déjà un compte ?",
        es: "¿Ya tienes una cuenta?",
      }),
      signInLink: t({
        en: "Sign in",
        fr: "Se connecter",
        es: "Iniciar sesión",
      }),
    },

    // Verify page
    verify: {
      title: t({
        en: "Verify your email",
        fr: "Vérifiez votre email",
        es: "Verifica tu correo",
      }),
      description: t({
        en: "We sent a verification link to",
        fr: "Nous avons envoyé un lien de vérification à",
        es: "Enviamos un enlace de verificación a",
      }),
      checkInbox: t({
        en: "Please check your inbox and click the verification link.",
        fr: "Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.",
        es: "Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
      }),
      notReceived: t({
        en: "Didn't receive the email?",
        fr: "Vous n'avez pas reçu l'email ?",
        es: "¿No recibiste el correo?",
      }),
      resend: t({
        en: "Resend",
        fr: "Renvoyer",
        es: "Reenviar",
      }),
      backToLogin: t({
        en: "Back to sign in",
        fr: "Retour à la connexion",
        es: "Volver al inicio de sesión",
      }),
    },

    // Forgot password
    forgotPassword: {
      title: t({
        en: "Forgot password?",
        fr: "Mot de passe oublié ?",
        es: "¿Olvidaste tu contraseña?",
      }),
      description: t({
        en: "Enter your email and we'll send you a reset link.",
        fr: "Entrez votre email et nous vous enverrons un lien de réinitialisation.",
        es: "Ingresa tu correo y te enviaremos un enlace de restablecimiento.",
      }),
      emailLabel: t({
        en: "Email",
        fr: "Email",
        es: "Correo electrónico",
      }),
      sendLink: t({
        en: "Send reset link",
        fr: "Envoyer le lien",
        es: "Enviar enlace",
      }),
      backToLogin: t({
        en: "Back to sign in",
        fr: "Retour à la connexion",
        es: "Volver al inicio de sesión",
      }),
      success: t({
        en: "Reset link sent! Check your email.",
        fr: "Lien envoyé ! Vérifiez votre email.",
        es: "¡Enlace enviado! Revisa tu correo.",
      }),
    },

    // Reset password
    resetPassword: {
      title: t({
        en: "Reset password",
        fr: "Réinitialiser le mot de passe",
        es: "Restablecer contraseña",
      }),
      description: t({
        en: "Enter your new password",
        fr: "Entrez votre nouveau mot de passe",
        es: "Ingresa tu nueva contraseña",
      }),
      newPassword: t({
        en: "New password",
        fr: "Nouveau mot de passe",
        es: "Nueva contraseña",
      }),
      confirmPassword: t({
        en: "Confirm password",
        fr: "Confirmer le mot de passe",
        es: "Confirmar contraseña",
      }),
      submit: t({
        en: "Reset password",
        fr: "Réinitialiser",
        es: "Restablecer",
      }),
      success: t({
        en: "Password reset successful!",
        fr: "Mot de passe réinitialisé !",
        es: "¡Contraseña restablecida!",
      }),
    },

    // Callback page
    callback: {
      title: t({
        en: "Signing in...",
        fr: "Connexion en cours...",
        es: "Iniciando sesión...",
      }),
      description: t({
        en: "Please wait while we complete your sign in.",
        fr: "Veuillez patienter pendant que nous finalisons votre connexion.",
        es: "Por favor espera mientras completamos tu inicio de sesión.",
      }),
    },

    // Error page
    error: {
      title: t({
        en: "Authentication error",
        fr: "Erreur d'authentification",
        es: "Error de autenticación",
      }),
      description: t({
        en: "An error occurred during authentication.",
        fr: "Une erreur s'est produite lors de l'authentification.",
        es: "Ocurrió un error durante la autenticación.",
      }),
      backToLogin: t({
        en: "Back to sign in",
        fr: "Retour à la connexion",
        es: "Volver al inicio de sesión",
      }),
      tryAgain: t({
        en: "Try again",
        fr: "Réessayer",
        es: "Intentar de nuevo",
      }),
    },
  },
} satisfies Dictionary;

export default authContent;
