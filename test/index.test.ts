import { Application } from 'probot'
//import * as path from 'path'
//import * as yaml from 'js-yaml'
//import * as fs from 'fs'
const app = require('../src/index')

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
      github = {
        checks: {
          create: jest.fn().mockResolvedValue(null)
        },
        pullRequests: {
          createReviewRequest: jest.fn().mockResolvedValue(null)
        }
      }
      const payload = require('./fixtures/pullrequest.event.json')
      robot.auth = () => Promise.resolve(github)
      await robot.receive(payload)
      expect(github.checks.create).toHaveBeenCalled()
    })
  })
})
