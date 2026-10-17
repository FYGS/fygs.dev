import { readFileSync } from "node:fs";

import { expect } from "@playwright/test";

export interface CapturedMail {
  to: string;
  subject: string;
  html: string;
  at: string;
}

function all(): CapturedMail[] {
  const file = process.env.E2E_MAIL_FILE;
  if (!file) throw new Error("E2E_MAIL_FILE is not set (use pnpm test:e2e)");
  return readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CapturedMail);
}

/** Waits for a message to `to` and returns its first link whose href matches `linkPattern`. */
export async function waitForLink(to: string, linkPattern: RegExp): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      () => {
        for (const mail of all().filter((m) => m.to.toLowerCase() === to.toLowerCase()).reverse()) {
          const hrefs = [...mail.html.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
          link = hrefs.find((h) => linkPattern.test(h));
          if (link) return link;
        }
        return undefined;
      },
      { message: `a mail to ${to} with a link matching ${linkPattern}`, timeout: 20_000 },
    )
    .toBeTruthy();
  return link!.replace(/&amp;/g, "&");
}

/** Waits for any message to `to` and returns it. */
export async function waitForMail(to: string): Promise<CapturedMail> {
  let mail: CapturedMail | undefined;
  await expect
    .poll(
      () => {
        mail = all().find((m) => m.to.toLowerCase() === to.toLowerCase());
        return mail;
      },
      { message: `a mail to ${to}`, timeout: 20_000 },
    )
    .toBeTruthy();
  return mail!;
}
