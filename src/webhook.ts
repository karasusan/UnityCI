import {Application} from 'probot'  // eslint-disable-line
import {GitHubAPI} from "probot/lib/github" // eslint-disable-line

const Bottleneck = require('bottleneck')

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 0 })

const defaults = {
  delay: !process.env.DISABLE_DELAY, // Should the first run be put on a random delay?
  interval: 60 * 60 * 1000 // 1 hour
}

module.exports = (robot: Application, options: any) => {
  options = Object.assign({}, defaults, options || {})
  const intervals : any[] = []

  setup()

  function setup () {
    return eachInstallation(setupInstallation)
  }

  function setupInstallation (installation:any) {
    limiter.schedule(eachRepository, installation, (repository: any) => {
      addHook(installation, repository)
    })
  }

  function addHook (installation: any, repository: any) {
    if (intervals[repository.id]) {
      return
    }

    // Wait a random delay to more evenly distribute requests
    const delay = options.delay ? options.interval * Math.random() : 0

    robot.log.debug({repository, delay, interval: options.interval}, `Scheduling interval`)

    intervals[repository.id] = setTimeout(() => {
      const event = {
        event: 'schedule',
        payload: {action: 'repository', installation, repository}
      }

      // Trigger events on this repository on an interval
      intervals[repository.id] = setInterval(() => robot.receive(event), options.interval)

      // Trigger the first event now
      robot.receive(event)
    }, delay)
  }

  async function eachInstallation (callback: (installation:any) => void) {
    robot.log.trace('Fetching installations')
    const github = await robot.auth()
    const req = github.apps.getInstallations({per_page: 100})
    await github.paginate(req, res => {
      (options.filter ? res.data.filter((inst:any) => options.filter(inst)) : res.data).forEach(callback)
    })
  }

  async function eachRepository (installation: any, callback: (msg: any, github: GitHubAPI) => void) {
    robot.log.trace({installation}, 'Fetching repositories for installation')
    const github = await robot.auth(installation.id)
    const req = github.apps.getInstallationRepositories({per_page: 100})
    return github.paginate(req, (res: any) => {
      const repos = res.data.repositories;
      (options.filter ? repos.filter((repo:any) => options.filter(installation, repo)) : repos)
        .forEach(async (repository: any) => callback(repository, github))
    })
  }

  function stop (repository:any) {
    robot.log.debug({repository}, `Canceling interval`)
    clearInterval(intervals[repository.id])
  }

  return {stop}
}
