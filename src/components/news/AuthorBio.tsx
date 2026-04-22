/**
 * components/news/AuthorBio.tsx
 * E-E-A-T-hardened author bio block rendered on article and author pages.
 *
 * Signals for Google E-E-A-T:
 *   - Visible credentials beneath name
 *   - "Years of experience" if provided
 *   - Article count ("expertise at scale")
 *   - Twitter/social link (corroborates real identity)
 *   - Structured data injected inline via JSON-LD (Person schema)
 *
 * Consumed by:
 *   - app/news/[slug]/page.tsx  (compact variant at article bottom)
 *   - app/news/author/[slug]/page.tsx (full variant at page top)
 */

'use client';

import Image from 'next/image';
import Link  from 'next/link';
import { buildAuthorSchema, toJSONLDScript } from '../../lib/news/seo/schema';

export interface AuthorBioProps {
  name:          string;
  slug:          string;
  bio:           string | null;
  avatar:        string | null;
  twitterUrl:    string | null;
  credentials:   string[];     // e.g. ['CFA', 'Former Binance analyst']
  articleCount:  number;
  variant:       'compact' | 'full';
}

export default function AuthorBio({
  name,
  slug,
  bio,
  avatar,
  twitterUrl,
  credentials,
  articleCount,
  variant,
}: AuthorBioProps) {
  const authorUrl = `/news/author/${slug}`;
  const schemas   = buildAuthorSchema({ name, slug, bio, avatar, twitterUrl, credentials, articleCount });

  return (
    <>
      {/* Inline JSON-LD — injected once per page render */}
      <div
        dangerouslySetInnerHTML={{ __html: toJSONLDScript(schemas) }}
        suppressHydrationWarning
      />

      <div
        className={`flex gap-4 ${
          variant === 'full'
            ? 'flex-col sm:flex-row items-start sm:items-center p-6 rounded-xl border border-[#1a1a2e] bg-[#0d0d1a]'
            : 'flex-row items-center p-4 rounded-lg border border-[#1a1a2e] bg-[#0a0a18]'
        }`}
      >
        {/* Avatar */}
        <Link href={authorUrl} aria-label={`View ${name}'s profile`} className="shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={variant === 'full' ? 80 : 48}
              height={variant === 'full' ? 80 : 48}
              className="rounded-full ring-2 ring-[#00d4ff]/20"
            />
          ) : (
            <div
              className={`rounded-full bg-[#1a1a2e] flex items-center justify-center text-[#00d4ff] font-bold ${
                variant === 'full' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-base'
              }`}
              aria-hidden="true"
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Text block */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* Name + twitter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={authorUrl}
              className="text-white font-semibold hover:text-[#00d4ff] transition-colors"
            >
              {name}
            </Link>
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00d4ff] text-sm hover:underline"
                aria-label={`${name} on Twitter/X`}
              >
                @{twitterUrl.split('/').pop()}
              </a>
            )}
          </div>

          {/* Credentials row — E-E-A-T anchor */}
          {credentials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-0.5">
              {credentials.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-0.5 rounded-full border border-[#00d4ff]/30 text-[#00d4ff] bg-[#00d4ff]/5"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Article count */}
          <p className="text-xs text-[#555] mt-0.5">
            {articleCount} {articleCount === 1 ? 'article' : 'articles'} published
          </p>

          {/* Bio — full variant only */}
          {variant === 'full' && bio && (
            <p className="text-sm text-[#94a3b8] mt-2 leading-relaxed max-w-xl">{bio}</p>
          )}
        </div>
      </div>
    </>
  );
}
