import { Application } from 'probot' // eslint-disable-line
import UnityCloudBuildAPI from './unitycloudbuild'

export = (app: Application) => {
  let api = new UnityCloudBuildAPI()
  console.log(api)

  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const issueBody : string = context.payload.issue.body
    app.log('Pull Request received! ' + issueBody)
  })
  app.on('push', async context => {
    // Code was pushed to the repo, what should we do with it?
    app.log(context)
    //context.github.checks.
  })
}
