import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {dashboardTool} from '@sanity/dashboard'
import {vercelWidget} from 'sanity-plugin-dashboard-widget-vercel'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'nextaz',

  projectId: '5fmpwxu0',
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
    dashboardTool({
      widgets: [vercelWidget()],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
