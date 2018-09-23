import UnityCloudBuildAPI from '../../src/unitycloudbuild'

describe('UnityCloudBuild', () => {
  let github : any

  beforeEach(() => {
    github = jest.fn()
    //UnityCloudBuildAPI.auth()
  })

  it('extracts the right information', () => {
    //expect(notifier.repo).toMatch({ owner: 'foo', repo: 'bar' })
    expect(github).not.toHaveBeenCalled()
  })

  describe('build', () => {
    it('build branch succeed', async () => {
      console.log(UnityCloudBuildAPI)
    })
  })
})
