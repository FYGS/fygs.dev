# Operations wizards

Interactive scripts for the steps that only the owner can do (provider consoles, keys, firewall). Each one clears the screen at every
stage, opens the right page, captures what you copy, and asks for confirmation before anything irreversible. Re-running a wizard
remembers the values already entered (they live in `~/.config/fygs-dev/*.env`, mode 0600, never in the repository).

| Script | Issue | What it does |
|--------|-------|--------------|
| `rotate-secrets.sh` | #40 | Rotates every secret that is in the git history: session secret, database password, Gmail app password, Google and GitHub OAuth secrets, Stripe keys, OpenAI key. Old values stay valid until the new ones are checked, except the database password (two back-to-back stages). Applies the new values to Coolify (live site and `fygs-v2`) through its API and proves at the end that the old ones are dead. |
| `purge-env-history.sh` | #40 | Removes the `.env*` files from the whole git history (`git filter-repo`) after a mirror backup, with two confirmations before the force-push. Run it only after the rotation. |
| `harden-firewall.sh` | #41 | Makes SSH (22), the Coolify dashboard (8000) and its realtime and terminal ports (6001, 6002) reachable only from your admin addresses, over SSH. Measures every site of the shared server before and after, installs the rules with an automatic undo after 2 minutes unless a fresh SSH connection proves access, then persists them (systemd) and optionally hardens sshd. |
| `server/fygs-firewall.sh` | #41 | The script that runs on the server (copied by the wizard). Ports published by Docker are filtered in `DOCKER-USER` on their original destination port (ufw does not see them); private ranges always pass because Coolify reaches the host's SSH from its own container. |

Order: `rotate-secrets.sh` first, `purge-env-history.sh` after, `harden-firewall.sh` any time (it does not depend on the others).

Run them from a terminal with bash (Git Bash on Windows works): `bash scripts/ops/rotate-secrets.sh`.

Checked: `bash -n` on all of them, and `server/fygs-firewall.sh` in a throw-away Linux container with real netfilter (apply, idempotent
re-apply, refusal of an empty list, the automatic undo, the keep file that cancels it, save and boot-time apply, removal without residue).
Not checked: a real packet being dropped, and any provider console step (they follow the providers' documented flows and say so when
the screen may differ).
