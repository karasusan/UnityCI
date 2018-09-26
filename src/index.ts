import { Application } from 'probot' // eslint-disable-line
import { default as Build } from './build'
import jsyaml from 'js-yaml'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository

    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    const result = await context.github.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: 'Unity CI - Pull Request',
      head_sha: pullRequest.head.sha
    })
    const checkRunId = result.data.id

    // TODO:: Load unityci.yaml from Repository
    const result1 = await context.github.repos.getContent({
      owner: repository.owner.login,
      repo: repository.name,
      path: 'unityci.yaml',
      ref: ''
    })
    if (result.status !== 404) {
      app.log('unityci.yaml not found' + result1.status + ' ' + result1.data)
      return
    }

    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: 'Unity CI - Pull Request',
      status: 'in_progress',
      output: {
        title: 'In Progress',
        summary: 'This build is in progress'
      }
    })
    let branch = pullRequest.head.ref
    if (pullRequest.head.user.login !== pullRequest.base.user.login) {
      // TODO:: Create PullReq Branch to base Repository
    }

    const config = jsyaml.load(result1.data.content)
    let _build = new Build(config)
    // TODO:: Update BuiltTarget on UnityCloudBuild
    const result2 = await _build.prepareBuild(branch, 'standaloneosxuniversal')
    if (result2.status !== 202) {
      app.log('prepareBuild return ' + result2.status + ' ' + result2.text)
      return
    }

    // TODO:: Build Project on UnityCloudBuild
    const result3 = await _build.build()
    if (result3.status !== 202) {
      app.log('prepareBuild return ' + result3.status + ' ' + result3.text)
    }

    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    await context.github.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: 'unityci',
      head_sha: pullRequest.head.sha,
      status: 'completed',
      output: {
        title: 'Unity CI - Pull Request',
        summary: 'Build Passed'
      }
    })
  })
}
