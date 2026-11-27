# Operations wizards

Interactive scripts for the steps that only the owner can do (provider consoles, keys, firewall). Each one clears the screen at every
stage, opens the right page, captures what you copy, and asks for confirmation before anything irreversible. Re-running a wizard
remembers the values already entered (they live in `~/.config/fygs-dev/*.env`, mode 0600, never in the repository).

| Script | Issue | What it does |
|--------|-------|--------------|
| `rotate-secrets.sh` | #40 | Rotates the secrets of the git history that production still uses (checked 2026-11-27 by fingerprint against Coolify): Gmail app password, Google and GitHub OAuth secrets. Old values stay valid until the new ones are checked in production. Applies them to the production app (`fygs`) through the Coolify API, never touches `STRIPE_*`, the database or the session secret (already different), then guides the revocation (Google, GitHub, Gmail, OpenAI) and checks that the old Stripe keys answer 401. |
| `purge-env-history.sh` | #40 | Removes the `.env*` files from the whole git history (`git filter-repo`) after a mirror backup, with two confirmations before the force-push. Run it only after the rotation. |
| `harden-firewall.sh` | #41 | Makes SSH (22), the Coolify dashboard (8000) and its realtime and terminal ports (6001, 6002) reachable only from your admin addresses, over SSH. Measures every site of the shared server before and after, installs the rules with an automatic undo after 2 minutes unless a fresh SSH connection proves access, then persists them (systemd) and optionally hardens sshd. |
| `server/fygs-firewall.sh` | #41 | The script that runs on the server (copied by the wizard). Ports published by Docker are filtered in `DOCKER-USER` on their original destination port (ufw does not see them); private ranges always pass because Coolify reaches the host's SSH from its own container. |
| `server/fygs-cloudflare-origin.sh` | #42 | Runs on the server (installed in `/usr/local/sbin`). One Traefik file-provider router (priority 10000) for `fygs.dev` and `www.fygs.dev` with an `ipAllowList` of Cloudflare's published ranges: any other client gets 403 on the origin. Other hosts and Coolify's labels are untouched. `apply`, `apply-guarded`, `refresh` (weekly systemd timer `fygs-cf-refresh`), `rollback`, `status`. Limit: another Cloudflare customer can still reach it with `Host: fygs.dev`; closing that needs a secret header added by a Cloudflare rule. |

Order: `rotate-secrets.sh` first, `purge-env-history.sh` after, `harden-firewall.sh` any time (it does not depend on the others).

Run them from a terminal with bash (Git Bash on Windows works): `bash scripts/ops/rotate-secrets.sh`.

Checked: `bash -n` on all of them, and `server/fygs-firewall.sh` in a throw-away Linux container with real netfilter (apply, idempotent
re-apply, refusal of an empty list, the automatic undo, the keep file that cancels it, save and boot-time apply, removal without residue).
Not checked: a real packet being dropped, and any provider console step (they follow the providers' documented flows and say so when
the screen may differ).
