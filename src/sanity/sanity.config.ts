import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { post } from './schemas/post'

export default defineConfig({
  basePath: '/studio',
  name: 'CryptoBrain_Studio',
  title: 'CryptoBrainNews CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'REPLACE_ME',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: [post],
  },
})
