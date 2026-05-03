import 'server-only';

/**
 * Minimal server-side HTML sanitizer for AI-generated article content.
 * Strips <script>, <iframe>, <object>, <embed>, <form> tags and
 * all event-handler attributes (on*=) to prevent XSS.
 * Not a full sanitizer — use for trusted-source AI content only.
 */
export function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    .replace(/\bhref\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
}
