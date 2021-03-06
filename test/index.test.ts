import { Application } from 'probot'
import { default as Build } from '../src/build'
import * as fs from 'fs'
import yaml from 'js-yaml'
import { parseBuildResult } from '../src/webhook'
const app = require('../src/index')

jest.mock('../src/build')

const textConfig = fs.readFileSync('./test/example.config.yml', 'utf-8')
const config = yaml.load(textConfig)

const payloadUpdateBuildTarget = require('./fixtures/updatebuildtarget.json')
const payloadPullrequest = require('./fixtures/pullrequest.event.json')
const payloadCreateNewBuild = require('./fixtures/createnewbuild.json')
const payloadChecksListForRef = require('./fixtures/checkslistforref.json')
const payloadAddWebhook = require('./fixtures/addwebhook.json')

const webhookBodyBuildResult = require('./fixtures/webhookbodybuildresult.json')

//const payloadCheckRunRerequested = require('./fixtures/checkrunrerequested.event.json')

describe('UnityCI', () => {
  let robot: Application
  let github: any

  beforeEach(() => {
    robot = new Application()
    // Initialize the app based on the code from index.js
    robot.load(app)
  })

  describe('pull_request.opened', () => {
    it('Pass', async () => {
      github = {
        checks: {
          create: jest.fn().mockResolvedValue({
            data: {
              id: 1
            }
          }),
          update: jest.fn().mockResolvedValue(null)
        },
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              content: Buffer.from(textConfig).toString('base64')
            }
          })
        }
      }
      Build.prototype.prepareBuildTarget = jest.fn().mockResolvedValue({
        status: 202,
        body: payloadUpdateBuildTarget
      })
      Build.prototype.build = jest.fn().mockResolvedValue({
        status: 202,
        body: payloadCreateNewBuild
      })
      Build.prototype.registerHook = jest.fn().mockResolvedValue({
        status: 201,
        body: payloadAddWebhook
      })

      robot.auth = () => Promise.resolve(github)
      await robot.receive(payloadPullrequest)
      expect(github.checks.create).toHaveBeenCalledTimes(config.matrix.length)
      expect(github.repos.getContent).toHaveBeenCalledTimes(1)
      expect(github.checks.update).toHaveBeenCalledTimes(config.matrix.length + 1)
      expect(Build.prototype.prepareBuildTarget).toHaveBeenCalledTimes(config.matrix.length)
      expect(Build.prototype.build).toHaveBeenCalledTimes(config.matrix.length)
    })
    it('Config File Not Found', async () => {
      github = {
        checks: {
          create: jest.fn().mockResolvedValue({
            data: {
              id: 1
            }
          }),
          update: jest.fn().mockResolvedValue(null)
        },
        repos: {
          getContent: jest.fn().mockImplementation(() => { throw Object({code: 404}) })
        }
      }
      robot.auth = () => Promise.resolve(github)
      await robot.receive(payloadPullrequest)
      expect(github.checks.create).toHaveBeenCalledTimes(1)
      expect(github.repos.getContent).toHaveBeenCalledTimes(1)
      expect(github.checks.create.mock.calls[0][0]).toMatchObject({
        status: 'completed',
        conclusion: 'neutral'
      })
    })
    it('Prepare Build Failed', async () => {
      github = {
        checks: {
          create: jest.fn().mockResolvedValue({
            data: {
              id: 1
            }
          }),
          update: jest.fn().mockResolvedValue(null)

        },
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              content: Buffer.from(textConfig).toString('base64')
            }
          })
        }
      }
      Build.prototype.prepareBuildTarget = jest.fn().mockResolvedValue({
        status: 400,
        text: payloadUpdateBuildTarget
      })
      robot.auth = () => Promise.resolve(github)
      await robot.receive(payloadPullrequest)
      expect(github.checks.create).toHaveBeenCalledTimes(config.matrix.length)
      expect(github.repos.getContent).toHaveBeenCalledTimes(1)
      expect(github.checks.update).toHaveBeenCalledTimes(config.matrix.length + 1)
      expect(github.checks.update.mock.calls[1][0]).toMatchObject({
        status: 'completed',
        conclusion: 'failure'
      })
      expect(Build.prototype.prepareBuildTarget).toHaveBeenCalledTimes(config.matrix.length)
    })
  })
  describe('unitycloudbuild.completed', () => {
    it('Pass', async () => {
      github = {
        checks: {
          update: jest.fn().mockResolvedValue(null),
          listForRef: jest.fn().mockResolvedValue({
            data: payloadChecksListForRef
          })
        }
      }
      robot.auth = () => Promise.resolve(github)
      const payloadBuildResult: any = Object.assign(payloadPullrequest, {})
      payloadBuildResult.name = 'unitycloudbuild'
      payloadBuildResult.payload.buildResult = parseBuildResult(webhookBodyBuildResult)
      payloadBuildResult.payload.buildResult.buildStatus = 'success'
      payloadBuildResult.payload.action = 'completed'

      await robot.receive(payloadBuildResult)
      expect(github.checks.update).toHaveBeenCalledTimes(1)
    })
  })
  describe('unitycloudbuild.failed', () => {
    it('Pass', async () => {
      github = {
        checks: {
          update: jest.fn().mockResolvedValue(null),
          listForRef: jest.fn().mockResolvedValue({
            data: payloadChecksListForRef
          })
        }
      }
      robot.auth = () => Promise.resolve(github)
      const payloadBuildResult: any = Object.assign(payloadPullrequest, {})
      payloadBuildResult.name = 'unitycloudbuild'
      payloadBuildResult.payload.buildResult = parseBuildResult(webhookBodyBuildResult)
      payloadBuildResult.payload.buildResult.buildStatus = 'failure'
      payloadBuildResult.payload.action = 'completed'

      await robot.receive(payloadBuildResult)
      expect(github.checks.update).toHaveBeenCalledTimes(1)
    })
  })
  describe('unitycloudbuild.canceled', () => {
    it('Pass', async () => {
      github = {
        checks: {
          update: jest.fn().mockResolvedValue(null),
          listForRef: jest.fn().mockResolvedValue({
            data: payloadChecksListForRef
          })
        }
      }
      robot.auth = () => Promise.resolve(github)
      const payloadBuildResult: any = Object.assign(payloadPullrequest, {})
      payloadBuildResult.name = 'unitycloudbuild'
      payloadBuildResult.payload.buildResult = parseBuildResult(webhookBodyBuildResult)
      payloadBuildResult.payload.buildResult.buildStatus = 'canceled'
      payloadBuildResult.payload.action = 'completed'

      await robot.receive(payloadBuildResult)
      expect(github.checks.update).toHaveBeenCalledTimes(1)
    })
  })
})
