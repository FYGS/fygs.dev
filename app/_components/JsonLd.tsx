export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Fernand SOUALO",
    jobTitle: "Software Engineer",
    description:
      "Expert Software Engineer specializing in full-stack development with TypeScript, NestJS, Node.js, Next.js, React, and cloud technologies.",
    url: "https://fygs-dev.vercel.app",
    sameAs: [
      "https://github.com/fygs",
      "https://www.linkedin.com/in/fernandsoualo/",
      "https://hashnode.com/@FYGS",
    ],
    image: "/images/og-image.png",
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
