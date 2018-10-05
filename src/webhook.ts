/* eslint-disable no-undef */
import { AnyResponse } from '@octokit/rest' // eslint-disable-line
import { Request, Response } from 'express' // eslint-disable-line

// Built-in app to expose stats about the deployment
module.exports = async (app: any): Promise<void> => {
  // Cache of stats that get reported
  const stats = { installations: 0, popular: [{}] }

  // Refresh the stats when the ApplicationFunction is loaded
  const initializing = refresh()

  // Check for accounts (typically spammy or abusive) to ignore
  const ignoredAccounts = (process.env.IGNORED_ACCOUNTS || '').toLowerCase().split(',')

  // Setup /probot/stats endpoint to return cached stats
  app.router.get('/probot/webhook', async (req: Request, res: Response) => {
    // ensure stats are loaded
    await initializing
    res.json(stats)
  })

  async function refresh () {
    const installations = await getInstallations()

    stats.installations = installations.length
    stats.popular = await popularInstallations(installations)
  }

  async function getInstallations (): Promise<Installation[]> {
    const github = await app.auth()
    const req = github.apps.getInstallations({ per_page: 100 })
    return github.paginate(req, (res: AnyResponse) => res.data)
  }

  async function popularInstallations (installations: Installation[]): Promise<Account[]> {
    let popular = await Promise.all(installations.map(async (installation) => {
      const { account } = installation

      if (ignoredAccounts.includes(account.login.toLowerCase())) {
        account.stars = 0
        app.log.debug({ installation }, 'Installation is ignored')
        return account
      }

      const github = await app.auth(installation.id)

      const req = github.apps.getInstallationRepositories({ per_page: 100 })
      const repositories: Repository[] = await github.paginate(req, (res: AnyResponse) => {
        return res.data.repositories.filter((repository: Repository) => !repository.private)
      })

      account.stars = repositories.reduce((stars, repository) => {
        return stars + repository.stargazers_count
      }, 0)

      return account
    }))

    popular = popular.filter(installation => installation.stars > 0)
    return popular.sort((a, b) => b.stars - a.stars).slice(0, 10)
  }
}

interface Installation {
  id: number
  account: Account
}

interface Account {
  stars: number
  login: string
}

interface Repository {
  private: boolean
  stargazers_count: number // eslint-disable-line
}
