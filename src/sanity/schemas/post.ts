import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'News Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          // Editorial categories
          { title: 'Alpha Call',      value: 'Alpha Call' },
          { title: 'Daily Analysis',  value: 'Daily Analysis' },
          // News categories — these must match NEWS_CATEGORIES slugs (lowercase comparison)
          { title: 'Markets',         value: 'market' },
          { title: 'Bitcoin',         value: 'bitcoin' },
          { title: 'Ethereum',        value: 'ethereum' },
          { title: 'DeFi',            value: 'defi' },
          { title: 'NFTs',            value: 'nft' },
          { title: 'Regulation',      value: 'regulation' },
          { title: 'Research',        value: 'research' },
          { title: 'Layer 2',         value: 'layer2' },
          // Legacy / catch-all
          { title: 'General News',    value: 'News' },
        ],
        layout: 'radio',
      },
      initialValue: 'market',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short teaser shown on article cards and search results (max 180 chars).',
      type: 'string',
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            defineField({ name: 'alt', type: 'string', title: 'Alt text' }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'mainImage',
    },
  },
})
