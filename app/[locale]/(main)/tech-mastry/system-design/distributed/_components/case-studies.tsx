"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Building,
  Cloud,
  Code,
  Database,
  Globe,
  HardDrive,
  Layers,
  Server,
  Share2,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AirbnbArchitectureDiagram } from "./case-studies/airbnb-architecture-diagram";
import { AmazonArchitectureDiagram } from "./case-studies/amazon-architecture-diagram";
import { GoogleArchitectureDiagram } from "./case-studies/google-architecture-diagram";
import { MicrosoftArchitectureDiagram } from "./case-studies/microsoft-architecture-diagram";
import { NetflixArchitectureDiagram } from "./case-studies/netflix-architecture-diagram";
import { UberArchitectureDiagram } from "./case-studies/uber-architecture-diagram";

// Types for the case studies
interface CaseStudy {
  id: string;
  company: string;
  title: string;
  description: string;
  challenge: string;
  solution: string;
  architecture: string;
  technologies: string[];
  results: string;
  lessons: string[];
  icon: React.JSX.Element;
}

export function DistributedCaseStudies() {
  const [activeTab, setActiveTab] = useState("amazon");

  // Case studies data
  const caseStudies: CaseStudy[] = [
    {
      id: "amazon",
      company: "Amazon",
      title: "E-commerce à Grande Échelle",
      description:
        "Comment Amazon a construit une architecture distribuée pour gérer des millions de transactions commerciales et son infrastructure cloud AWS.",
      challenge:
        "Amazon devait créer une plateforme capable de gérer des pics de trafic massifs (comme le Black Friday), de traiter des millions de transactions simultanées, et de fournir des recommandations personnalisées en temps réel, tout en maintenant une haute disponibilité.",
      solution:
        "Amazon a développé une architecture orientée services (SOA) hautement distribuée, avec une infrastructure cloud élastique, des bases de données NoSQL pour la scalabilité horizontale, et des systèmes de mise en cache sophistiqués.",
      architecture:
        "L'architecture d'Amazon est basée sur le principe 'two-pizza teams' où chaque équipe gère ses propres services indépendants. Ils utilisent une combinaison de services AWS (EC2, S3, DynamoDB, etc.) avec des systèmes de file d'attente pour la communication asynchrone et des CDN pour la distribution de contenu.",
      technologies: [
        "AWS Cloud",
        "DynamoDB",
        "S3",
        "EC2",
        "Lambda",
        "SQS/SNS",
        "CloudFront",
        "ElasticSearch",
      ],
      results:
        "Amazon peut désormais traiter plus de 300 millions de commandes par jour lors des périodes de pointe, avec une disponibilité de 99,99% et des recommandations personnalisées qui augmentent significativement les ventes croisées.",
      lessons: [
        "Concevoir pour l'élasticité et la scalabilité horizontale",
        "Utiliser des bases de données NoSQL pour les charges de travail à grande échelle",
        "Implémenter des architectures sans état (stateless) pour faciliter la mise à l'échelle",
        "Adopter des systèmes de mise en cache à plusieurs niveaux",
        "Utiliser des files d'attente pour découpler les services et absorber les pics de charge",
      ],
      icon: <ShoppingCart className="h-5 w-5 text-orange-500" />,
    },
    {
      id: "netflix",
      company: "Netflix",
      title: "Scaling Video Streaming",
      description:
        "Comment Netflix a construit une architecture distribuée pour servir des millions d'utilisateurs simultanément.",
      challenge:
        "Netflix devait diffuser des vidéos à des millions d'utilisateurs dans le monde entier avec une faible latence, une haute disponibilité et une grande résilience face aux pannes.",
      solution:
        "Netflix a adopté une architecture de microservices entièrement hébergée dans le cloud AWS, avec un système de distribution de contenu (CDN) global et des mécanismes de résilience avancés.",
      architecture:
        "L'architecture de Netflix est composée de centaines de microservices indépendants qui communiquent via des API REST et des systèmes de messagerie asynchrone. Ils utilisent un modèle de déploiement multi-régions avec réplication des données.",
      technologies: [
        "AWS Cloud",
        "Microservices",
        "Cassandra",
        "Hystrix",
        "Eureka",
        "Zuul",
        "Chaos Monkey",
      ],
      results:
        "Netflix peut désormais servir plus de 200 millions d'abonnés dans 190 pays, avec une disponibilité de 99,99% et une expérience utilisateur fluide même pendant les pics d'utilisation.",
      lessons: [
        "Adopter une architecture de microservices pour une scalabilité indépendante",
        "Concevoir pour les pannes avec des disjoncteurs et l'ingénierie du chaos",
        "Utiliser des bases de données distribuées pour la résilience des données",
        "Automatiser le déploiement et les tests pour des mises à jour fréquentes",
        "Optimiser la distribution de contenu via un CDN global",
      ],
      icon: <Globe className="h-5 w-5 text-red-500" />,
    },
    {
      id: "google",
      company: "Google",
      title: "Moteur de Recherche et Traitement de Données Massives",
      description:
        "Comment Google a construit une architecture distribuée pour indexer le web et traiter des pétaoctets de données.",
      challenge:
        "Google devait indexer des milliards de pages web, traiter des requêtes de recherche en millisecondes, analyser des pétaoctets de données, et maintenir une infrastructure mondiale hautement disponible et économique.",
      solution:
        "Google a développé des technologies distribuées propriétaires comme MapReduce, BigTable, et Spanner, ainsi qu'un système de gestion de cluster appelé Borg pour orchestrer des millions de tâches sur des centaines de milliers de machines.",
      architecture:
        "L'architecture de Google est basée sur des clusters massifs de serveurs commodity hardware, avec des systèmes de stockage distribués (GFS, BigTable, Spanner), des frameworks de traitement de données (MapReduce, Flume), et des technologies d'indexation et de classement propriétaires (PageRank).",
      technologies: [
        "MapReduce",
        "BigTable",
        "Spanner",
        "Borg",
        "GFS",
        "Protocol Buffers",
        "PageRank",
        "TensorFlow",
      ],
      results:
        "Google peut désormais traiter plus de 8,5 milliards de requêtes de recherche par jour avec des temps de réponse inférieurs à 200ms, tout en indexant des centaines de milliards de pages web et en analysant des exaoctets de données.",
      lessons: [
        "Concevoir des systèmes distribués pour une échelle massive",
        "Utiliser des modèles de programmation simplifiés pour le traitement parallèle (MapReduce)",
        "Optimiser pour la latence et la disponibilité mondiale",
        "Développer des systèmes de stockage spécialisés pour différents cas d'usage",
        "Automatiser la gestion de l'infrastructure à grande échelle",
      ],
      icon: <Globe className="h-5 w-5 text-green-500" />,
    },
    {
      id: "uber",
      company: "Uber",
      title: "Système de Géolocalisation en Temps Réel",
      description:
        "Comment Uber a construit un système distribué pour gérer des millions de requêtes de localisation en temps réel.",
      challenge:
        "Uber devait créer un système capable de traiter des millions de mises à jour de localisation par seconde, de mettre en relation les chauffeurs et les passagers, et de calculer des itinéraires optimaux en temps réel.",
      solution:
        "Uber a développé une architecture distribuée géographiquement avec des systèmes de géolocalisation spécialisés, des bases de données géospatiales et un traitement d'événements en temps réel.",
      architecture:
        "L'architecture d'Uber utilise un modèle de sharding géographique, où les données sont partitionnées par région. Ils utilisent un système de messagerie pour le traitement des événements en temps réel et des bases de données optimisées pour les requêtes géospatiales.",
      technologies: [
        "Kafka",
        "Cassandra",
        "Redis",
        "PostgreSQL/PostGIS",
        "Elasticsearch",
        "Go",
        "Node.js",
      ],
      results:
        "Uber peut désormais traiter plus de 100 millions de requêtes de géolocalisation par jour avec une latence inférieure à 100 ms, permettant une mise en relation rapide entre chauffeurs et passagers.",
      lessons: [
        "Partitionner les données géographiquement pour réduire la latence",
        "Utiliser des bases de données spécialisées pour les requêtes géospatiales",
        "Implémenter un traitement d'événements en temps réel pour les mises à jour de localisation",
        "Concevoir des systèmes de secours pour la haute disponibilité",
        "Optimiser les algorithmes de mise en relation pour l'efficacité",
      ],
      icon: <Share2 className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "microsoft",
      company: "Microsoft",
      title: "Applications Cloud-Native sur Azure",
      description:
        "Comment Microsoft a construit une architecture distribuée multi-régions pour ses services cloud Azure.",
      challenge:
        "Microsoft devait créer une plateforme cloud capable de fournir des services à haute disponibilité dans le monde entier, avec une résilience aux pannes régionales, une latence minimale, et une conformité aux réglementations locales sur les données.",
      solution:
        "Microsoft a développé Azure comme une plateforme cloud multi-régions avec des services de réplication de données, des mécanismes de basculement automatique, et une architecture de microservices basée sur Kubernetes.",
      architecture:
        "L'architecture d'Azure est organisée en régions géographiquement distribuées, chacune contenant plusieurs zones de disponibilité. Les services sont conçus pour la résilience avec des bases de données géo-répliquées (Cosmos DB), des systèmes de messagerie (Event Hub), et des services de calcul élastiques (AKS).",
      technologies: [
        "Azure Kubernetes Service",
        "Cosmos DB",
        "Event Hub",
        "Azure Front Door",
        "Azure CDN",
        "Azure Active Directory",
        ".NET Core",
        "Service Fabric",
      ],
      results:
        "Microsoft Azure peut désormais offrir un SLA de 99,99% pour la plupart de ses services, avec une présence dans plus de 60 régions et une capacité à traiter des milliards de requêtes par jour.",
      lessons: [
        "Concevoir pour la résilience multi-régions dès le départ",
        "Utiliser des bases de données géo-répliquées pour la continuité des activités",
        "Implémenter des mécanismes de basculement automatique",
        "Adopter des architectures de microservices pour l'isolation des défaillances",
        "Optimiser la distribution du contenu pour réduire la latence mondiale",
      ],
      icon: <Cloud className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "airbnb",
      company: "Airbnb",
      title: "Moteur de Recherche et de Recommandation",
      description:
        "Comment Airbnb a construit un système de recherche et de recommandation distribué pour des millions de logements.",
      challenge:
        "Airbnb devait créer un moteur de recherche capable de filtrer et de classer des millions de logements selon de nombreux critères, tout en offrant des recommandations personnalisées et une expérience utilisateur réactive.",
      solution:
        "Airbnb a développé un système de recherche distribué basé sur Elasticsearch, combiné à des algorithmes d'apprentissage automatique pour les recommandations et un système de mise en cache sophistiqué.",
      architecture:
        "L'architecture de recherche d'Airbnb utilise un cluster Elasticsearch pour l'indexation et la recherche, avec des services de recommandation basés sur l'apprentissage automatique. Ils utilisent un système de cache à plusieurs niveaux et des services de métadonnées pour enrichir les résultats.",
      technologies: [
        "Elasticsearch",
        "Apache Spark",
        "Kafka",
        "Redis",
        "MySQL",
        "React",
        "Ruby on Rails",
      ],
      results:
        "Airbnb peut désormais traiter des requêtes de recherche complexes sur plus de 7 millions de logements en moins de 200 ms, avec des recommandations personnalisées qui augmentent significativement les taux de conversion.",
      lessons: [
        "Optimiser les index de recherche pour des requêtes complexes",
        "Utiliser l'apprentissage automatique pour améliorer la pertinence des résultats",
        "Implémenter un système de cache à plusieurs niveaux pour réduire la latence",
        "Concevoir une architecture évolutive pour gérer la croissance du catalogue",
        "Équilibrer la personnalisation et la performance",
      ],
      icon: <Building className="h-5 w-5 text-pink-500" />,
    },
  ];

  // Get the active case study
  const activeCaseStudy =
    caseStudies.find((study) => study.id === activeTab) || caseStudies[0];

  return (
    <Card className="border border-border/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Études de Cas: Architectures Distribuées
        </CardTitle>
        <CardDescription>
          Découvrez comment des entreprises de premier plan ont résolu des défis
          d&apos;architecture distribuée à grande échelle
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            {caseStudies.map((study) => (
              <TabsTrigger
                key={study.id}
                value={study.id}
                className="flex items-center gap-2"
              >
                {study.icon}
                {study.company}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCaseStudy.id} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {activeCaseStudy.title}
                </h3>
                <Badge variant="outline" className="text-sm font-medium">
                  {activeCaseStudy.company}
                </Badge>
              </div>

              <p className="text-muted-foreground">
                {activeCaseStudy.description}
              </p>

              {/* Architecture Diagram */}
              <div className="relative w-full h-[300px] border rounded-lg bg-background/50 overflow-hidden my-6">
                {activeTab === "amazon" && <AmazonArchitectureDiagram />}
                {activeTab === "netflix" && <NetflixArchitectureDiagram />}
                {activeTab === "google" && <GoogleArchitectureDiagram />}
                {activeTab === "uber" && <UberArchitectureDiagram />}
                {activeTab === "microsoft" && <MicrosoftArchitectureDiagram />}
                {activeTab === "airbnb" && <AirbnbArchitectureDiagram />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      Défi
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      Solution
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.solution}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4 text-primary" />
                      Architecture
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.architecture}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeCaseStudy.technologies.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Résultats
                    </h4>
                    <p className="text-muted-foreground mt-2">
                      {activeCaseStudy.results}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Database className="h-4 w-4 text-primary" />
                      Leçons Apprises
                    </h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      {activeCaseStudy.lessons.map((lesson, index) => (
                        <li key={index}>{lesson}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
