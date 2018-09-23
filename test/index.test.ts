import { Application } from 'probot'
import * as path from 'path'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
const payload = require('./fixtures/issues.event.json')
const app = require('../src/index')

describe('UnityCI', () => {
  let robot : Application
  let github : any

  beforeEach(() => {
    robot = new Application()
    // Initialize the app based on the code from index.js
    robot.load(app)
  })

  describe('pull request trigger build success', () => {
    const exampleConfig = fs.readFileSync(path.resolve(__dirname, '../test/example.config.yml'), 'utf-8')
    beforeEach(() => {
      github = {
        issues: {
          createComment: jest.fn().mockResolvedValue(null),
          edit: jest.fn().mockResolvedValue(null)
        }
      }
      // Passes the mocked out GitHub API into out app instance
      robot.auth = () => Promise.resolve(github)
    })

    it('without default config', async () => {
      const noDefaultConfig = yaml.safeLoad(exampleConfig)
      noDefaultConfig.caseInsensitive = true
      noDefaultConfig.issueConfigs = [{ 'content': ['TEST'] }]
      github = {
        issues: {
          createComment: jest.fn().mockResolvedValue(null),
          edit: jest.fn().mockResolvedValue(null)
        },
        repos: {
          getContent: jest.fn().mockResolvedValue({ data: {
            content: yaml.safeDump(noDefaultConfig),
            encoding: 'utf-8'
          }})
        }
      }
      robot.auth = () => Promise.resolve(github)
      await robot.receive(payload)
      expect(github.issues.createComment).toMatchSnapshot()
      expect(github.issues.edit).toMatchSnapshot()
      expect(github.repos.getContent).toMatchSnapshot()
    })
  })
})
