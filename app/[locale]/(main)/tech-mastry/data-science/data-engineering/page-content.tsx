"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  ArrowRight,
  Workflow,
  HardDrive,
  Layers,
} from "lucide-react";

/* ─────────── ETL Pipeline Visualizer ─────────── */
function ETLPipelineViz() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      name: "Extract",
      icon: Database,
      color: "text-blue-500 bg-blue-500/10",
      sources: ["PostgreSQL", "REST API", "S3 (CSV/JSON)", "Kafka Stream"],
      desc: "Extraction depuis des sources hétérogènes — batch ou streaming",
      code: `# PySpark 4 - Extraction (ANSI SQL activé par défaut, Spark Connect disponible)\ndf = spark.read.format("jdbc").option("url", jdbc_url).option("dbtable", "users").load()\napi_df = spark.read.json("s3a://bucket/raw/events/*.json")`,
    },
    {
      name: "Transform",
      icon: Workflow,
      color: "text-amber-500 bg-amber-500/10",
      sources: ["Nettoyage", "Jointures", "Agrégations", "Feature Engineering"],
      desc: "Transformation : nettoyage, enrichissement, normalisation",
      code: `# Transformations\nfrom pyspark.sql import functions as F\ndf_clean = df.dropna(subset=["email"]).filter(F.col("age") > 0)\ndf_enriched = df_clean.join(dim_country, "country_code", "left")\ndf_agg = df_enriched.groupBy("country").agg(F.count("*").alias("user_count"))`,
    },
    {
      name: "Load",
      icon: HardDrive,
      color: "text-green-500 bg-green-500/10",
      sources: ["Data Warehouse", "Data Lake", "Feature Store", "Dashboard"],
      desc: "Chargement dans les systèmes cibles — optimisé et partitionné",
      code: `# Chargement partitionné\ndf_agg.write.mode("overwrite").partitionBy("country").parquet("s3a://warehouse/users/")\n# Ou vers un DWH\ndf_agg.write.format("bigquery").option("table", "analytics.user_stats").save()`,
    },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Workflow className="w-5 h-5 text-amber-500" />
        Pipeline ETL Interactif
      </div>

      {/* Step selector */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.name} className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                activeStep === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{s.name}</span>
            </button>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Active step detail */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {steps[activeStep].desc}
          </p>
          <div className="space-y-2">
            <span className="text-xs font-semibold">Sources / Cibles :</span>
            <div className="flex flex-wrap gap-2">
              {steps[activeStep].sources.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <pre className="bg-muted/30 rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto" tabIndex={0}>
          {steps[activeStep].code}
        </pre>
      </div>
    </Card>
  );
}

