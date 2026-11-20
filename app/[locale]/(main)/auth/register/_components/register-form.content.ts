import { t, type Dictionary } from "intlayer";

const registerFormContent = {
  key: "register-form",
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
        en: "Or sign up with",
        fr: "Ou s'inscrire avec",
        es: "O registrarse con",
      }),
    },
    form: {
      name: {
        label: t({
          en: "Full name",
          fr: "Nom complet",
          es: "Nombre completo",
        }),
        placeholder: t({
          en: "Your name",
          fr: "Votre nom",
          es: "Tu nombre",
        }),
        error: {
          minLength: t({
            en: "Name must contain at least 2 characters",
            fr: "Le nom doit contenir au moins 2 caractères",
            es: "El nombre debe contener al menos 2 caracteres",
          }),
        },
      },
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
            en: "Password must contain at least 12 characters",
            fr: "Le mot de passe doit contenir au moins 12 caractères",
            es: "La contraseña debe contener al menos 12 caracteres",
          }),
        },
      },
      confirmPassword: {
        label: t({
          en: "Confirm password",
          fr: "Confirmer le mot de passe",
          es: "Confirmar contraseña",
        }),
        placeholder: t({
          en: "••••••••",
          fr: "••••••••",
          es: "••••••••",
        }),
        error: {
          mismatch: t({
            en: "Passwords do not match",
            fr: "Les mots de passe ne correspondent pas",
            es: "Las contraseñas no coinciden",
          }),
        },
      },
      acceptTerms: {
        text: t({
          en: "I accept the",
          fr: "J'accepte les",
          es: "Acepto los",
        }),
        terms: t({
          en: "terms of service",
          fr: "conditions d'utilisation",
          es: "términos de servicio",
        }),
        and: t({
          en: "and the",
          fr: "et la",
          es: "y la",
        }),
        privacy: t({
          en: "privacy policy",
          fr: "politique de confidentialité",
          es: "política de privacidad",
        }),
        error: t({
          en: "You must accept the terms",
          fr: "Vous devez accepter les conditions",
          es: "Debes aceptar los términos",
        }),
      },
      submit: {
        idle: t({
          en: "Create my account",
          fr: "Créer mon compte",
          es: "Crear mi cuenta",
        }),
        loading: t({
          en: "Signing up...",
          fr: "Inscription...",
          es: "Registrando...",
        }),
      },
    },
    messages: {
      success: {
        title: t({
          en: "Sign up successful!",
          fr: "Inscription réussie !",
          es: "¡Registro exitoso!",
        }),
        description: t({
          en: "Check your email.",
          fr: "Vérifiez votre email.",
          es: "Revisa tu correo electrónico.",
        }),
      },
      error: {
        generic: t({
          en: "An error occurred during sign up",
          fr: "Une erreur s'est produite lors de l'inscription",
          es: "Ocurrió un error durante el registro",
        }),
        socialLogin: t({
          en: "Error signing in with",
          fr: "Erreur lors de la connexion avec",
          es: "Error al iniciar sesión con",
        }),
      },
    },
  },
} satisfies Dictionary;

export default registerFormContent;
