# contributions-card

A Cloudflare Worker that renders the public repositories a GitHub user has contributed to as one SVG of cards styled like GitHub's pinned repositories.
It serves the contributions section of a GitHub profile README.

## What it does

The Worker answers `GET /contributions.svg` with the token owner's contributions, most starred repository first.
A repository counts when it is public, sits outside the token owner's account and every org they belong to, and either merged one of their pull requests or carries their commits from a pull request closed unmerged, as when a maintainer lands a patch by hand.
Each card lists the pull requests behind it, and `src/render.ts` sets how many cards and pull requests show.
The rendered SVG is cached for the time `CACHE_SECONDS` in `cloudflare.config.ts` sets.

## Running locally

1. Create `.dev.vars` in this folder holding `GITHUB_TOKEN=<token>`.
   The file is git-ignored, and the token must never be committed.
2. Run `deno install`, then `deno task dev` from this folder.
3. Open `/contributions.svg` on the port `vite.config.ts` sets.

`deno task preview` writes the card to `preview.svg` without starting the Worker.

## Checking it

Run `deno task check` from this folder.

## Deploying it

Run `deno task deploy` from this folder.
The first deploy must pass the token with `--secrets-file .dev.vars`, since a Worker that does not exist yet cannot take a secret.
