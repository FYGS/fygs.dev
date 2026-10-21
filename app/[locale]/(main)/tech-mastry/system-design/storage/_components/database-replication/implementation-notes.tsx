export function ImplementationNotes() {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 rounded-lg border bg-card">
        <h4 className="font-medium mb-3">
          Exemples d&apos;implémentation
        </h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium mb-2">
              MySQL (Master-Slave)
            </h5>
            <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto" tabIndex={0}>
              {`# Configuration sur le master (my.cnf)
server-id=1
log_bin=mysql-bin
binlog_format=ROW

# Configuration sur le slave (my.cnf)
server-id=2
relay-log=relay-bin

# Commande sur le slave pour démarrer la réplication
CHANGE MASTER TO
  MASTER_HOST='master_ip',
  MASTER_USER='repl_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=4;

START SLAVE;`}
            </pre>
          </div>

          <div>
            <h5 className="text-sm font-medium mb-2">
              PostgreSQL (Streaming Replication)
            </h5>
            <pre className="text-xs p-3 bg-slate-800 rounded border overflow-auto" tabIndex={0}>
              {`# Configuration sur le primary (postgresql.conf)
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64

# Configuration sur le standby (recovery.conf)
primary_conninfo = 'host=primary_ip port=5432 user=repl_user password=password'
standby_mode = 'on'`}
            </pre>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-card">
        <h4 className="font-medium mb-3">
          Compromis et Considérations
        </h4>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Théorème CAP</div>
            <p className="text-xs text-muted-foreground">
              Impossible d&apos;avoir simultanément la Cohérence, la
              Disponibilité et la Tolérance au Partitionnement. La
              réplication synchrone favorise la cohérence, tandis que
              l&apos;asynchrone favorise la disponibilité.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">
              Latence et Distance Géographique
            </div>
            <p className="text-xs text-muted-foreground">
              La réplication synchrone devient problématique sur de
              longues distances en raison de la latence réseau. Pour
              les déploiements multi-régions, l&apos;asynchrone ou
              semi-synchrone est souvent préférable.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">
              Gestion des Conflits
            </div>
            <p className="text-xs text-muted-foreground">
              Dans les configurations multi-master, les conflits
              d&apos;écriture sont inévitables. Des stratégies comme
              les horloges vectorielles, les timestamps ou les règles
              métier sont nécessaires pour les résoudre.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">
              Promotion Automatique
            </div>
            <p className="text-xs text-muted-foreground">
              En cas de défaillance du master, un mécanisme de
              failover est nécessaire pour promouvoir un slave. Cela
              peut être automatique (avec un service de découverte) ou
              manuel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
