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
    accountMenu: t({
      fr: "Menu du compte",
      en: "Account menu",
      es: "Menú de la cuenta",
    }),
  },
} satisfies Dictionary;

export default authNavContent;
