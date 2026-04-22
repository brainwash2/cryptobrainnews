/**
 * lib/news/seo/schema.ts
 * Structured data (JSON-LD) builders for:
 *   - NewsArticle  (per article page)
 *   - BreadcrumbList (per article, category, tag page)
 *   - Person / ProfilePage (author pages) — E-E-A-T signal
 *   - Dataset (data-driven articles with charts) — GEO signal
 *   - FAQPage (Q&A blocks injected into articles) — GEO signal
 *   - WebSite with SearchAction (homepage)
 *
 * All builders return a plain object ready for JSON.stringify().
 * Inject into pages via <script type="application/ld+json">.
 *
 * References:
 *   https://schema.org/NewsArticle
 *   https://developers.google.com/search/docs/appearance/structured-data/article
 *   https://schema.org/Dataset
 */

const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://cryptobrainnews.com';
const SITE_NAME = 'CryptoBrainNews';
const LOGO_URL  = `${BASE_URL}/og/logo.png`;

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface SchemaAuthor {
  name:        string;
  slug:        string;
  avatar?:     string | null;
  twitterUrl?: string | null;
  credentials?: string[];  // e.g. ['CFA', '10 years in crypto markets']
}

export interface NewsArticleSchemaInput {
  title:           string;
  slug:            string;
  metaDescription: string;
  body:            string;
  publishedAt:     string;
  updatedAt?:      string;
  author:          SchemaAuthor | null;
  tags:            string[];
  category:        string;
  coverImageUrl?:  string | null;
  sourceUrl:       string;
  wordCount?:      number;
}

export interface FAQItem {
  question: string;
  answer:   string;
}

export interface DatasetSchemaInput {
  name:           string;
  description:    string;
  slug:           string;
  publishedAt:    string;
  keywords:       string[];
  dataSource:     string;  // e.g. 'Glassnode', 'DeFiLlama'
  variableMeasured?: string; // e.g. 'Bitcoin SOPR', 'DeFi TVL'
}

// ─── NewsArticle ──────────────────────────────────────────────────────────────

export function buildNewsArticleSchema(input: NewsArticleSchemaInput): Record<string, unknown> {
  const articleUrl = `${BASE_URL}/news/${input.slug}`;

  const authorNode: Record<string, unknown> = input.author
    ? {
        '@type':    'Person',
        name:       input.author.name,
        url:        `${BASE_URL}/news/author/${input.author.slug}`,
        ...(input.author.avatar ? { image: input.author.avatar } : {}),
        ...(input.author.twitterUrl ? { sameAs: [input.author.twitterUrl] } : {}),
        ...(input.author.credentials?.length
          ? { description: input.author.credentials.join('. ') }
          : {}),
      }
    : { '@type': 'Organization', name: SITE_NAME, url: BASE_URL };

  return {
    '@context':          'https://schema.org',
    '@type':             'NewsArticle',
    headline:            input.title,
    description:         input.metaDescription,
    articleBody:         input.body.slice(0, 5000), // Schema.org recommends truncating
    url:                 articleUrl,
    mainEntityOfPage:    { '@type': 'WebPage', '@id': articleUrl },
    datePublished:       input.publishedAt,
    dateModified:        input.updatedAt ?? input.publishedAt,
    author:              authorNode,
    publisher: {
      '@type':           'Organization',
      name:              SITE_NAME,
      url:               BASE_URL,
      logo: {
        '@type':         'ImageObject',
        url:             LOGO_URL,
        width:           512,
        height:          512,
      },
    },
    ...(input.coverImageUrl
      ? {
          image: {
            '@type':  'ImageObject',
            url:      input.coverImageUrl,
            width:    1200,
            height:   630,
          },
        }
      : {
          // Fallback to OG image
          image: {
            '@type':  'ImageObject',
            url:      `${BASE_URL}/api/og?slug=${input.slug}`,
            width:    1200,
            height:   630,
          },
        }),
    keywords:            input.tags.join(', '),
    articleSection:      input.category,
    inLanguage:          'en-US',
    isAccessibleForFree: true,
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
    about: input.tags.slice(0, 5).map((tag) => ({
      '@type': 'Thing',
      name:    tag,
    })),
    isPartOf: {
      '@type': 'WebSite',
      name:    SITE_NAME,
      url:     BASE_URL,
    },
    // Citation back to source — E-E-A-T signal (shows primary research)
    citation: {
      '@type': 'WebPage',
      url:     input.sourceUrl,
      name:    'Source article',
    },
  };
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url:  string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context':      'https://schema.org',
    '@type':         'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type':   'ListItem',
      position:  idx + 1,
      name:      item.name,
      item:      item.url,
    })),
  };
}

