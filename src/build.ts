import UnityCloudBuildAPI from './unitycloudbuild'
import { Response } from 'superagent'  // eslint-disable-line

export default class Build {
  private api: UnityCloudBuildAPI // eslint-disable-line
  constructor (private config: any, private log: (msg: string) => void = (msg: string) => {}) {
    let logger = { log: this.log }
    this.api = new UnityCloudBuildAPI(this.config.url, logger, this.config.apikey)
  }

  public static getBuildTargetId (branch: string, platform : string) : string {
    return `${branch}-${platform}`
  }

  async prepareBuildTarget (branch: string, platform : string) : Promise < Response > {
    let result = await this.api.getBuildTargets(this.config)
    if (result.status !== 200) {
      return result
    }
    const buildTargets : any[] = JSON.parse(result.text)
    const buildTargetId = Build.getBuildTargetId(branch, platform)
    this.config.options.name = buildTargetId
    this.config.options.platform = platform

    const isExistBuildTarget = buildTargets.find(x => x.buildtargetid === buildTargetId) !== undefined
    if (!isExistBuildTarget) {
      this.log(this.config)
      return this.api.addBuildTarget(this.config)
    }
    this.config.options.buildtargetid = buildTargetId
    return this.api.updateBuildTarget(this.config)
  }

  async clearBuildTarget (branch: string, platform : string) : Promise < Response > {
    const buildTargetId = Build.getBuildTargetId(branch, platform)
    this.config.buildtargetid = buildTargetId
    return this.api.deleteBuildTarget(this.config)
  }

  async build () : Promise < Response > {
    return this.api.startBuilds({
      orgid: this.config.orgid,
      projectid: this.config.projectid,
      buildtargetid: this.config.buildtargetid,
      options: {
        clean: true,
        delay: 0,
        commit: '',
        headless: false,
        label: 'standaloneosxintel64',
        platform: 'standaloneosxintel64'
      }
    })
  }
}
