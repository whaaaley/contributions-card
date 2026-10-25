import {
  commitSearchOutput,
  type PullRequest,
  pullRequestSearchOutput,
  type Repository,
  viewerOutput,
} from './github.schema.ts'

export type Contribution = {
  repository: Repository
  pullRequests: PullRequest[]
}

const viewerQuery = '{ viewer { login organizations(first: 100) { nodes { login } } } }'

const pullRequestQuery = `query ($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number title url merged
        repository {
          nameWithOwner url description stargazerCount forkCount isPrivate
          primaryLanguage { name color }
        }
      }
    }
  }
}`

const headers = (token: string): HeadersInit => ({
  authorization: `Bearer ${token}`,
  'user-agent': 'contributions-card',
  accept: 'application/vnd.github+json',
})

const fetchGraphql = async (token: string, query: string, variables: Record<string, unknown>): Promise<unknown> => {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) throw new Error(`GitHub GraphQL answered ${response.status}`)

  return await response.json()
}

const fetchPullRequests = async (token: string, q: string): Promise<PullRequest[]> => {
  const pullRequests: PullRequest[] = []
  let after: string | null = null

  while (true) {
    const raw = await fetchGraphql(token, pullRequestQuery, { q, after })
    const { search } = pullRequestSearchOutput.parse(raw).data

    pullRequests.push(...search.nodes)
    if (!search.pageInfo.hasNextPage) break
    after = search.pageInfo.endCursor
  }

  return pullRequests
}

// A maintainer can land a pull request's commits by hand and close it unmerged, so commits in the repository count too.
const fetchHasCommits = async (token: string, login: string, repository: string): Promise<boolean> => {
  const url = new URL('https://api.github.com/search/commits')
  url.searchParams.set('q', `author:${login} repo:${repository}`)
  url.searchParams.set('per_page', '1')

  const response = await fetch(url, { headers: headers(token) })
  if (!response.ok) throw new Error(`GitHub commit search answered ${response.status}`)

  return commitSearchOutput.parse(await response.json()).total_count > 0
}

// Lists the public repositories outside the token owner's account and orgs where their work landed, most starred first.
export const fetchContributions = async (token: string): Promise<Contribution[]> => {
  const { viewer } = viewerOutput.parse(await fetchGraphql(token, viewerQuery, {})).data
  const owners = [viewer.login, ...viewer.organizations.nodes.map((org) => org.login)]
  const exclusions = owners.map((owner) => `-user:${owner}`).join(' ')
  const base = `is:pr is:public author:${viewer.login} ${exclusions}`

  const [merged, unmerged] = await Promise.all([
    fetchPullRequests(token, `${base} is:merged`),
    fetchPullRequests(token, `${base} is:closed is:unmerged`),
  ])

  const mergedRepositories = new Set(merged.map((pr) => pr.repository.nameWithOwner))
  const candidates = [...new Set(unmerged.map((pr) => pr.repository.nameWithOwner))]
    .filter((name) => !mergedRepositories.has(name))

  const landed = await Promise.all(candidates.map((name) => fetchHasCommits(token, viewer.login, name)))
  const landedRepositories = new Set(candidates.filter((_, index) => landed[index]))

  const byRepository = new Map<string, Contribution>()

  for (const pr of [...merged, ...unmerged]) {
    const name = pr.repository.nameWithOwner
    const counts = mergedRepositories.has(name) ? pr.merged : landedRepositories.has(name)
    if (pr.repository.isPrivate || !counts) continue

    const contribution = byRepository.get(name) ?? { repository: pr.repository, pullRequests: [] }
    contribution.pullRequests.push(pr)
    byRepository.set(name, contribution)
  }

  return [...byRepository.values()].sort((a, b) => b.repository.stargazerCount - a.repository.stargazerCount)
}
