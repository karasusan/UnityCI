import { default as Build } from '../src/build'
import * as path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

var nock = require('nock')

const payloadListAllBuildTargets = require('./fixtures/listallbuildtargets.json')
const payloadCreateNewBuild = require('./fixtures/createnewbuild.json')
const payloadBuildStatus = require('./fixtures/buildstatus.json')

const textConfig = fs.readFileSync(path.resolve(__dirname, '../test/example.config.yml'), 'utf-8')
const config = yaml.load(textConfig)

describe('UnityCI', () => {
  let build: Build
  const branch = 'master'
  const platform = 'standaloneosxuniversal'
  const buildTargetId = Build.getBuildTargetId(branch, platform)
  const buildNumber = payloadCreateNewBuild[0].build

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
        .reply(200, payloadListAllBuildTargets)
      const result = await build.prepareBuildTarget(branch, platform)
      expect(result.status).toBe(201)
    })
    it('clearBuild Pass', async () => {
      nock(config.url)
        .get(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets`)
        .reply(200, payloadListAllBuildTargets)
      nock(config.url)
        .delete(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildTargetId}`, config.option)
        .reply(204, {})

      const result = await build.clearBuildTarget(branch, platform)
      expect(result.status).toBe(204)
    })
    it('build Pass', async () => {
      nock(config.url)
        .post(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildTargetId}/builds`)
        .reply(202, payloadCreateNewBuild)
      nock(config.url)
        .delete(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildTargetId}/builds`)
        .reply(204, {})

      const result = await build.build(branch, platform)
      expect(result.status).toBe(202)
    })
    it('waitForBuild Pass', async () => {
      nock(config.url)
        .get(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${buildTargetId}/builds/${buildNumber}`)
        .reply(200, payloadBuildStatus)

      const result = await build.waitForBuild(branch, platform, buildNumber)
      expect(result.status).toBe(200)
    })
  })
})
