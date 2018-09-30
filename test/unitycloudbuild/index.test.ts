import UnityCloudBuildAPI from '../../src/unitycloudbuild'
import * as path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

var nock = require('nock')

const textConfig = fs.readFileSync(path.resolve(__dirname, '../../test/example.config.yml'), 'utf-8')
const config = yaml.load(textConfig)
//const apiKey = config.unitycloudbuild_apikey
const api: UnityCloudBuildAPI = new UnityCloudBuildAPI(config.url, undefined, config.apikey)

describe('UnityCloudBuild', () => {
  beforeEach(() => {
  })

  it('addBuildTarget', async () => {
    nock(config.url)
      .post(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets`, config.option)
      .reply(200, {})

    const result = await api.addBuildTarget(config)
    expect(result.status).toBe(200)
  })
  it('updateBuildTarget', async () => {
    nock(config.url)
      .put(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${config.buildtargetid}`, config.option)
      .reply(200, {})

    const result = await api.updateBuildTarget(config)
    expect(result.status).toBe(200)
  })
})
