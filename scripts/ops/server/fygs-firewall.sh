#!/bin/sh
# Admin-only ports for the shared Coolify VPS (issue #41). Runs ON THE SERVER, as root.
#
#   fygs-firewall.sh apply "<ip-or-cidr> <ip-or-cidr> ..."   install the rules for these admin addresses
#   fygs-firewall.sh apply-guarded "<addresses>" [seconds]  same, and undo itself after N seconds (default 120)
#                                                           unless /run/fygs-fw-keep exists: protects against a lock-out
#   fygs-firewall.sh apply-from-conf                         apply the addresses saved in /etc/fygs-firewall.conf (boot)
#   fygs-firewall.sh save "<addresses>"                      save the addresses for the next boot
#   fygs-firewall.sh rollback                                remove every rule added here
#   fygs-firewall.sh status                                  show the chain and its packet counters
#
# What it does
#   - Ports published by Docker (8000 Coolify dashboard, 6001 realtime and 6002 terminal) are filtered in DOCKER-USER, matched on the
#     ORIGINAL destination port (ufw and INPUT rules do not see them: Docker NATs them in front of INPUT).
#   - SSH (22) is a host service: filtered in INPUT.
#   - Private ranges and loopback always pass: Coolify reaches the host's SSH from its own container (host.docker.internal),
#     and the containers talk to each other through these ports.
#   - 80 and 443 stay public (Traefik). Nothing else is touched.
set -eu

CHAIN=FYGS-ADMIN
DOCKER_PORTS="8000 6001 6002"
HOST_PORTS="22"
CONF=/etc/fygs-firewall.conf
KEEP=/run/fygs-fw-keep
PRIVATE="127.0.0.0/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16"

have6() { command -v ip6tables >/dev/null 2>&1 && [ -e /proc/net/if_inet6 ]; }

wait_docker_user() {
  i=0
  while ! iptables -n -L DOCKER-USER >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -gt 60 ] && { iptables -N DOCKER-USER; break; }
    sleep 1
  done
}

remove_v4() {
  for p in $DOCKER_PORTS; do
    while iptables -D DOCKER-USER -p tcp -m conntrack --ctstate NEW --ctorigdstport "$p" -j "$CHAIN" 2>/dev/null; do :; done
  done
  for p in $HOST_PORTS; do
    while iptables -D INPUT -p tcp --dport "$p" -m conntrack --ctstate NEW -j "$CHAIN" 2>/dev/null; do :; done
  done
  iptables -F "$CHAIN" 2>/dev/null || true
  iptables -X "$CHAIN" 2>/dev/null || true
}

remove_v6() {
  have6 || return 0
  for p in $DOCKER_PORTS $HOST_PORTS; do
    while ip6tables -D INPUT -p tcp --dport "$p" -m conntrack --ctstate NEW -j "$CHAIN" 2>/dev/null; do :; done
  done
  ip6tables -F "$CHAIN" 2>/dev/null || true
  ip6tables -X "$CHAIN" 2>/dev/null || true
}

apply_rules() {
  v4=""; v6=""
  for a in $1; do
    case "$a" in
      *:*) v6="$v6 $a" ;;
      *) v4="$v4 $a" ;;
    esac
  done
  [ -n "$v4$v6" ] || { echo "no admin address given: refusing (it would lock everyone out)" >&2; exit 2; }

  wait_docker_user
  remove_v4
  iptables -N "$CHAIN"
  for r in $PRIVATE; do iptables -A "$CHAIN" -s "$r" -j RETURN; done
  for a in $v4; do iptables -A "$CHAIN" -s "$a" -j RETURN; done
  iptables -A "$CHAIN" -j DROP
  for p in $DOCKER_PORTS; do
    iptables -I DOCKER-USER 1 -p tcp -m conntrack --ctstate NEW --ctorigdstport "$p" -j "$CHAIN"
  done
  for p in $HOST_PORTS; do
    iptables -I INPUT 1 -p tcp --dport "$p" -m conntrack --ctstate NEW -j "$CHAIN"
  done

  # IPv6: Docker's userland proxy answers on [::] and those packets do reach INPUT, so filter all the ports there
  if have6; then
    remove_v6
    ip6tables -N "$CHAIN"
    ip6tables -A "$CHAIN" -s ::1/128 -j RETURN
    ip6tables -A "$CHAIN" -s fe80::/10 -j RETURN
    ip6tables -A "$CHAIN" -s fc00::/7 -j RETURN
    for a in $v6; do ip6tables -A "$CHAIN" -s "$a" -j RETURN; done
    ip6tables -A "$CHAIN" -j DROP
    for p in $DOCKER_PORTS $HOST_PORTS; do
      ip6tables -I INPUT 1 -p tcp --dport "$p" -m conntrack --ctstate NEW -j "$CHAIN"
    done
  fi
  echo "rules installed for:$v4$v6"
}

case "${1:-}" in
  apply)
    apply_rules "${2:-}"
    ;;
  apply-guarded)
    secs="${3:-120}"
    rm -f "$KEEP"
    apply_rules "${2:-}"
    # Dead-man switch: unless a second, fresh SSH connection created $KEEP, the rules are removed
    nohup sh -c "sleep $secs; [ -e $KEEP ] || $0 rollback" >/dev/null 2>&1 &
    echo "rollback in ${secs}s unless $KEEP exists"
    ;;
  apply-from-conf)
    [ -r "$CONF" ] || { echo "no $CONF" >&2; exit 2; }
    # shellcheck disable=SC1090
    . "$CONF"
    apply_rules "${ADMIN_ADDRESSES:-}"
    ;;
  save)
    umask 022
    printf 'ADMIN_ADDRESSES="%s"\n' "${2:-}" > "$CONF"
    echo "saved to $CONF"
    ;;
  rollback)
    remove_v4
    remove_v6
    echo "rules removed"
    ;;
  status)
    echo "--- IPv4 $CHAIN"; iptables -n -v -L "$CHAIN" 2>&1 || true
    echo "--- hooks"; iptables -n -v -L DOCKER-USER 2>&1 | head -12; iptables -n -v -L INPUT 2>&1 | head -6
    if have6; then echo "--- IPv6 $CHAIN"; ip6tables -n -v -L "$CHAIN" 2>&1 || true; fi
    ;;
  *)
    sed -n '2,20p' "$0"
    exit 1
    ;;
esac
