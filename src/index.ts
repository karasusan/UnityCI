import { Application } from 'probot' // eslint-disable-line
import { default as Build } from './build'
import jsyaml from 'js-yaml'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository

    // TODO:: Load unityci.yaml from Repository
    const result = await context.github.repos.getContent({
      owner: repository.owner.login,
      repo: repository.name,
      path: 'unityci.yaml',
      ref: ''
    })
    if (pullRequest.head.user.login !== pullRequest.base.user.login) {
      // TODO:: Create PullReq Branch to base Repository
    }

    // TODO:: Create BuiltTarget on UnityCloudBuild

    // TODO:: Build Project on UnityCloudBuild
    const config = jsyaml.load(result.data.content)
    let _build = new Build(config)
    const result2 = await _build.build()
    app.log(result2)

    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    await context.github.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: 'Unity CI - Pull Request',
      head_sha: pullRequest.head.sha
    })
  })
}
