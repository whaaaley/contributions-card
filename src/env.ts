// The Worker's bindings, mirroring the `env` block of cloudflare.config.ts.
export type Env = {
  GITHUB_TOKEN: string
  CACHE_SECONDS: string
}
