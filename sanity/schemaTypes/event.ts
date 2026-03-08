import { defineField, defineType } from 'sanity';
export const event = defineType({
  name: 'event', title: 'Event', type: 'document',
  fields:[
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'datetime' }),
    defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
    defineField({ name: 'locationCity', title: 'City', type: 'string' }),
    defineField({ name: 'locationCountry', title: 'Country', type: 'string' }),
    defineField({ name: 'venue', title: 'Venue', type: 'string' }),
    defineField({ name: 'url', title: 'Website URL', type: 'url' }),
    defineField({ name: 'isOnline', title: 'Online Event', type: 'boolean', initialValue: false }),
    defineField({ name: 'isFeatured', title: 'Featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'image', title: 'Image', type: 'image' })
  ]
});
