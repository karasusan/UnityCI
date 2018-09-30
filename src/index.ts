import { Application } from 'probot' // eslint-disable-line
import { default as Build } from './build'

const nameCheck = 'Unity CI - Pull Request'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository
    // Load unityci.yaml from Repository
    const config = await context.config('unityci.yml')
    // unityci.yaml not found
    if (!config) {
      await context.github.checks.create({
        head_sha: pullRequest.head.sha,
        owner: repository.owner.login,
        repo: repository.name,
        name: nameCheck,
        status: 'completed',
        conclusion: 'neutral',
        completed_at: new Date().toISOString(),
        output: {
          title: 'CI was not work',
          summary: 'unityci.yml not found.'
        }
      })
      return
    }
    // Call Check API
    const result = await context.github.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: nameCheck,
      head_sha: pullRequest.head.sha
    })
    const checkRunId = result.data.id

    let branch = pullRequest.head.ref
    if (pullRequest.head.user.login !== pullRequest.base.user.login) {
      // TODO:: Create PullReq Branch to base Repository
    }

    // Call Check API
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: nameCheck,
      status: 'in_progress',
      output: {
        title: 'In Progress',
        summary: 'This build is in progress'
      }
    })

    for (const param of config.matrix) {
      let _build = new Build(config, app.log)
      // TODO:: Update BuiltTarget on UnityCloudBuild
      const resultPrepareBuild = await _build.prepareBuildTarget(branch, param.platform)

      // Build failed
      if (resultPrepareBuild.status !== 202) {
        await context.github.checks.update({
          owner: repository.owner.login,
          repo: repository.name,
          check_run_id: checkRunId.toString(),
          name: nameCheck,
          status: 'completed',
          conclusion: 'failure',
          completed_at: new Date().toISOString(),
          output: {
            title: 'Build Failed',
            summary: resultPrepareBuild.status.toString() + ' ' + resultPrepareBuild.body
          }
        })
        return
      }

      // TODO:: Build Project on UnityCloudBuild
      const result3 = await _build.build(branch, param.platform)
      if (result3.status !== 202) {
        await context.github.checks.update({
          owner: repository.owner.login,
          repo: repository.name,
          check_run_id: checkRunId.toString(),
          name: nameCheck,
          status: 'completed',
          conclusion: 'failure',
          completed_at: new Date().toISOString(),
          output: {
            title: 'Build Failed',
            summary: result3.status.toString() + ' ' + result3.body
          }
        })
        return
      }
    }

    // TODO:: Wait response from Unity Cloud Build
    // TODO:: Call Check API
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: nameCheck,
      status: 'completed',
      conclusion: 'success',
      completed_at: new Date().toISOString(),
      output: {
        title: 'Build Success',
        summary: 'Build Passed'
      }
    })
  })
}
