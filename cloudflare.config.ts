import { bindings, type ConfigContext, defineConfig } from 'cf/config'
import * as entrypoint from './src/index.ts' with { type: 'cf-worker' }

export default defineConfig(({ mode }: ConfigContext) => {
  const isDevelopment = mode !== 'production'

  return {
    worker: {
      name: 'contributions-card',
      compatibilityDate: '2026-10-01',
      entrypoint,
      observability: { enabled: true },
      // GitHub's image proxy fetches the card, so it needs a public hostname of its own.
      workersDev: true,
      previewUrls: false,
      env: {
        GITHUB_TOKEN: bindings.secret(),
        CACHE_SECONDS: bindings.text(isDevelopment ? '0' : '21600'),
      },
    },
  }
})