/* ─────────── Data Architecture Visualizer ─────────── */
function DataArchitectureViz() {
  const [arch, setArch] = useState<"lakehouse" | "warehouse" | "lake">(
    "lakehouse",
  );

  const architectures = {
    lakehouse: {
      name: "Lakehouse (Moderne)",
      layers: [
        {
          name: "Bronze (Raw)",
          desc: "Données brutes ingérées telles quelles",
          color: "bg-amber-800/20 border-amber-700/30",
        },
        {
          name: "Silver (Cleaned)",
          desc: "Nettoyées, validées, dé-dupliquées",
          color: "bg-gray-400/20 border-gray-400/30",
        },
        {
          name: "Gold (Business)",
          desc: "Agrégées, prêtes pour l'analyse",
          color: "bg-yellow-500/20 border-yellow-500/30",
        },
      ],
      tech: ["Delta Lake", "Apache Iceberg", "Databricks", "Spark"],
    },
    warehouse: {
      name: "Data Warehouse (Classique)",
      layers: [
        {
          name: "Staging",
          desc: "Zone temporaire d'atterrissage",
          color: "bg-blue-500/20 border-blue-500/30",
        },
        {
          name: "ODS",
          desc: "Operational Data Store",
          color: "bg-cyan-500/20 border-cyan-500/30",
        },
        {
          name: "DWH",
          desc: "Schéma en étoile / flocon",
          color: "bg-indigo-500/20 border-indigo-500/30",
        },
        {
          name: "Data Marts",
          desc: "Vues métier spécialisées",
          color: "bg-violet-500/20 border-violet-500/30",
        },
      ],
      tech: ["BigQuery", "Snowflake", "Redshift", "Databricks SQL"],
    },
    lake: {
      name: "Data Lake",
      layers: [
        {
          name: "Raw Zone",
          desc: "Données brutes (tous formats)",
          color: "bg-green-500/20 border-green-500/30",
        },
        {
          name: "Processed Zone",
          desc: "Données nettoyées en Parquet/ORC",
          color: "bg-teal-500/20 border-teal-500/30",
        },
        {
          name: "Curated Zone",
          desc: "Prêtes pour la consommation",
          color: "bg-emerald-500/20 border-emerald-500/30",
        },
      ],
      tech: ["S3/GCS/ADLS", "Hadoop/HDFS", "Hive", "Presto/Trino"],
    },
  };

  const current = architectures[arch];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Layers className="w-5 h-5 text-cyan-500" />
        Architecture de données
      </div>

      <div className="flex gap-2">
        {(["lakehouse", "warehouse", "lake"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setArch(a)}
            className={`px-3 py-1.5 rounded text-xs border ${arch === a ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground"}`}
          >
            {architectures[a].name.split(" (")[0]}
          </button>
        ))}
      </div>

      <h3 className="font-semibold text-sm">{current.name}</h3>

      <div className="flex items-center gap-2 flex-wrap">
        {current.layers.map((l, i) => (
          <div key={l.name} className="flex items-center gap-2">
            <div
              className={`px-4 py-3 rounded-lg border ${l.color} space-y-0.5`}
            >
              <div className="text-xs font-semibold">{l.name}</div>
              <div className="text-[10px] text-muted-foreground">{l.desc}</div>
            </div>
            {i < current.layers.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {current.tech.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

/* ─────────── Main Page ─────────── */
const bigDataTools = [
  {
    name: "Apache Spark",
    cat: "Processing",
    desc: "Traitement distribué in-memory, batch + streaming",
    color: "text-orange-400",
  },
  {
    name: "Apache Kafka",
    cat: "Streaming",
    desc: "Event streaming, pub/sub, connecteurs",
    color: "text-blue-400",
  },
  {
    name: "Apache Airflow",
    cat: "Orchestration",
    desc: "DAGs, assets, scheduling, monitoring de pipelines (Airflow 3)",
    color: "text-teal-400",
  },
  {
    name: "dbt",
    cat: "Transformation",
    desc: "Transformation SQL dans l'entrepôt (le T de ELT), tests, documentation",
    color: "text-green-400",
  },
  {
    name: "Apache Flink",
    cat: "Streaming",
    desc: "Stream processing temps réel, event-driven",
    color: "text-red-400",
  },
  {
    name: "Presto/Trino",
    cat: "Query Engine",
    desc: "SQL fédéré sur data lake, requêtes interactives",
    color: "text-purple-400",
  },
  {
    name: "Apache Iceberg",
    cat: "Table Format",
    desc: "ACID sur data lake, time travel, schema evolution",
    color: "text-cyan-400",
  },
  {
    name: "Great Expectations",
    cat: "Quality",
    desc: "Validation de données, règles de qualité, alertes",
    color: "text-amber-400",
  },
];

const sqlConcepts = [
  {
    name: "Window Functions",
    code: "ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)",
    desc: "Classement, running totals, lag/lead",
  },
  {
    name: "CTE (Common Table Expr.)",
    code: "WITH ranked AS (SELECT ..., RANK() OVER(...) AS rk FROM ...)",
    desc: "Requêtes récursives, lisibilité",
  },
  {
    name: "MERGE / UPSERT",
    code: "MERGE INTO target USING source ON ... WHEN MATCHED THEN UPDATE ...",
    desc: "Sync incrémentale, SCD Type 2",
  },
  {
    name: "Partitioning",
    code: "CREATE TABLE events (...) PARTITION BY RANGE (event_date)",
    desc: "Performance sur grandes tables",
  },
];

const dataQuality = [
  {
    dimension: "Complétude",
    desc: "% de valeurs non-nulles",
    check: "NULL count < 1%",
  },
  {
    dimension: "Unicité",
    desc: "Pas de doublons sur les clés",
    check: "COUNT = COUNT DISTINCT",
  },
  {
    dimension: "Validité",
    desc: "Valeurs dans le domaine attendu",
    check: "Regex, enum, range",
  },
  {
    dimension: "Cohérence",
    desc: "Alignement entre sources",
    check: "Cross-source reconciliation",
  },
  {
    dimension: "Fraîcheur",
    desc: "Données à jour",
    check: "MAX(updated_at) < SLA",
  },
  {
    dimension: "Précision",
    desc: "Fidélité au monde réel",
    check: "Audit sampling",
  },
];

export default function DataEngineeringPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-500">
          <Database className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          Data Engineering
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pipelines de données, architectures data, Big Data, SQL avancé,
          qualité des données — construisez l&#39;infrastructure qui alimente
          les modèles ML et les dashboards.
        </p>
      </section>

      {/* Interactive Demos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Visualiseurs interactifs</h2>
        <ETLPipelineViz />
        <DataArchitectureViz />
      </section>

      {/* Big Data Tools */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Outils & Technologies</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {bigDataTools.map((t) => (
            <Card
              key={t.name}
              className="p-4 space-y-2 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm ${t.color}`}>{t.name}</h3>
                <Badge variant="outline" className="text-[10px]">
                  {t.cat}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Advanced SQL */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">SQL Avancé pour Data Engineers</h2>
        <div className="space-y-3">
          {sqlConcepts.map((s) => (
            <Card
              key={s.name}
              className="p-4 space-y-2 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{s.name}</h3>
                <span className="text-xs text-muted-foreground">{s.desc}</span>
              </div>
              <pre className="bg-muted/30 rounded p-2 text-xs font-mono text-primary overflow-x-auto" tabIndex={0}>
                {s.code}
              </pre>
            </Card>
          ))}
        </div>
      </section>

      {/* Data Quality */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">
          Dimensions de qualité des données
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold">Dimension</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Vérification
                </th>
              </tr>
            </thead>
            <tbody>
              {dataQuality.map((d) => (
                <tr
                  key={d.dimension}
                  className="border-t border-border/20 hover:bg-muted/20"
                >
                  <td className="px-4 py-2 font-medium">{d.dimension}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.desc}</td>
                  <td className="px-4 py-2 font-mono text-xs text-primary">
                    {d.check}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Airflow DAG Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Apache Airflow — DAG exemple</h2>
        <Card className="p-5">
          <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto font-mono text-foreground" tabIndex={0}>
            {`# Airflow 3 : l'API d'écriture des DAGs vit dans airflow.sdk
import pendulum
from datetime import timedelta
from airflow.sdk import Asset, dag, task
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator

users_gold = Asset("s3://warehouse/users/")  # asset : donnée produite par le pipeline

@dag(
    dag_id="daily_etl_pipeline",
    schedule="0 6 * * *",  # 6h UTC chaque jour (schedule_interval a été supprimé)
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    catchup=False,
    default_args={"owner": "data-team", "retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["etl", "production"],
)
def daily_etl_pipeline():
    extract = SparkSubmitOperator(
        task_id="extract_raw_data",
        application="spark_jobs/extract.py",
        conf={"spark.executor.memory": "4g"},
    )

    @task
    def validate() -> None:
        run_great_expectations()  # lève une exception si la qualité est insuffisante

    transform = SparkSubmitOperator(
        task_id="transform_to_gold",
        application="spark_jobs/transform.py",
    )

    @task(outlets=[users_gold])
    def load() -> None:
        load_to_bigquery()

    @task
    def notify() -> None:
        send_slack_notification()

    extract >> validate() >> transform >> load() >> notify()

daily_etl_pipeline()

# Un DAG aval peut se déclencher sur l'asset plutôt que sur une heure :
# @dag(schedule=[users_gold], ...)`}
          </pre>
        </Card>
      </section>
    </div>
  );
}
