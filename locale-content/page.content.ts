import { t, type Dictionary } from "intlayer";

const pageContent = {
  key: "page",
  content: {
    getStarted: {
      main: t({
        fr: "Commencez par éditer",
        en: "Get started by editing",
        es: "Comience por editar",
      }),
      pageLink: "app/page.tsx",
    },
  },
} satisfies Dictionary;

export default pageContent;
