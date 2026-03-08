import { defineField, defineType } from 'sanity';
export const playbook = defineType({
  name: 'playbook', title: 'Agent Playbook', type: 'document',
  fields:[
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'protocol', title: 'Protocol/Target', type: 'string' }),
    defineField({ name: 'yamlConfig', title: 'YAML Configuration', type: 'text' }),
    defineField({ name: 'sybilParams', title: 'Sybil Parameters (JSON)', type: 'text' }),
    defineField({ name: 'tier', title: 'Tier', type: 'string', options: { list: ['Free', 'Agent Pro'] } })
  ]
});
