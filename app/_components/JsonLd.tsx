"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Define types for our schema objects
interface PersonSchema {
  "@context": string;
 "@type": "Person";
  name: string;
  jobTitle: string;
  description: string;
  url: string;
  sameAs: string[];
  image?: string;
 email: string;
  alumniOf?: {
    "@type": string;
    name: string;
  };
  knowsAbout: string[];
  worksFor?: {
    "@type": string;
    name: string;
    description: string;
 };
  address?: {
    "@type": string;
    addressCountry: string;
  };
  workLocation?: {
    "@type": string;
    address: {
      "@type": string;
      addressCountry: string;
    };
  };
}

interface WebSiteSchema {
  "@context": string;
 "@type": "WebSite";
  name: string;
  url: string;
  description: string;
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

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

// Function to generate breadcrumbs based on current path
const generateBreadcrumbs = (pathname: string): BreadcrumbListSchema => {
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: []
  };

  // Add home as first breadcrumb
  breadcrumbs.itemListElement.push({
    "@type": "ListItem",
    position: 1,
    name: "Accueil",
    item: "https://fygs.dev"
  });

  // Add other path segments
  pathParts.forEach((part, index) => {
    const capitalizedPart = part.charAt(0).toUpperCase() + part.slice(1);
    breadcrumbs.itemListElement.push({
      "@type": "ListItem",
      position: index + 2,
      name: capitalizedPart,
      item: `https://fygs.dev/${pathParts.slice(0, index + 1).join('/')}`
    });
  });

  return breadcrumbs;
};

// Function to determine which schema to render based on the current page
const getSchema = (pathname: string): (PersonSchema | WebSiteSchema | BreadcrumbListSchema)[] => {
  const schemas: (PersonSchema | WebSiteSchema | BreadcrumbListSchema)[] = [];
  
  // Always include the person schema for the main website
  const personSchema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fernand SOUALO",
    jobTitle: "Software Engineer",
    description:
      "Expert Software Engineer specializing in full-stack development with TypeScript, NestJS, Node.js, Next.js, React, and cloud technologies.",
    url: "https://fygs.dev",
    sameAs: [
      "https://github.com/fygs",
      "https://www.linkedin.com/in/fernandsoualo/",
      "https://hashnode.com/@FYGS",
    ],
    image: "https://fygs.dev/images/og-image.png",
    email: "fygs.dev@gmail.com",
    alumniOf: {
      "@type": "Organization",
      name: "Sorbonne Université (Ex Université Pierre et Marie Curie, Paris VI)",
    },
    knowsAbout: [
      "Software Engineering",
      "Web Development",
      "TypeScript",
      "React",
      "Node.js",
      "Cloud Architecture",
      "AWS",
      "System Design",
      "NestJS",
      "Next.js",
      "Database Design",
      "API Development",
      "Microservices",
      "DevOps",
      "CI/CD",
      "Docker",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Freelance Software Engineer",
      description:
        "Independent software engineering consultant specializing in full-stack development",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "France",
    },
    workLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "France",
      },
    },
  };

  schemas.push(personSchema);

  // Add website schema for homepage
  if (pathname === "/" || pathname === "") {
    const websiteSchema: WebSiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Fernand SOUALO - Software Engineer Portfolio",
      url: "https://fygs.dev",
      description:
        "Expert Software Engineer specializing in full-stack development with TypeScript, NestJS, Node.js, Next.js, React, and cloud technologies.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://fygs.dev/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    };
    schemas.push(websiteSchema);
  }

  // Add breadcrumbs for all pages except root
  if (pathname !== "/" && pathname !== "") {
    schemas.push(generateBreadcrumbs(pathname));
  }

  return schemas;
};

export function JsonLd() {
  const pathname = usePathname();
  const [schema, setSchema] = useState<(PersonSchema | WebSiteSchema | BreadcrumbListSchema)[]>([]);

  useEffect(() => {
    setSchema(getSchema(pathname || "/"));
  }, [pathname]);

  return (
    <>
      {schema.map((schemaItem, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(schemaItem, null, 2) 
          }}
        />
      ))}
    </>
  );
}
