import { Application } from 'probot' // eslint-disable-line
import UnityCloudBuildAPI from './unitycloudbuild'

export = (app: Application) => {
  let api = new UnityCloudBuildAPI()
  console.log(api)

  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const title: string = context.payload.pull_request.title
    app.log('Pull Request received! ' + title)
    // TODO:: Call Unity Cloud Build API
    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
  })
  app.on('push', async context => {
    app.log('Push event received!')
    // TODO:: Call Unity Cloud Build API
    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
  })
}
