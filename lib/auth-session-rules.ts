import { db } from "./db";
import { isProviderSignInPath } from "./auth-policy";

/**
 * A provider (Google, GitHub) vouches for the person but is never asked for the second factor: if a session could be
 * opened that way for an account that has one, the factor would protect nothing. Such an account signs in with its
 * password and its code only. True when a session must NOT be opened.
 */
export async function mustRefuseSession(userId: string, path: string | undefined | null): Promise<boolean> {
  if (!isProviderSignInPath(path)) return false;
  const user = await db.user.findUnique({ where: { id: userId }, select: { twoFactorEnabled: true } });
  return Boolean(user?.twoFactorEnabled);
}
