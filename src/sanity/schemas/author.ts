import { defineField, defineType } from 'sanity';
 
export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Full Name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name', maxLength: 64 } }),
    defineField({ name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 3 }),
    defineField({ name: 'twitter', title: 'Twitter / X handle', type: 'string', description: 'Without the @ sign' }),
    defineField({ name: 'role', title: 'Role', type: 'string',
      options: { list: ['Editor-in-Chief', 'Senior Writer', 'Analyst', 'Contributor', 'Guest'] },
    }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'avatar' },
  },
});
