import { fetchContributions } from '../src/github.ts'
import { renderContributions } from '../src/render.ts'

const token = Deno.env.get('GITHUB_TOKEN')
if (!token) throw new Error('GITHUB_TOKEN is not set')

const contributions = await fetchContributions(token)
await Deno.writeTextFile('preview.svg', renderContributions(contributions))

for (const { repository, pullRequests } of contributions) {
  console.log(repository.nameWithOwner, pullRequests.map((pr) => `#${pr.number}`).join(' '))
}
