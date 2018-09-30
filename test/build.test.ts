import { default as Build } from '../src/build'
import * as path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

var nock = require('nock')

const listAllBuildTargets = require('./fixtures/listallbuildtargets.json')
const textConfig = fs.readFileSync(path.resolve(__dirname, '../test/unityci.yml'), 'utf-8')
const config = yaml.load(textConfig)

describe('UnityCI', () => {
  let build: Build
  const branch = 'master'
  const platform = 'standaloneosxuniversal'
  const buildtargetId = Build.getBuildTargetId(branch, platform)

  beforeEach(() => {
    build = new Build(config, console.log)
  })

  describe('Build', () => {
    it('prepareBuild Pass', async () => {
      nock(config.url)
        .post(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets`, config.option)
        .reply(201, {})
      nock(config.url)
        .get(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets`)
        .reply(200, listAllBuildTargets)
      const result = await build.prepareBuildTarget(branch, platform)
      expect(result.status).toBe(201)
    })
    it('clearBuild Pass', async () => {
      nock(config.url)
        .get(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets`)
        .reply(200, listAllBuildTargets)
      nock(config.url)
        .delete(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildtargetId}`, config.option)
        .reply(204, {})

      const result = await build.clearBuildTarget(branch, platform)
      expect(result.status).toBe(204)
    })
    it('build Pass', async () => {
      nock(config.url)
        .post(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildtargetId}/builds`)
        .reply(202, {})

      const result = await build.build(branch, platform)
      expect(result.status).toBe(202)
    })
  })
})
