import {Application, Context} from 'probot' // eslint-disable-line
import { default as Build } from './build'
import Checks from './checks'
import {addContext, webhookFunc, BuildResult, BuildStatusType} from './webhook' // eslint-disable-line

export = (app: Application) => {
  app.load(webhookFunc)

  app.on(['pull_request.opened', 'pull_request.reopened'], checkPullRequest)
  app.on(['check_run.rerequested'], recheckPullRequest)
  app.on(['unitycloudbuild.completed', 'unitycloudbuild.in_progress'], publishBuildStatus)

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

    let _build = new Build(config, app.log)
    const resultRegisterHook = await _build.registerHook()
    if (![200, 201].includes(resultRegisterHook.status)) {
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
          summary: resultRegisterHook.status.toString() + ' ' + resultRegisterHook.text
        }

      })
      return
    }

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
      const clone = Object.assign({}, config)
      promises[i] = build(context, clone, clone.matrix[i], checkRunIdList[i])
    }
    await Promise.all(promises)
  }

  async function build (context: Context, config: any, param: any, checkRunId: number) {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository
    const checkRunName = `Unity CI - ${param.name}`
    const platform = param.platform
    const branch = pullRequest.head.ref
    const orgId = config.orgid
    const projectId = config.projectid
    const buildTargetId = Build.getBuildTargetId(branch, platform)

    let _build = new Build(config, app.log)
    const resultPrepareBuild = await _build.prepareBuildTarget(branch, platform)

    let checks = new Checks(orgId, projectId, buildTargetId)
    let checkParams = {
      id: checkRunId,
      name: checkRunName,
      repository: repository,
      buildStatus: BuildStatusType.queued,
      details: ''
    }

    // Build failed
    if (![200, 201, 202].includes(resultPrepareBuild.status)) {
      checkParams.buildStatus = BuildStatusType.failure
      checkParams.details = resultPrepareBuild.status.toString() + ' ' + resultPrepareBuild.text
      await context.github.checks.update(checks.parameter(checkParams))
      return
    }

    // cotext
    addContext(orgId, projectId, buildTargetId, context)

    // Start build
    const resultBuild = await _build.build(branch, platform)
    if (resultBuild.status !== 202) {
      checkParams.buildStatus = BuildStatusType.failure
      checkParams.details = resultBuild.status.toString() + ' ' + resultBuild.text
      await context.github.checks.update(checks.parameter(checkParams))
      return
    }

    const buildNumber = resultBuild.body[0].build
    checks.setBuildNumber(buildNumber)
    await context.github.checks.update(checks.parameter(checkParams))
  }

  async function recheckPullRequest (context: Context) {
  }

  async function publishBuildStatus (context: Context) {
    const pullRequest = context.payload.pull_request
    const repository = context.payload.repository
    const buildResult: BuildResult = context.payload.buildResult
    const buildTargetId = buildResult.buildTargetId

    const resultList = await context.github.checks.listForRef({
      owner: repository.owner.login,
      repo: repository.name,
      ref: pullRequest.head.ref
    })

    const checkRun = resultList.data.check_runs.find(_checkRun => _checkRun.external_id === buildTargetId)
    if (checkRun === undefined) {
      app.log.error(`checkRun not found ${JSON.stringify(buildResult)}`)
      return
    }
    const checkRunId = checkRun.id
    const checkRunName = checkRun.name
    let checks = new Checks(buildResult.orgId, buildResult.projectId, buildResult.buildTargetId, buildResult.buildNumber)
    const params = checks.parameter({
      id: checkRunId,
      name: checkRunName,
      repository: repository,
      buildStatus: buildResult.buildStatus,
      details: ''
    })

    // Completed
    await context.github.checks.update(params)
  }
}
