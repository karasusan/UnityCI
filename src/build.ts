import UnityCloudBuildAPI from './unitycloudbuild'
import request from 'superagent'

export default class Build {
  private api: UnityCloudBuildAPI // eslint-disable-line
  constructor (private config: any, private log: (msg: string) => void = (msg: string) => {}) {
    let logger = { log: this.log }
    this.api = new UnityCloudBuildAPI(this.config.url, logger, this.config.apikey)
  }

  async prepareBuild (branch : string, platform : string) : Promise < request.Response > {
    return this.api.updateBuildTarget(this.config)
  }

  async build () : Promise < request.Response > {
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
