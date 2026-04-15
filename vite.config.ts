import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss(),

    sentryVitePlugin({
      org: "your-org-name",
      project: "nexa-travel",
      // Best Practice: Use an Auth Token from your Sentry settings
      authToken: process.env.SENTRY_AUTH_TOKEN, 
    }),
  ],
  build: {
      sourcemap: 'hidden',
    },
  ssr: {
    noExternal: [/@syncfusion/]
  }
})
