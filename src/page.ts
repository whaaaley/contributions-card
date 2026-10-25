const palette = Object.freeze({
  darkCanvas: '#0d1117',
  lightCanvas: '#ffffff',
})

const style = [
  `html,body{margin:0;height:100%;background:${palette.darkCanvas}}`,
  'body{display:grid;place-items:center}',
  'img{max-width:calc(100% - 32px);height:auto}',
  `@media (prefers-color-scheme:light){html,body{background:${palette.lightCanvas}}}`,
].join('')

// Frames the card the way a profile README shows it, for readers who click through the image.
export const renderPage = (): string =>
  [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Public contributions</title>',
    `<style>${style}</style>`,
    '</head>',
    '<body><img src="/contributions.svg" alt="Public contributions" width="845"></body>',
    '</html>',
  ].join('\n')
