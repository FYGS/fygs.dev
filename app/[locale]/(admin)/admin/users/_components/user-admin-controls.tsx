"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { changeRoleAction, setBanAction, type UserActionState } from "../_actions/user-actions";

const ROLES = [
  { value: "STUDENT", label: "Étudiant" },
  { value: "INSTRUCTOR", label: "Instructeur" },
  { value: "ADMIN", label: "Administrateur" },
];

function Feedback({ state }: { state: UserActionState }) {
  if (!state) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-green-500" : "text-red-400"}`}>
      {state.message}
    </p>
  );
}

/** Role and community-ban controls for one account. Everything is checked again on the server. */
export function UserAdminControls({
  userId,
  role,
  isBanned,
  isSelf,
}: {
  userId: string;
  role: string;
  isBanned: boolean;
  isSelf: boolean;
}) {
  const [roleState, roleAction, rolePending] = useActionState(changeRoleAction, null);
  const [banState, banAction, banPending] = useActionState(setBanAction, null);

  if (isSelf) {
    return <p className="text-sm text-muted-foreground">C&apos;est votre compte : son rôle ne peut pas être modifié ici.</p>;
  }

  return (
    <div className="space-y-6">
      <form action={roleAction} className="space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <label htmlFor="role" className="text-sm font-medium">
          Rôle
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="role"
            name="role"
            defaultValue={role}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={rolePending}>
            {rolePending ? "Enregistrement…" : "Enregistrer le rôle"}
          </Button>
        </div>
        <Feedback state={roleState} />
      </form>

      <form action={banAction} className="space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="banned" value={String(!isBanned)} />
        <p className="text-sm font-medium">Communauté</p>
        <p className="text-sm text-muted-foreground">
          {isBanned
            ? "Ce compte est suspendu : il ne peut plus publier, répondre, voter ni suivre."
            : "Une suspension empêche d'écrire dans la communauté ; le compte garde l'accès à ses formations."}
        </p>
        <Button type="submit" variant={isBanned ? "outline" : "destructive"} disabled={banPending}>
          {banPending ? "Enregistrement…" : isBanned ? "Lever la suspension" : "Suspendre de la communauté"}
        </Button>
        <Feedback state={banState} />
      </form>
    </div>
  );
}
