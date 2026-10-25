type Pill = {
  label: string
  color: string
  darkText: string
  lightText: string
}

// Brand colors of each project, keyed by the name a pill's URL uses, with text shades readable on each theme.
export const pills: Readonly<Record<string, Pill>> = Object.freeze({
  vue: { label: 'Vue', color: '#42b883', darkText: '#5fd4a0', lightText: '#2c7a57' },
  typescript: { label: 'TypeScript', color: '#3178c6', darkText: '#6aa6f0', lightText: '#245b97' },
  trpc: { label: 'tRPC', color: '#398ccb', darkText: '#6cb4ec', lightText: '#2a6a9b' },
  zod: { label: 'Zod', color: '#3068b7', darkText: '#7aa5e6', lightText: '#24508c' },
  drizzle: { label: 'Drizzle', color: '#c5f74f', darkText: '#c5f74f', lightText: '#5a7a12' },
  'tanstack-query': { label: 'TanStack Query', color: '#ff4154', darkText: '#ff7b88', lightText: '#c4202f' },
  deno: { label: 'Deno', color: '#9198a1', darkText: '#f0f6fc', lightText: '#1f2328' },
  'cloudflare-workers': { label: 'Cloudflare Workers', color: '#f38020', darkText: '#f6a04d', lightText: '#b35a0c' },
  vite: { label: 'Vite', color: '#646cff', darkText: '#9499ff', lightText: '#4a50d4' },
  rxjs: { label: 'RxJS', color: '#b7178c', darkText: '#e05bb8', lightText: '#93126f' },
})

const height = 22
const paddingX = 10
// Each pill carries its own side margin, since a README puts only a narrow space between images.
const marginX = 4
// The SVG cannot measure text, so the width works from an average 12px glyph width.
const glyphWidth = 7
const font = '500 12px -apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif'

// Draws a pill like a GitHub label: a faint fill and border in the brand color around colored text.
export const renderPill = (pill: Pill): string => {
  const pillWidth = Math.round(pill.label.length * glyphWidth + paddingX * 2)
  const width = pillWidth + marginX * 2
  const style = [
    `text{font:${font};fill:${pill.darkText}}`,
    `@media (prefers-color-scheme:light){text{fill:${pill.lightText}}}`,
  ].join('')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<style>${style}</style>`,
    `<rect x="${marginX + 0.5}" y="0.5" width="${pillWidth - 1}" height="${height - 1}" rx="${height / 2}"`,
    ` fill="${pill.color}" fill-opacity="0.15" stroke="${pill.color}" stroke-opacity="0.4"/>`,
    `<text x="${width / 2}" y="15" text-anchor="middle">${pill.label}</text>`,
    '</svg>',
  ].join('')
}
