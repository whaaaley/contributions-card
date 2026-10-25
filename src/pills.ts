type Pill = {
  label: string
  fill: string
  text: string
}

// Brand colors of each project, keyed by the name a pill's URL uses.
export const pills: Readonly<Record<string, Pill>> = Object.freeze({
  vue: { label: 'Vue', fill: '#42b883', text: '#213547' },
  typescript: { label: 'TypeScript', fill: '#3178c6', text: '#ffffff' },
  trpc: { label: 'tRPC', fill: '#398ccb', text: '#ffffff' },
  zod: { label: 'Zod', fill: '#3068b7', text: '#ffffff' },
  'tanstack-query': { label: 'TanStack Query', fill: '#ff4154', text: '#ffffff' },
  deno: { label: 'Deno', fill: '#ffffff', text: '#000000' },
  oak: { label: 'Oak', fill: '#8a6d3b', text: '#ffffff' },
  supabase: { label: 'Supabase', fill: '#3ecf8e', text: '#1c1c1c' },
  rxjs: { label: 'RxJS', fill: '#b7178c', text: '#ffffff' },
})

const height = 24
const paddingX = 10
// The SVG cannot measure text, so the width works from an average 12px glyph width.
const glyphWidth = 7
const font = '500 12px -apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Helvetica,Arial,sans-serif'

export const renderPill = (pill: Pill): string => {
  const width = Math.round(pill.label.length * glyphWidth + paddingX * 2)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" rx="${height / 2}" fill="${pill.fill}"/>`,
    `<text x="${width / 2}" y="16" text-anchor="middle" fill="${pill.text}" style="font:${font}">${pill.label}</text>`,
    '</svg>',
  ].join('')
}
