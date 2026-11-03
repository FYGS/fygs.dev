import { promises as dns } from "node:dns";

/**
 * Disposable-address providers: services that hand out a mailbox for ten minutes, used to open accounts in bulk.
 * Best-effort list kept in the repository (no third-party call, no runtime download); it grows with the abuse seen.
 *
 *  - add domains with the `DISPOSABLE_EMAIL_EXTRA_DOMAINS` variable (comma separated) without a deploy of code;
 *  - exempt a domain wrongly listed with `EMAIL_DOMAIN_ALLOWLIST` (comma separated);
 *  - privacy relays (Apple "Hide My Email", SimpleLogin, DuckDuckGo) are NOT listed: people use them legitimately.
 * Only lowercase registrable domains; subdomains of a listed domain count too.
 */
const LISTED = [
  // Mailinator family
  "mailinator.com", "mailinator.net", "mailinator.org", "mailinator2.com", "mailinater.com", "notmailinator.com",
  "binkmail.com", "bobmail.info", "chammy.info", "devnullmail.com", "letthemeatspam.com", "reallymymail.com",
  "safetymail.info", "sogetthis.com", "spamhereplease.com", "streetwisemail.com", "suremail.info",
  "thisisnotmyrealemail.com", "tradermail.info", "veryrealemail.com", "zippymail.info", "tmailinator.com",
  // Guerrilla Mail
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz", "guerrillamail.de",
  "guerrillamail.info", "guerrillamailblock.com", "sharklasers.com", "grr.la", "pokemail.net", "spam4.me",
  // 10/20/30/60 minute mails
  "10minutemail.com", "10minutemail.net", "10minutemail.org", "10minutemail.co.uk", "10minutemail.de",
  "10minutemail.ru", "10minut.com.pl", "20minutemail.com", "30minutemail.com", "60minutemail.com",
  "30minutesmail.com", "20email.eu", "20mail.in", "20mail.it", "10mail.org",
  // Temp-mail and temporary mailboxes
  "tempmail.com", "temp-mail.org", "temp-mail.io", "temp-mail.ru", "tempmail.net", "tempmail.de", "tempmailo.com",
  "tempmailer.com", "tempmailer.de", "tempinbox.com", "tempinbox.co.uk", "tempemail.com", "tempemail.net",
  "tempemail.co.za", "tempmail.us.com", "tmpmail.net", "tmpmail.org", "tmpeml.com", "tempomail.fr",
  "temporaryemail.net", "temporaryemail.us", "temporaryforwarding.com", "temporaryinbox.com", "courrieltemporaire.com",
  "emailtemporanea.com", "emailtemporanea.net", "emailtemporario.com.br", "emailtemporal.org", "mytemp.email",
  "mytrashmail.com", "tempr.email", "tempsky.com", "tempail.com", "tempm.com", "tempmailaddress.com",
  // Throwaway
  "throwawaymail.com", "throwam.com", "throwawayemailaddress.com", "trashmail.com", "trashmail.net", "trashmail.de",
  "trashmail.me", "trashmail.org", "trashmail.io", "trashmail.at", "trashmail.ws", "trashmailer.com", "trashemail.de",
  "trash-mail.com", "trash-mail.de", "trash-mail.at", "easytrashmail.com", "mailmetrash.com",
  // Yopmail and French disposable aliases
  "yopmail.com", "yopmail.fr", "yopmail.net", "yopmail.org", "cool.fr.nf", "courriel.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "jetable.org", "jetable.net", "jetable.com", "fakemail.fr", "get2mail.fr",
  // German-speaking
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wegwerfemail.de", "wegwerf-email.de", "wegwerf-emails.de",
  "weg-werf-email.de", "einmalmail.de", "eintagsmail.de", "emaildienst.de", "emailgo.de", "dontsendmespam.de",
  "dumpmail.de", "fivemail.de", "gehensiemirnichtaufdensack.de", "ghosttexter.de", "schafmail.de", "sandelf.de",
  "smashmail.de", "spaminator.de", "spamoff.de", "spoofmail.de", "stuffmail.de", "trialmail.de", "twinmail.de",
  "zehnminuten.de", "zehnminutenmail.de", "brennendesreich.de", "byom.de", "curryworld.de", "delikkt.de",
  // Fake inboxes and generators
  "fakeinbox.com", "fakemailgenerator.com", "fake-mail.ml", "fakemailbox.com", "email-fake.com", "emailfake.com",
  "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com",
  "superrito.com", "teleworm.us",
  // Discard / drop / nada
  "dispostable.com", "discard.email", "discardmail.com", "discardmail.de", "maildrop.cc", "mailnesia.com",
  "mailnull.com", "mailcatch.com", "mailforspam.com", "mailmoat.com", "mailscrap.com", "mailshell.com",
  "mailsiphon.com", "mailtemp.info", "mailtothis.com", "mailzilla.com", "mailzilla.org", "getnada.com", "nada.email",
  "nada.ltd", "abyssmail.com", "mohmal.com", "mohmal.in", "mohmal.tech", "emailondeck.com", "dropmail.me",
  "1secmail.com", "1secmail.net", "1secmail.org", "esiix.com", "wwjmp.com", "xojxe.com", "yoggm.com", "kzccv.com",
  "qiott.com", "burnermail.io", "disposableaddress.com", "disposableemailaddresses.com", "disposableinbox.com",
  "dispose.it", "disposeamail.com", "disposemail.com", "deadaddress.com", "deadspam.com", "dump-email.info",
  "dumpandjunk.com", "dumpyemail.com", "dodgeit.com", "dodgit.com", "dodgit.org", "despam.it", "despammed.com",
  // Spam-themed
  "spamgourmet.com", "spamgourmet.net", "spamgourmet.org", "spamex.com", "spamfree24.com", "spamfree24.de",
  "spamfree24.org", "spamfree24.eu", "spamfree24.info", "spamfree24.net", "spamfree.eu", "spamavert.com",
  "spambox.us", "spambox.info", "spambog.com", "spambog.de", "spambog.ru", "spamcero.com", "spamcorptastic.com",
  "spamday.com", "spamevader.com", "spamgoes.in", "spamherelots.com", "spamhole.com", "spamify.com", "spamkill.info",
  "spaml.com", "spaml.de", "spammotel.com", "spamobox.com", "spamslicer.com", "spamspot.com", "spamstack.net",
  "spamthis.co.uk", "spamthisplease.com", "spamtrail.com", "spamtroll.net", "sendspamhere.com", "whyspam.me",
  "thanksnospam.info", "crapmail.org", "bugmenot.com", "bugmenever.com",
  // Anonymous and self-destructing
  "incognitomail.org", "incognitomail.com", "incognitomail.net", "anonbox.net", "anonymbox.com", "anonmails.de",
  "selfdestructingmail.com", "willselfdestruct.com", "e4ward.com", "objectmail.com", "oneoffemail.com",
  "oneoffmail.com", "onewaymail.com", "privacy.net", "privatdemail.net", "proxymail.eu", "rcpt.at", "recode.me",
  "recursor.net", "regbypass.com", "rmqkr.net", "shiftmail.com", "shitmail.me", "skeefmail.com", "slaskpost.se",
  "slopsbox.com", "smellfear.com", "snakemail.com", "soodonims.com", "supergreatmail.com", "supermailer.jp",
  "teewars.org", "thecloudindex.com", "tilien.com", "tittbit.in", "tizi.com", "toiea.com", "tokem.co", "trbvm.com",
  "trillianpro.com", "turual.com", "tyldd.com", "uggsrock.com", "umail.net", "upliftnow.com", "uplipht.com",
  "venompen.com", "viditag.com", "viralplays.com", "vkcode.ru", "vomoto.com", "vpn.st", "vsimcard.com", "vubby.com",
  "wasteland.rfc822.org", "webemail.me", "wetrainbayarea.com", "wh4f.org", "willhackforfood.biz", "winemaven.info",
  "wronghead.com", "wuzup.net", "wuzupmail.net", "xagloo.com", "xemaps.com", "xents.com", "xmaily.com", "xoxy.net",
  "yapped.net", "yep.it", "yogamaven.com", "yuurok.com", "zoemail.net", "zomg.info",
  // Numeric-prefixed and miscellaneous
  "0-mail.com", "0815.ru", "0clickemail.com", "0wnd.net", "0wnd.org", "10minutemail.cf", "123-m.com", "1chuan.com",
  "1pad.de", "2prong.com", "3d-painting.com", "4warding.com", "4warding.net", "4warding.org", "5ymail.com", "6ip.us",
  "6paq.com", "6url.com", "75hosting.com", "75hosting.net", "7days-printing.com", "7tags.com", "99experts.com",
  "9ox.net", "a-bc.net", "agedmail.com", "ama-trade.de", "amilegit.com", "amiri.net", "amiriindustries.com",
  "antichef.com", "antichef.net", "antireg.ru", "bareed.ws", "bccto.me", "beefmilk.com", "bigstring.com",
  "bio-muesli.info", "bio-muesli.net", "blackmarket.to", "bladesmail.net", "bloatbox.com", "bofthew.com", "boun.cr",
  "bouncr.com", "broadbandninja.com", "bsnow.net", "buffemail.com", "bumpymail.com", "bund.us", "cachedot.net",
  "casualdx.com", "cellurl.com", "centermail.com", "centermail.net", "chacuo.net", "chogmail.com", "choicemail1.com",
  "clixser.com", "cmail.club", "cosmorph.com", "crazymailing.com", "cubiclink.com", "cust.in", "d3p.dk",
  "dacoolest.com", "dandikmail.com", "dcemail.com", "deadchildren.org", "deadfake.cf", "dfgh.net",
  "digitalsanctuary.com", "dingbone.com", "dm.w3internet.co.uk", "donemail.ru", "dontreg.com", "drdrb.com",
  "drdrb.net", "emailias.com", "emailinfive.com", "emailmiser.com", "emailsensei.com", "emailthe.net", "emailtmp.com",
  "emailto.de", "emailwarden.com", "emailxfer.com", "emz.net", "enterto.com", "ephemail.net", "etranquil.com",
  "etranquil.net", "etranquil.org", "evopo.com", "explodemail.com", "express.net.ua", "eyepaste.com", "filzmail.com",
  "fixmail.tk", "fizmail.com", "flyspam.com", "footard.com", "forgetmail.com", "fr33mail.info", "frapmail.com",
  "front14.org", "fudgerub.com", "garliclife.com", "get1mail.com", "getairmail.com", "getmails.eu", "getonemail.com",
  "getonemail.net", "girlsundertheinfluence.com", "gishpuppy.com", "great-host.in", "greensloth.com", "gsrv.co.uk",
] as const;

