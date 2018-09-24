import { Application } from 'probot'
import { default as Build } from '../src/build'
import * as path from 'path'
import * as fs from 'fs'
const app = require('../src/index')

jest.mock('../src/build')

describe('UnityCI', () => {
  let robot: Application
  let github: any

  beforeEach(() => {
    robot = new Application()
    // Initialize the app based on the code from index.js
    robot.load(app)
  })

  describe('pull request open trigger build project', () => {
    it('without default config', async () => {
      const config = fs.readFileSync(path.resolve(__dirname, '../test/example.config.yml'), 'utf-8')
      github = {
        checks: {
          create: jest.fn().mockResolvedValue(null)
        },
        repos: {
          getContent: jest.fn().mockResolvedValue({
            data: {
              content: config
            }
          })
        }
      }
      const payloadCreateNewBuild = require('./fixtures/createnewbuild.json')
      Build.prototype.build = jest.fn().mockResolvedValue(payloadCreateNewBuild)
      robot.auth = () => Promise.resolve(github)
      const payloadPullrequest = require('./fixtures/pullrequest.event.json')
      await robot.receive(payloadPullrequest)
      expect(github.checks.create).toHaveBeenCalled()
    })
  })
})
