import { defineField, defineType } from 'sanity';
 
export const post = defineType({
  name: 'post',
  title: 'News Article',
  type: 'document',
  groups: [
    { name: 'content',    title: 'Content',    default: true },
    { name: 'seo',        title: 'SEO' },
    { name: 'publishing', title: 'Publishing' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'content', validation: r => r.required() }),
    defineField({
      name: 'slug', title: 'Slug', type: 'slug', group: 'content',
      options: { source: 'title', maxLength: 96 }, validation: r => r.required(),
    }),
    defineField({ name: 'author', title: 'Author', type: 'reference', group: 'content', to: [{ type: 'author' }] }),
    defineField({
      name: 'mainImage', title: 'Main Image', type: 'image', group: 'content',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', type: 'string', title: 'Alt text' })],
    }),
    defineField({
      name: 'category', title: 'Category', type: 'string', group: 'content',
      options: {
        list: [
          { title: 'Alpha Call',    value: 'Alpha Call' },
          { title: 'Daily Analysis', value: 'Daily Analysis' },
          { title: 'Markets',       value: 'market' },
          { title: 'Bitcoin',       value: 'bitcoin' },
          { title: 'Ethereum',      value: 'ethereum' },
          { title: 'DeFi',          value: 'defi' },
          { title: 'NFTs',          value: 'nft' },
          { title: 'Regulation',    value: 'regulation' },
          { title: 'Research',      value: 'research' },
          { title: 'Layer 2',       value: 'layer2' },
          { title: 'General News',  value: 'News' },
        ],
        layout: 'radio',
      },
      initialValue: 'market',
    }),
    // ── NEW: Tags field ──────────────────────────────────────────────
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      description: 'Add topic tags e.g. "ethereum", "btc-etf", "layer2", "defi". Lowercase, hyphenated.',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    // ────────────────────────────────────────────────────────────────
    defineField({
      name: 'excerpt', title: 'Excerpt', type: 'string', group: 'content',
      description: 'Short teaser for cards and search (max 180 chars).',
      validation: r => r.max(180),
    }),
    defineField({
      name: 'body', title: 'Body', type: 'array', group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image', options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt', title: 'Published At', type: 'datetime', group: 'publishing',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'scheduledPublishAt', title: 'Scheduled Publish At', type: 'datetime', group: 'publishing',
      description: 'Optional: schedule future publication.',
    }),
    defineField({
      name: 'status', title: 'Status', type: 'string', group: 'publishing',
      options: { list: ['draft', 'scheduled', 'published', 'archived'], layout: 'radio' },
      initialValue: 'draft',
    }),
    defineField({
      name: 'seo', title: 'SEO', type: 'object', group: 'seo',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', validation: r => r.max(70) }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'string', validation: r => r.max(160) }),
        defineField({ name: 'noIndex', title: 'No Index', type: 'boolean', initialValue: false }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'mainImage' },
    prepare({ title, subtitle, media }: any) {
      const emoji: Record<string, string> = { draft: '📝', scheduled: '⏰', published: '✅', archived: '🗄️' };
      return { title, subtitle: `${emoji[subtitle] || ''} ${subtitle || 'draft'}`, media };
    },
  },
});
