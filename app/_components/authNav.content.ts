import { t, type Dictionary } from 'intlayer';

const authNavContent = {
  key: 'auth-nav',
  content: {
    connexion: t({
      fr: "Connexion",
      en: "Login",
      es: "Iniciar sesión",
    }),
    inscription: t({
      fr: "Inscription",
      en: "Register",
      es: "Registrarse",
    }),
  },
} satisfies Dictionary;

export default authNavContent;
