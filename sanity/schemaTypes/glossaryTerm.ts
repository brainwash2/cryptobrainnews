import { defineField, defineType } from 'sanity';
export const glossaryTerm = defineType({
  name: 'glossaryTerm', title: 'Glossary Term', type: 'document',
  fields:[
    defineField({ name: 'term', title: 'Term', type: 'string' }),
    defineField({ name: 'definition', title: 'Definition', type: 'text' }),
    defineField({ name: 'category', title: 'Category', type: 'string' })
  ]
});
