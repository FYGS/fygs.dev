import { SITE_URL } from "../constants";

// ─── JSON-LD Schema Generators ──────────────────────────────────────────────

/** Organization schema (shared across sections) */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FYGS",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    sameAs: [
      "https://github.com/fernand-music",
      "https://www.linkedin.com/in/fernand-music",
    ],
    description:
      "Plateforme de formations premium en développement web moderne",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Fernand SOUALO",
      url: `${SITE_URL}/me`,
      jobTitle: "Software Engineer & Instructor",
    },
  };
}

/** WebSite schema with search action */
export function getWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FYGS Learning Platform",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/formations?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Course catalog schema */
export function getCourseListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Formations FYGS",
    description:
      "Catalogue de formations en développement web et technologies modernes",
    url: `${SITE_URL}/formations`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: 10,
    provider: {
      "@type": "EducationalOrganization",
      name: "FYGS",
      url: SITE_URL,
    },
  };
}

/** Person schema for /me */
export function getPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fernand SOUALO",
    url: `${SITE_URL}/me`,
    image: `${SITE_URL}/linkedin_profile_photo.jpeg`,
    jobTitle: "Full-Stack Software Engineer",
    worksFor: {
      "@type": "EducationalOrganization",
      name: "FYGS",
    },
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "Cloud Architecture",
      "PostgreSQL",
      "Docker",
    ],
    sameAs: [
      "https://github.com/fernand-music",
      "https://www.linkedin.com/in/fernand-music",
    ],
  };
}

/** Blog schema */
export function getBlogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "FYGS Technical Blog",
    url: `${SITE_URL}/blog`,
    description:
      "Articles techniques approfondis sur le développement web moderne",
    publisher: {
      "@type": "EducationalOrganization",
      name: "FYGS",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.svg`,
      },
    },
    author: {
      "@type": "Person",
      name: "Fernand SOUALO",
    },
  };
}

/** Contact page schema */
export function getContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contacter FYGS",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@type": "Person",
      name: "Fernand SOUALO",
      email: "fygs.dev@gmail.com",
      url: `${SITE_URL}/me`,
    },
  };
}

/** Breadcrumb schema helper */
export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}
