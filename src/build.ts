import jsyaml from 'js-yaml'
import UnityCloudBuildAPI from './unitycloudbuild'
import request from 'superagent' // eslint-disable-line

export default class Build {
  private config: any // eslint-disable-line
  private api: UnityCloudBuildAPI // eslint-disable-line
  constructor (content: string) {
    this.config = jsyaml.load(content)
    this.api = new UnityCloudBuildAPI()
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
