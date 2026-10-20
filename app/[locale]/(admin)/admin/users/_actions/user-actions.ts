"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { USER_ADMIN_MESSAGES, changeUserRole, setUserBan } from "@/lib/services/user-admin";

export type UserActionState = { ok: boolean; message: string } | null;

/** Only an administrator may touch another account; the check is repeated here, the page guard is not enough. */
async function adminId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.role === "ADMIN" ? session.user.id : null;
}

function refresh(userId: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/community/users");
}

export async function changeRoleAction(_previous: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await adminId();
  if (!actor) return { ok: false, message: "Réservé aux administrateurs." };

  const userId = String(formData.get("userId") ?? "");
  const result = await changeUserRole(actor, userId, String(formData.get("role") ?? ""));
  if (!result.ok) return { ok: false, message: USER_ADMIN_MESSAGES[result.code] };

  refresh(userId);
  return { ok: true, message: "Rôle mis à jour." };
}

export async function setBanAction(_previous: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await adminId();
  if (!actor) return { ok: false, message: "Réservé aux administrateurs." };

  const userId = String(formData.get("userId") ?? "");
  const banned = formData.get("banned") === "true";
  const result = await setUserBan(actor, userId, banned);
  if (!result.ok) return { ok: false, message: USER_ADMIN_MESSAGES[result.code] };

  refresh(userId);
  return { ok: true, message: banned ? "Compte suspendu de la communauté." : "Suspension levée." };
}
