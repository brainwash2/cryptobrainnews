import { defineField, defineType } from 'sanity';
export const airdropGuide = defineType({
  name: 'airdropGuide', title: 'Airdrop Guide', type: 'document',
  fields:[
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'chain', title: 'Chain', type: 'string' }),
    defineField({ name: 'probability', title: 'Probability', type: 'string', options: { list: ['High', 'Medium', 'Speculative'] } }),
    defineField({ name: 'image', title: 'Image', type: 'image' }),
    defineField({ name: 'isFeatured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'steps', title: 'Steps', type: 'array', of: [{ type: 'object', fields:[{ name: 'title', type: 'string' }, { name: 'description', type: 'text' }, { name: 'affiliateLink', type: 'url' }] }] })
  ]
});
