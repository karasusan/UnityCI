import {Application, Context} from 'probot' // eslint-disable-line
import { default as Build } from './build'
import Checks from './checks'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.reopened'], checkPullRequest)
  app.on('check_run.rerequested', recheckPullRequest)

  function convertConclusion (buildStatus:string) {
    switch (buildStatus) {
      case 'success':
        return 'success'
      case 'failure':
        return 'failure'
      case 'canceled':
        return 'cancelled'
      case 'unknown':
        return 'neutral'
    }
    throw new Error(`Unknown build status ${buildStatus}`)
  }

  async function checkPullRequest (context: Context) {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository
    const headSha = pullRequest.head.sha
    const nameCheckRun = 'Unity CI - Pull Request'
    // Load unityci.yaml from Repository
    const config = await context.config('unityci.yml')
    // unityci.yaml not found
    if (!config) {
      await context.github.checks.create({
        head_sha: headSha,
        owner: repository.owner.login,
        repo: repository.name,
        name: nameCheckRun,
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
      name: nameCheckRun,
      head_sha: headSha
    })
    const checkRunId = result.data.id

    if (pullRequest.head.user.login !== pullRequest.base.user.login) {
      // TODO:: Create PullReq Branch to base Repository
    }

    // Call Check API
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: nameCheckRun,
      status: 'in_progress',
      output: {
        title: 'In Progress',
        summary: 'This build is in progress'
      }
    })

    // Create Check run
    let checkRunIdList: number[] = new Array(config.matrix.length)
    checkRunIdList[0] = checkRunId
    for (let i = 1; i < checkRunIdList.length; i++) {
      const resultCreateCheckRun = await context.github.checks.create({
        owner: repository.owner.login,
        repo: repository.name,
        name: nameCheckRun,
        head_sha: headSha
      })
      checkRunIdList[i] = resultCreateCheckRun.data.id
    }

    // Parallel Execution
    let promises: Promise<void>[] = new Array(config.matrix.length)
    for (let i = 0; i < config.matrix.length; i++) {
      promises[i] = build(context, config, config.matrix[i], checkRunIdList[i])
    }
    await Promise.all(promises)
  }

  async function build (context: Context, config: any, param: any, checkRunId: number) {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository
    const nameCheckRun = `Unity CI - ${param.name}`
    const platform = param.platform

    let _build = new Build(config, app.log)
    let branch = pullRequest.head.ref
    // TODO:: Update BuiltTarget on UnityCloudBuild
    const resultPrepareBuild = await _build.prepareBuildTarget(branch, platform)

    // Build failed
    if (![200, 201, 202].includes(resultPrepareBuild.status)) {
      await context.github.checks.update({
        owner: repository.owner.login,
        repo: repository.name,
        check_run_id: checkRunId.toString(),
        name: nameCheckRun,
        status: 'completed',
        conclusion: 'failure',
        completed_at: new Date().toISOString(),
        output: {
          title: 'Build Failed',
          summary: resultPrepareBuild.status.toString() + ' ' + resultPrepareBuild.text
        }
      })
      return
    }

    // Start build
    const resultBuild = await _build.build(branch, platform)
    if (resultBuild.status !== 202) {
      await context.github.checks.update({
        owner: repository.owner.login,
        repo: repository.name,
        check_run_id: checkRunId.toString(),
        name: nameCheckRun,
        status: 'completed',
        conclusion: 'failure',
        completed_at: new Date().toISOString(),
        output: {
          title: 'Build Failed',
          summary: resultBuild.status.toString() + ' ' + resultBuild.text
        }
      })
      return
    }

    const orgId = resultBuild.body[0].orgid
    const projectId = resultBuild.body[0].projectid
    const buildTargetId = resultBuild.body[0].buildtargetid
    const buildNumber = resultBuild.body[0].build

    // In progress
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: nameCheckRun,
      status: 'in_progress',
      output: {
        title: 'In Progress',
        summary: Checks.getSummary(orgId, projectId, buildTargetId, buildNumber)
      }
    })

    const resultWaitForBuild = await _build.waitForBuild(branch, platform, buildNumber)
    if (resultWaitForBuild.status !== 200) {
      await context.github.checks.update({
        owner: repository.owner.login,
        repo: repository.name,
        check_run_id: checkRunId.toString(),
        name: nameCheckRun,
        status: 'completed',
        conclusion: 'failure',
        completed_at: new Date().toISOString(),
        output: {
          title: 'Build Failed',
          summary: resultBuild.status.toString() + ' ' + resultBuild.text
        }
      })
      return
    }
    const conclusion = convertConclusion(resultWaitForBuild.body.buildStatus)

    // Completed
    await context.github.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: checkRunId.toString(),
      name: nameCheckRun,
      status: 'completed',
      conclusion: conclusion,
      completed_at: new Date().toISOString(),
      output: {
        title: 'Build Success',
        summary: 'Build Passed'
      }
    })
  }

  async function recheckPullRequest (context: Context) {
  }
}
