// https://docs.github.com/en/graphql/reference/objects#pullrequest
// https://docs.github.com/en/rest/search/search#search-commits
import { z } from 'zod'

export const viewerOutput = z.object({
  data: z.object({
    viewer: z.object({
      login: z.string(),
      organizations: z.object({
        nodes: z.array(z.object({
          login: z.string(),
        })),
      }),
    }),
  }),
})

export type ViewerOutput = z.infer<typeof viewerOutput>

const repository = z.object({
  nameWithOwner: z.string(),
  url: z.string(),
  description: z.string().nullable(),
  stargazerCount: z.number(),
  forkCount: z.number(),
  isPrivate: z.boolean(),
  primaryLanguage: z.object({
    name: z.string(),
    color: z.string().nullable(),
  }).nullable(),
})

export type Repository = z.infer<typeof repository>

const pullRequest = z.object({
  number: z.number(),
  title: z.string(),
  url: z.string(),
  merged: z.boolean(),
  repository,
})

export type PullRequest = z.infer<typeof pullRequest>

export const pullRequestSearchOutput = z.object({
  data: z.object({
    search: z.object({
      pageInfo: z.object({
        hasNextPage: z.boolean(),
        endCursor: z.string().nullable(),
      }),
      nodes: z.array(pullRequest),
    }),
  }),
})

export type PullRequestSearchOutput = z.infer<typeof pullRequestSearchOutput>

export const commitSearchOutput = z.object({
  total_count: z.number(),
})

export type CommitSearchOutput = z.infer<typeof commitSearchOutput>
