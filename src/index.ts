import { Application } from 'probot' // eslint-disable-line

export = (app: Application) => {
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