// ─── FAQPage (GEO signal) ──────────────────────────────────────────────────────

export function buildFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
  if (faqs.length === 0) return {};
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type':        'Question',
      name:           faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

// ─── Dataset (data-driven articles — GEO signal) ──────────────────────────────

export function buildDatasetSchema(input: DatasetSchemaInput): Record<string, unknown> {
  return {
    '@context':         'https://schema.org',
    '@type':            'Dataset',
    name:               input.name,
    description:        input.description,
    url:                `${BASE_URL}/news/${input.slug}`,
    datePublished:      input.publishedAt,
    keywords:           input.keywords,
    creator: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     BASE_URL,
    },
    isBasedOn: {
      '@type': 'WebPage',
      name:    input.dataSource,
    },
    ...(input.variableMeasured
      ? { variableMeasured: input.variableMeasured }
      : {}),
    license:            'https://creativecommons.org/licenses/by/4.0/',
    inLanguage:         'en-US',
  };
}

// ─── Person / ProfilePage (author — E-E-A-T) ──────────────────────────────────

export interface AuthorProfileSchemaInput {
  name:         string;
  slug:         string;
  bio:          string | null;
  avatar:       string | null;
  twitterUrl:   string | null;
  credentials:  string[];
  articleCount: number;
}

export function buildAuthorSchema(input: AuthorProfileSchemaInput): Record<string, unknown>[] {
  const authorUrl = `${BASE_URL}/news/author/${input.slug}`;

  const personSchema: Record<string, unknown> = {
    '@context':   'https://schema.org',
    '@type':      'Person',
    name:         input.name,
    url:          authorUrl,
    ...(input.bio    ? { description: input.bio }     : {}),
    ...(input.avatar ? { image: input.avatar }        : {}),
    ...(input.twitterUrl ? { sameAs: [input.twitterUrl] } : {}),
    ...(input.credentials.length
      ? { hasCredential: input.credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c })) }
      : {}),
    knowsAbout:   ['Cryptocurrency', 'Blockchain', 'DeFi', 'Bitcoin', 'On-chain analysis'],
    worksFor: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     BASE_URL,
    },
  };

  const profilePageSchema: Record<string, unknown> = {
    '@context':      'https://schema.org',
    '@type':         'ProfilePage',
    name:            `${input.name} – CryptoBrainNews Author`,
    url:             authorUrl,
    mainEntity:      personSchema,
    breadcrumb:      buildBreadcrumbSchema([
      { name: 'Home',    url: BASE_URL },
      { name: 'Authors', url: `${BASE_URL}/news/author` },
      { name: input.name, url: authorUrl },
    ]),
  };

  return [personSchema, profilePageSchema];
}

// ─── WebSite with SearchAction (homepage) ────────────────────────────────────

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:       SITE_NAME,
    url:        BASE_URL,
    description: 'Data-first crypto intelligence: on-chain analysis, market news, DeFi insights.',
    inLanguage:  'en-US',
    potentialAction: {
      '@type':       'SearchAction',
      target: {
        '@type':     'EntryPoint',
        urlTemplate: `${BASE_URL}/news/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     BASE_URL,
      logo:    { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
      sameAs: [
        process.env.NEXT_PUBLIC_TWITTER_URL ?? '',
        process.env.NEXT_PUBLIC_TELEGRAM_URL ?? '',
      ].filter(Boolean),
    },
  };
}

// ─── Convenience: serialize to <script> tag string ───────────────────────────

export function toJSONLDScript(schema: Record<string, unknown> | Record<string, unknown>[]): string {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
}