const DISPOSABLE = new Set<string>(LISTED);

/** The listed domains (for tests and tooling). */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = DISPOSABLE;

function fromEnv(name: string): Set<string> {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** The domain of an address, lowercase, or null when the address has no usable domain. */
export function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
  return /^[a-z0-9.-]+\.[a-z0-9-]{2,}$/.test(domain) ? domain : null;
}

/** True when the address belongs to a listed disposable provider (or to a subdomain of one). */
export function isDisposableEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  const allowed = fromEnv("EMAIL_DOMAIN_ALLOWLIST");
  const extra = fromEnv("DISPOSABLE_EMAIL_EXTRA_DOMAINS");
  const labels = domain.split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join(".");
    if (allowed.has(candidate)) return false;
    if (DISPOSABLE.has(candidate) || extra.has(candidate)) return true;
  }
  return false;
}

const MX_TIMEOUT_MS = 2_000;
const NO_RECORD = new Set(["ENOTFOUND", "ENODATA"]);

/**
 * Whether `domain` can receive mail. Soft by design: only a definite "this domain has no mail exchanger and no address"
 * answer gives `false`. A timeout, a resolver failure or any doubt gives `true`, so a DNS hiccup never blocks a sign-up.
 */
export async function hasMailExchanger(domain: string): Promise<boolean> {
  const lookup = async (): Promise<boolean> => {
    try {
      const records = await dns.resolveMx(domain);
      if (records.length > 0) return true;
    } catch (error) {
      if (!NO_RECORD.has((error as NodeJS.ErrnoException).code ?? "")) return true;
    }
    // No MX: a domain with an address record still receives mail (implicit MX)
    for (const resolve of [dns.resolve4, dns.resolve6]) {
      try {
        if ((await resolve(domain)).length > 0) return true;
      } catch (error) {
        if (!NO_RECORD.has((error as NodeJS.ErrnoException).code ?? "")) return true;
      }
    }
    return false;
  };
  try {
    return await Promise.race([
      lookup(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(true), MX_TIMEOUT_MS)),
    ]);
  } catch {
    return true;
  }
}
