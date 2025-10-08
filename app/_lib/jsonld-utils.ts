import { SITE_BASE_URL } from "./constants";

type BlogPosting = {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person';
    name: string;
    url: string;
  };
  publisher: {
    '@type': 'Person';
    name: string;
    url: string;
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords: string;
  inLanguage: string;
};

interface ArticleJsonLdProps {
  title: string;
  description: string;
  authorName: string;
  authorUrl: string;
  publishedTime: string;
  modifiedTime?: string;
  image: string;
  url: string;
  tags?: string[];
}

export function generateArticleJsonLd({
  title,
  description,
  authorName,
  authorUrl,
  publishedTime,
  modifiedTime,
  image,
  url,
  tags = [],
}: ArticleJsonLdProps): BlogPosting {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image.startsWith('http') ? image : `${SITE_BASE_URL}/${image}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: tags.join(', '),
    inLanguage: 'en-US',
  };
}

interface WebsiteJsonLdProps {
  name: string;
  description: string;
  url: string;
  authorName: string;
  authorUrl: string;
  sameAs?: string[];
}

type WebSite = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  description: string;
  url: string;
  author: {
    '@type': 'Person';
    name: string;
    url: string;
    sameAs?: string[];
  };
  inLanguage: string;
};

export function generateWebsiteJsonLd({
  name,
  description,
  url,
  authorName,
  authorUrl,
  sameAs = [],
}: WebsiteJsonLdProps): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
      sameAs,
    },
    inLanguage: 'en-US',
  };
}

export function generateJsonLdScript(data: BlogPosting | WebSite): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
