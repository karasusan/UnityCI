import UnityCloudBuildAPI from './unitycloudbuild'
import { Response } from 'superagent'  // eslint-disable-line

export default class Build {
  private completedBuildStatues: string[] = ['success', 'failure', 'canceled', 'unknown'] // eslint-disable-line
  private api: UnityCloudBuildAPI // eslint-disable-line
  private PollingInterval: number = 60000 // eslint-disable-line
  private webhookUrl?: string = '' // eslint-disable-line
  private webhookSecret? = process.env.UNITYCLOUDBUILD_WEBHOOK_SECRET  // eslint-disable-line
  constructor (private config: any, private log: (msg: string) => void = (msg: string) => {}) {
    let logger = { log: this.log }
    this.api = new UnityCloudBuildAPI(this.config.url, logger, this.config.apikey)
    this.webhookUrl = process.env.UNITYCLOUDBUILD_WEBHOOK_URL
  }

  public static getBuildTargetId (branch: string, platform : string) : string {
    return `${branch}-${platform}`
  }

  static sleep (msec: number) : Promise<void> {
    return new Promise(resolve => setTimeout(resolve, msec))
  }

  async prepareBuildTarget (branch: string, platform : string) : Promise < Response > {
    // Get all build targets
    let result = await this.api.getBuildTargets(this.config)
    if (result.status !== 200) {
      return result
    }
    const buildTargets : any[] = result.body
    const buildTargetId = Build.getBuildTargetId(branch, platform)
    this.config.options.name = buildTargetId
    this.config.options.platform = platform

    // Check to exists same build target
    const isExistBuildTarget = buildTargets.find(x => x.buildtargetid === buildTargetId) !== undefined
    if (!isExistBuildTarget) {
      this.log(this.config)
      return this.api.addBuildTarget(this.config)
    }
    this.config.buildtargetid = buildTargetId
    return this.api.updateBuildTarget(this.config)
  }

  async registerHook () : Promise <Response> {
    const result = await this.api.listHooksForProject(this.config)
    if (result.status !== 200) {
      return result
    }
    const list: any[] = result.body
    if (list.filter(obj => obj.config.url === this.webhookUrl).length > 0) {
      return result
    }
    const options = {
      hookType: 'web',
      events: [
        'ProjectBuildQueued',
        'ProjectBuildStarted',
        'ProjectBuildRestarted',
        'ProjectBuildSuccess',
        'ProjectBuildFailure',
        'ProjectBuildCanceled',
        'ProjectBuildUpload'
      ],
      config: {
        url: this.webhookUrl,
        encoding: 'json',
        sslVerify: true,
        secret: this.webhookSecret,
        includeShare: true
      },
      active: true
    }

    const clone = Object.assign({}, this.config)
    clone.options = options
    this.log(clone.options.config.url)
    return this.api.addHookForProject(clone)
  }

  async clearBuildTarget (branch: string, platform : string) : Promise < Response > {
    this.config.buildtargetid = Build.getBuildTargetId(branch, platform)
    return this.api.deleteBuildTarget(this.config)
  }

  async build (branch: string, platform: string) : Promise < Response > {
    // Cancel all builds in progress for this build target
    this.config.buildtargetid = Build.getBuildTargetId(branch, platform)
    const resultCancelAllBuilds = await this.api.cancelAllBuilds(this.config)
    if (resultCancelAllBuilds.status !== 204) {
      return resultCancelAllBuilds
    }

    // Start build
    return this.api.startBuilds(this.config)
  }
  async waitForBuild (branch: string, platform: string, buildNumber: number) : Promise < Response > {
    this.config.number = buildNumber.toString()

    // Wait for build
    while (true) {
      const resultBuildStatus = await this.api.getBuild(this.config)
      if (resultBuildStatus.status !== 200) {
        return resultBuildStatus
      }
      if (this.completedBuildStatues.includes(resultBuildStatus.body.buildStatus)) {
        return resultBuildStatus
      }
      await Build.sleep(this.PollingInterval)
    }
  }
}
