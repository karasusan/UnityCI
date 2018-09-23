import { Application } from 'probot' // eslint-disable-line
import UnityCloudBuildAPI from './unitycloudbuild'

export = (app: Application) => {
  let api = new UnityCloudBuildAPI()
  console.log(api)

  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const pullReqiest = context.payload.pull_request
    const repository = context.payload.repository
    // TODO:: Call Unity Cloud Build API
    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    await context.github.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: 'Unity CI - Pull Request',
      head_sha: pullReqiest.head.sha
    })
  })
}
