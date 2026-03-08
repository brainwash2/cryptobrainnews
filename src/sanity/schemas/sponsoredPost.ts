import { defineField, defineType } from 'sanity';
export const sponsoredPost = defineType({
  name: 'sponsoredPost', title: 'Sponsored Post', type: 'document',
  fields:[
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'sponsorName', title: 'Sponsor Name', type: 'string' }),
    defineField({ name: 'logo', title: 'Sponsor Logo', type: 'image' }),
    defineField({ name: 'link', title: 'External Link', type: 'url' }),
    defineField({ name: 'body', title: 'Body', type: 'array', of:[{ type: 'block' }] }),
    defineField({ name: 'expirationDate', title: 'Expiration Date', type: 'datetime' })
  ]
});
