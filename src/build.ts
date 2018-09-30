import UnityCloudBuildAPI from './unitycloudbuild'
import { Response } from 'superagent'  // eslint-disable-line

export default class Build {
  private completedBuildStatues: string[] = ['success', 'failure', 'canceled', 'unknown'] // eslint-disable-line
  private api: UnityCloudBuildAPI // eslint-disable-line
  private PollingInterval: number = 60000  // eslint-disable-line
  constructor (private config: any, private log: (msg: string) => void = (msg: string) => {}) {
    let logger = { log: this.log }
    this.api = new UnityCloudBuildAPI(this.config.url, logger, this.config.apikey)
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
    const resultStartBuilds = await this.api.startBuilds(this.config)
    if (resultStartBuilds.status !== 202) {
      return resultStartBuilds
    }
    const buildNumber = resultStartBuilds.body[0].build
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
