export default class Checks {
  static url = 'https://developer.cloud.unity3d.com/build' // eslint-disable-line

  public static getSummary (orgId:string, projectId:string, buildTargetId:string, buildNumber:number): string {
    const url = Checks.url + `/orgs/${orgId}/projects/${projectId}/buildtargets/${buildTargetId}/builds/${buildNumber}/log/compact/`
    return `[This Build](${url}) in progress.`
  }
}
