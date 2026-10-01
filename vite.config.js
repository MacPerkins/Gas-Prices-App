import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/, so the
// built asset URLs need that repo-name prefix — otherwise every JS/CSS request 404s
// and the page is blank. `npm run dev` doesn't use this (base only applies to build).
export default defineConfig({
  plugins: [react()],
  base: '/Gas-Prices-App/',
})
