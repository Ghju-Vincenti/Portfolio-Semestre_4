import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'w1hfz6z1',
  dataset: 'production',
   useCdn: true,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
