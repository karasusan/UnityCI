import UnityCloudBuildAPI from '../../src/unitycloudbuild'
import * as path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

var nock = require('nock')

const url = 'https://build-api.cloud.unity3d.com'
const textConfig = fs.readFileSync(path.resolve(__dirname, '../../test/example.config.yml'), 'utf-8')
const config = yaml.load(textConfig)
//const apiKey = config.unitycloudbuild_apikey
const api: UnityCloudBuildAPI = new UnityCloudBuildAPI(url, undefined, config.apikey)

describe('UnityCloudBuild', () => {
  beforeEach(() => {
  })

  it('updateBuildTarget', async () => {
    nock(url)
      .put(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${config.buildtargetid}`, config.option)
      .reply(200, {})

    const result = await api.updateBuildTarget(config)
    expect(result.status).toBe(200)
  })
})
