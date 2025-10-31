'use server';

import type { FC } from "react";
// import { useIntlayer } from "next-intlayer/server"; // Variante client mais non appelable dans async server components
import { getIntlayer } from "intlayer";

export const ServerComponentExample: FC = async () => {
  const content = getIntlayer("server-component-example"); // Crée la déclaration de contenu associée

  return (
    <div>
      <h2>{content.title}</h2>
      <p>{content.content}</p>
    </div>
  );
};