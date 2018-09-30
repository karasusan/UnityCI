import { default as Build } from '../src/build'
import * as path from 'path'
import * as fs from 'fs'
import yaml from 'js-yaml'

var nock = require('nock')

const textConfig = fs.readFileSync(path.resolve(__dirname, '../test/example.config.yml'), 'utf-8')
const config = yaml.load(textConfig)

describe('UnityCI', () => {
  let build: Build

  beforeEach(() => {
    build = new Build(config, console.log)
  })

  describe('pull request open trigger build project', () => {
    it('Prepare Build Pass', async () => {
      nock(config.url)
        .put(`/orgs/${config.orgid}/projects/${config.projectid}/buildtargets/${config.buildtargetid}`, config.option)
        .reply(200, {})
      const result = await build.prepareBuild('master', 'standaloneosxintel64')
      expect(result.status).toBe(200)
    })
  })
})
