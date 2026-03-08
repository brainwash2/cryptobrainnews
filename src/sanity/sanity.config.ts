import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  basePath: '/studio',
  name: 'CryptoBrain_Studio',
  title: 'CryptoBrainNews CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '9z1iv2c9',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  plugins:[structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
