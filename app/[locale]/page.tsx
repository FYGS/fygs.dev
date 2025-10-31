import type { FC } from "react";
import { type NextPageIntlayer } from "next-intlayer";
import { IntlayerServerProvider, useIntlayer } from "next-intlayer/server";
import { ServerComponentExample } from "@/components/ServerComponentExample";
import { ClientComponentExample } from "@/components/ClientComponentExample";

const PageContent: FC = () => {
  const content = useIntlayer("page");

  return (
    <>
      <p>{content.getStarted.main}</p>
      <code>{content.getStarted.pageLink}</code>
    </>
  );
};

const Page: NextPageIntlayer = async ({ params }) => {
  const { locale } = await params;

  return (
    <IntlayerServerProvider locale={locale}>
      <PageContent />
      <ServerComponentExample />

      <ClientComponentExample />
    </IntlayerServerProvider>
  );
};

export default Page;