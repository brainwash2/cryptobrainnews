import { defineField, defineType } from 'sanity';
export const siteNotification = defineType({
  name: 'siteNotification', title: 'Site Notification', type: 'document',
  fields:[
    defineField({ name: 'message', title: 'Message', type: 'string' }),
    defineField({ name: 'type', title: 'Type', type: 'string', options: { list: ['info', 'warning', 'success'] } }),
    defineField({ name: 'link', title: 'Link (Optional)', type: 'url' }),
    defineField({ name: 'activeFrom', title: 'Active From', type: 'datetime' }),
    defineField({ name: 'activeUntil', title: 'Active Until', type: 'datetime' })
  ]
});
