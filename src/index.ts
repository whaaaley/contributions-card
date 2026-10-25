import type { Env } from './env.ts'
import { fetchContributions } from './github.ts'
import { renderContributions } from './render.ts'

const handleRequest = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
  const url = new URL(request.url)
  if (url.pathname !== '/contributions.svg') return new Response('Not found', { status: 404 })

  const cached = await caches.default.match(request)
  if (cached) return cached

  const svg = renderContributions(await fetchContributions(env.GITHUB_TOKEN))
  const response = new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': `public, max-age=${env.CACHE_SECONDS}`,
    },
  })

  if (Number(env.CACHE_SECONDS) > 0) ctx.waitUntil(caches.default.put(request, response.clone()))

  return response
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => handleRequest(request, env, ctx),
}
