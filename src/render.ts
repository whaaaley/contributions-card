import type { Contribution } from './github.ts'

const palette = Object.freeze({
  darkCanvas: '#0d1117',
  darkBorder: '#3d444d',
  darkLink: '#4493f8',
  darkMuted: '#9198a1',
  darkMerged: '#ab7df8',
  lightCanvas: '#ffffff',
  lightBorder: '#d1d9e0',
  lightLink: '#0969da',
  lightMuted: '#59636e',
  lightMerged: '#8250df',
  fallbackLanguage: '#8b949e',
})

const columns = 2
const maxCards = 6
// A profile README's content box is 846px wide, the pinned grid's 896px less the box's 24px padding and 1px border.
const cardWidth = 414
const gap = 16
const padding = 16
const lineHeight = 18
const maxDescriptionLines = 3
const maxPullRequests = 4
// The SVG cannot measure text, so wrapping works from an average 12px glyph width.
const charsPerLine = Math.floor((cardWidth - padding * 2) / 6.4)

const countFormat = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const formatCount = (count: number): string => countFormat.format(count).toLowerCase()

const escape = (text: string): string =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const truncate = (text: string, length: number): string =>
  text.length <= length ? text : `${text.slice(0, length - 3).trimEnd()}...`

const wrap = (text: string): string[] => {
  const lines: string[] = []
  let line = ''

  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (next.length > charsPerLine && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }

  if (line) lines.push(line)
  if (lines.length <= maxDescriptionLines) return lines

  const kept = lines.slice(0, maxDescriptionLines)
  kept[maxDescriptionLines - 1] = truncate(`${kept[maxDescriptionLines - 1]} ...`, charsPerLine)

  return kept
}

type Card = {
  height: number
  body: string
  footer: string
}

const repoIcon =
  'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z'
const starIcon =
  'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z'
const forkIcon =
  'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z'
const mergeIcon =
  'M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z'

const icon = (path: string, x: number, y: number, className: string): string =>
  `<path class="${className}" transform="translate(${x} ${y})" d="${path}"/>`

const renderCard = (contribution: Contribution): Card => {
  const { repository, pullRequests } = contribution
  const name = truncate(repository.nameWithOwner, 44)
  const badgeX = cardWidth - padding - 46
  const description = wrap(repository.description ?? '')
  const shown = pullRequests.slice(0, maxPullRequests)
  const hidden = pullRequests.length - shown.length

  const nameText = `<text class="name" x="${padding + 24}" y="${padding + 13}">${escape(name)}</text>`

  const parts = [
    icon(repoIcon, padding, padding + 2, 'muted'),
    `<a href="${escape(repository.url)}">${nameText}</a>`,
    `<rect class="badge" x="${badgeX}" y="${padding}" width="46" height="20" rx="10"/>`,
    `<text class="small muted" x="${badgeX + 23}" y="${padding + 14}" text-anchor="middle">Public</text>`,
  ]
  let y = padding + 44

  for (const line of description) {
    parts.push(`<text class="small muted" x="${padding}" y="${y}">${escape(line)}</text>`)
    y += lineHeight
  }

  y += 6

  for (const pr of shown) {
    const iconClass = pr.merged ? 'merged' : 'muted'
    const title = escape(truncate(pr.title, charsPerLine - 10))
    parts.push(icon(mergeIcon, padding, y - 12, iconClass))
    const prText = `<text x="${padding + 22}" y="${y}"><tspan class="muted">#${pr.number}</tspan> ${title}</text>`
    parts.push(`<a href="${escape(pr.url)}">${prText}</a>`)
    y += lineHeight
  }

  if (hidden > 0) {
    parts.push(`<text class="small muted" x="${padding + 22}" y="${y}">and ${hidden} more</text>`)
    y += lineHeight
  }

  y += 8
  let x = padding
  const footer: string[] = []
  const language = repository.primaryLanguage

  if (language) {
    const color = language.color ?? palette.fallbackLanguage
    footer.push(`<circle cx="${x + 6}" cy="${y - 4}" r="6" fill="${color}"/>`)
    footer.push(`<text class="small muted" x="${x + 16}" y="${y}">${escape(language.name)}</text>`)
    x += 28 + language.name.length * 7
  }

  const stars = formatCount(repository.stargazerCount)
  footer.push(icon(starIcon, x, y - 12, 'muted'))
  footer.push(`<text class="small muted" x="${x + 20}" y="${y}">${stars}</text>`)
  x += 34 + stars.length * 7

  if (repository.forkCount > 0) {
    footer.push(icon(forkIcon, x, y - 12, 'muted'))
    footer.push(`<text class="small muted" x="${x + 20}" y="${y}">${formatCount(repository.forkCount)}</text>`)
  }

  return { height: y + padding, body: parts.join(''), footer: footer.join('') }
}

const style = [
  `.card{fill:${palette.darkCanvas};stroke:${palette.darkBorder}}`,
  `.badge{fill:none;stroke:${palette.darkBorder}}`,
  `text{font:12px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;fill:${palette.darkMuted}}`,
  `.name{font-size:14px;font-weight:600;fill:${palette.darkLink}}`,
  `.muted{fill:${palette.darkMuted}}`,
  `.merged{fill:${palette.darkMerged}}`,
  '@media (prefers-color-scheme:light){',
  `.card{fill:${palette.lightCanvas};stroke:${palette.lightBorder}}`,
  `.badge{stroke:${palette.lightBorder}}`,
  `text,.muted{fill:${palette.lightMuted}}`,
  `.name{fill:${palette.lightLink}}`,
  `.merged{fill:${palette.lightMerged}}`,
  '}',
].join('')

// Lays the cards out in rows like GitHub's pinned repositories, each row as tall as its tallest card.
export const renderContributions = (contributions: Contribution[]): string => {
  const cards = contributions.slice(0, maxCards).map(renderCard)
  const groups: string[] = []
  let y = 0

  for (let start = 0; start < cards.length; start += columns) {
    const row = cards.slice(start, start + columns)
    const height = Math.max(...row.map((card) => card.height))

    for (const [index, card] of row.entries()) {
      const x = index * (cardWidth + gap)
      const frame = `<rect class="card" width="${cardWidth}" height="${height}" rx="6"/>`
      // A shorter card's footer drops to the row's bottom edge, as GitHub's pinned cards do.
      const footer = `<g transform="translate(0 ${height - card.height})">${card.footer}</g>`
      groups.push(`<g transform="translate(${x + 0.5} ${y + 0.5})">${frame}${card.body}${footer}</g>`)
    }

    y += height + gap
  }

  const width = columns * cardWidth + gap + 1
  const height = Math.max(y - gap + 1, 1)

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<style>${style}</style>`,
    ...groups,
    '</svg>',
  ].join('')
}
