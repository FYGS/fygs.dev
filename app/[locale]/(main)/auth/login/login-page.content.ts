import { t, type Dictionary } from "intlayer";

const loginPageContent = {
  key: "login-page",
  content: {
    metadata: {
      title: t({
        en: "Sign in | FYGS Learning Platform",
        fr: "Connexion | FYGS Learning Platform",
        es: "Iniciar sesión | FYGS Learning Platform",
      }),
      description: t({
        en: "Sign in to your account to access your courses.",
        fr: "Connectez-vous à votre compte pour accéder à vos formations.",
        es: "Inicia sesión en tu cuenta para acceder a tus cursos.",
      }),
    },
    title: t({
      en: "Sign in",
      fr: "Se connecter",
      es: "Iniciar sesión",
    }),
    subtitle: t({
      en: "Access your FYGS Learning Platform account",
      fr: "Accédez à votre compte FYGS Learning Platform",
      es: "Accede a tu cuenta de FYGS Learning Platform",
    }),
    noAccount: t({
      en: "Don't have an account yet?",
      fr: "Pas encore de compte ?",
      es: "¿Aún no tienes cuenta?",
    }),
    signUpLink: t({
      en: "Sign up",
      fr: "S'inscrire",
      es: "Registrarse",
    }),
  },
} satisfies Dictionary;

export default loginPageContent;
