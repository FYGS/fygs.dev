import { serializeJsonLd } from "@/lib/jsonld";

const SITE_URL = "https://fygs.dev";

interface BreadcrumbListSchema {
  "@context": string;
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

const pathLabels: Record<string, string> = {
  formations: "Formations",
  blog: "Blog",
  projects: "Projets",
  community: "Communauté",
  dashboard: "Tableau de bord",
  pricing: "Tarifs",
  contact: "Contact",
  me: "À propos",
  reviews: "Avis",
  lessons: "Leçons",
  quizzes: "Quiz",
};

function generateBreadcrumbs(pathname: string): BreadcrumbListSchema {
  const cleanPath = pathname.replace(/^\/(fr|en|es)/, "");
  const pathParts = cleanPath.split("/").filter(Boolean);

  const items: BreadcrumbListSchema["itemListElement"] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: SITE_URL,
    },
  ];

  pathParts.forEach((part, index) => {
    const label =
      pathLabels[part] ||
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const url = `${SITE_URL}/${pathParts.slice(0, index + 1).join("/")}`;
    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: label,
      ...(index < pathParts.length - 1 ? { item: url } : {}),
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function getSchemas(pathname: string): object[] {
  const schemas: object[] = [];

  // Organization schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FYGS",
    url: SITE_URL,
    logo: `${SITE_URL}/images/android-chrome-512x512.png`,
    description:
      "Plateforme de formations premium pour développeurs. JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud.",
    sameAs: [
      "https://github.com/fygs",
      "https://www.linkedin.com/in/fernandsoualo/",
      "https://hashnode.com/@FYGS",
    ],
    founder: {
      "@type": "Person",
      name: "Fernand SOUALO",
      jobTitle: "Software Engineer & Educator",
      url: `${SITE_URL}/me`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "fygs.dev@gmail.com",
      contactType: "customer support",
    },
  });

  // Website schema for homepage
  const cleanPath = pathname.replace(/^\/(fr|en|es)/, "");
  if (!cleanPath || cleanPath === "/" || cleanPath === "") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FYGS Learning Platform",
      url: SITE_URL,
      description:
        "Plateforme de formations premium pour développeurs web. JavaScript, TypeScript, React, Next.js, Node.js, IA et Cloud.",
      inLanguage: ["fr", "en", "es"],
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/formations?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });

    // Educational organization
    schemas.push({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "FYGS Learning Platform",
      url: SITE_URL,
      description:
        "Formations premium en développement web avec projets pratiques, quiz interactifs et certifications.",
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Catalogue de formations",
        itemListElement: [
          {
            "@type": "OfferCatalog",
            name: "JavaScript & TypeScript",
            description: "Formations complètes JavaScript et TypeScript",
          },
          {
            "@type": "OfferCatalog",
            name: "React & Next.js",
            description: "Formations React et Next.js de débutant à expert",
          },
          {
            "@type": "OfferCatalog",
            name: "Backend & Cloud",
            description: "Node.js, API, bases de données et déploiement cloud",
          },
        ],
      },
    });
  }

  // Breadcrumbs for non-root pages
  if (cleanPath && cleanPath !== "/" && cleanPath !== "") {
    schemas.push(generateBreadcrumbs(pathname));
  }

  return schemas;
}

export function JsonLd() {
  // Use a simple server-compatible approach - render base schemas
  // The pathname will be handled at layout level
  const schemas = getSchemas("/");

  return (
    <>
      {schemas.map((schemaItem, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(schemaItem),
          }}
        />
      ))}
    </>
  );
}
