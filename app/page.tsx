import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Root page - redirects to localized version
 * This serves as a fallback if middleware doesn't catch the redirect
 */
export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  // Detect locale from Accept-Language header
  let locale = "fr"; // default

  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().split("-")[0]);

    const availableLocales = ["fr", "en", "es"];
    for (const lang of languages) {
      if (availableLocales.includes(lang)) {
        locale = lang;
        break;
      }
    }
  }

  redirect(`/${locale}`);
}
