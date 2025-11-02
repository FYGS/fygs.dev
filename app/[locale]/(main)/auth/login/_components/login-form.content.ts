import { t, type Dictionary } from "intlayer";

const loginFormContent = {
  key: "login-form",
  content: {
    social: {
      github: t({
        en: "Continue with GitHub",
        fr: "Continuer avec GitHub",
        es: "Continuar con GitHub",
      }),
      google: t({
        en: "Continue with Google",
        fr: "Continuer avec Google",
        es: "Continuar con Google",
      }),
      separator: t({
        en: "Or continue with",
        fr: "Ou continuer avec",
        es: "O continuar con",
      }),
    },
    form: {
      email: {
        label: t({
          en: "Email",
          fr: "Email",
          es: "Correo electrónico",
        }),
        placeholder: t({
          en: "your@email.com",
          fr: "votre@email.com",
          es: "tu@correo.com",
        }),
        error: {
          invalid: t({
            en: "Invalid email",
            fr: "Email invalide",
            es: "Correo electrónico inválido",
          }),
        },
      },
      password: {
        label: t({
          en: "Password",
          fr: "Mot de passe",
          es: "Contraseña",
        }),
        placeholder: t({
          en: "••••••••",
          fr: "••••••••",
          es: "••••••••",
        }),
        error: {
          minLength: t({
            en: "Password must contain at least 6 characters",
            fr: "Le mot de passe doit contenir au moins 6 caractères",
            es: "La contraseña debe contener al menos 6 caracteres",
          }),
        },
      },
      submit: {
        idle: t({
          en: "Sign in",
          fr: "Se connecter",
          es: "Iniciar sesión",
        }),
        loading: t({
          en: "Signing in...",
          fr: "Connexion...",
          es: "Iniciando sesión...",
        }),
      },
    },
    links: {
      forgotPassword: t({
        en: "Forgot password?",
        fr: "Mot de passe oublié ?",
        es: "¿Olvidaste tu contraseña?",
      }),
      resendVerification: t({
        en: "Resend verification email",
        fr: "Renvoyer l'email de vérification",
        es: "Reenviar correo de verificación",
      }),
    },
    messages: {
      success: {
        title: t({
          en: "Sign in successful!",
          fr: "Connexion réussie !",
          es: "¡Inicio de sesión exitoso!",
        }),
        description: t({
          en: "Redirecting...",
          fr: "Redirection en cours...",
          es: "Redirigiendo...",
        }),
      },
      error: {
        generic: t({
          en: "An error occurred",
          fr: "Une erreur s'est produite",
          es: "Ocurrió un error",
        }),
        socialLogin: t({
          en: "Error signing in with",
          fr: "Erreur lors de la connexion avec",
          es: "Error al iniciar sesión con",
        }),
      },
      verificationSent: {
        title: t({
          en: "Verification email resent!",
          fr: "Email de vérification renvoyé !",
          es: "¡Correo de verificación reenviado!",
        }),
        description: t({
          en: "If an account exists for this email, a link has been sent.",
          fr: "Si un compte existe pour cet email, un lien a été envoyé.",
          es: "Si existe una cuenta para este correo, se ha enviado un enlace.",
        }),
      },
      verificationError: {
        title: t({
          en: "Error sending email",
          fr: "Erreur lors de l'envoi",
          es: "Error al enviar correo",
        }),
        description: t({
          en: "Error sending email",
          fr: "Erreur lors de l'envoi",
          es: "Error al enviar correo",
        }),
      },
    },
  },
} satisfies Dictionary;

export default loginFormContent;
