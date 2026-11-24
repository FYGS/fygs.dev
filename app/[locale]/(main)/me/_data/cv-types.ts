import type { useIntlayer } from "next-intlayer/server";

// Localized dictionaries used by the /me page
export type CvPage = ReturnType<typeof useIntlayer<"cv-page">>;
export type CvData = ReturnType<typeof useIntlayer<"cv-data">>;
