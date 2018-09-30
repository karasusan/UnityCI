import { Application } from 'probot'
import { default as Build } from '../src/build'
import * as path from 'path'
import * as fs from 'fs'
const app = require('../src/index')

jest.mock('../src/build')

const config = fs.readFileSync(path.resolve(__dirname, '../test/example.config.yml'), 'utf-8')
const payloadUpdateBuildTarget = require('./fixtures/updatebuildtarget.json')
const payloadCreateNewBuild = require('./fixtures/createnewbuild.json')
const payloadPullrequest = require('./fixtures/pullrequest.event.json')

describe('UnityCI', () => {
  let robot: Application
  let github: any

  beforeEach(() => {
    robot = new Application()
    // Initialize the app based on the code from index.js
    robot.load(app)
  })

  describe('pull request open trigger build project', () => {
    it('All Pass', async () => {
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
              content: Buffer.from(config).toString('base64')
            }
          })
        }
      }
      Build.prototype.prepareBuildTarget = jest.fn().mockResolvedValue({
        status: 202,
        text: payloadUpdateBuildTarget
      })
      Build.prototype.build = jest.fn().mockResolvedValue({
        status: 202,
        text: payloadCreateNewBuild
      })
      robot.auth = () => Promise.resolve(github)
      await robot.receive(payloadPullrequest)
      expect(github.checks.create).toHaveBeenCalledTimes(1)
      expect(github.repos.getContent).toHaveBeenCalledTimes(1)
      expect(github.checks.update).toHaveBeenCalledTimes(2)
      expect(github.checks.update.mock.calls[1][0]).toMatchObject({
        status: 'completed',
        conclusion: 'success'
      })
      expect(Build.prototype.prepareBuildTarget).toHaveBeenCalledTimes(1)
      expect(Build.prototype.build).toHaveBeenCalledTimes(1)
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
              content: Buffer.from(config).toString('base64')
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
      expect(github.checks.create).toHaveBeenCalledTimes(1)
      expect(github.repos.getContent).toHaveBeenCalledTimes(1)
      expect(github.checks.update).toHaveBeenCalledTimes(2)
      expect(github.checks.update.mock.calls[1][0]).toMatchObject({
        status: 'completed',
        conclusion: 'failure'
      })
      expect(Build.prototype.prepareBuildTarget).toHaveBeenCalledTimes(1)
    })
  })
})
