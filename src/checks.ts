import {BuildStatusType} from './webhook'

export default class Checks {
  private readonly url:string = '' // eslint-disable-line
  //private nameCheckRun = 'Unity CI - Pull Request' // eslint-disable-line

  constructor (private orgId: string, private projectId:string, private buildTargetId:string, private buildNumber:number) {
    this.url = process.env.UNITYCLOUDBUILD_DEVELOPER_URL +
      `/orgs/${this.orgId}/projects/${this.projectId}/buildtargets/${this.buildTargetId}/builds/${this.buildNumber}/log/compact/`
  }

  public parameter (
    id: number,
    name: string,
    repository:any,
    buildStatus: BuildStatusType = BuildStatusType.queued
  ) {
    const conclusion = this.convertConclusion(buildStatus)
    const status = this.convertChecksStatus(buildStatus)

    return {
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: id.toString(),
      external_id: this.buildTargetId,
      name: name,
      status: status,
      conclusion: conclusion,
      completed_at: conclusion ? new Date().toISOString() : undefined,
      output: {
        title: this.getTitle(buildStatus),
        summary: this.getSummary(status)
      }
    }
  }

  private getTitle (buildStatus:BuildStatusType) : string {
    switch (buildStatus) {
      case BuildStatusType.queued:
        return 'Build Queued'
      case BuildStatusType.sentToBuilder:
      case BuildStatusType.started:
      case BuildStatusType.restarted:
        return 'Build In Progress'
      case BuildStatusType.success:
        return 'Build Passed'
      case BuildStatusType.failure:
        return 'Build Failed'
      case BuildStatusType.canceled:
        return 'Build Canceled'
      case BuildStatusType.unknown:
        return 'Build is Unknown Status'
    }
  }

  private getSummary (status:string): string {
    switch (status) {
      case 'in_progress':
        return `[This Build](${this.url}) in progress.`
      case 'queued':
        return `[This Build](${this.url}) queued.`
      case 'completed':
        return `[This Build](${this.url}) completed.`
    }
    throw new Error(`Unknown build status ${status}`)
  }

  private convertConclusion (buildStatus:BuildStatusType) : 'success' | 'failure' | 'cancelled' | 'neutral' | undefined {
    switch (buildStatus) {
      case BuildStatusType.success:
        return 'success'
      case BuildStatusType.failure:
        return 'failure'
      case BuildStatusType.canceled:
        return 'cancelled'
      case BuildStatusType.unknown:
        return 'neutral'
    }
    return undefined
  }
  private convertChecksStatus (buildStatus:BuildStatusType) : 'queued' | 'in_progress' | 'completed' {
    switch (buildStatus) {
      case BuildStatusType.queued:
        return 'queued'
      case BuildStatusType.sentToBuilder:
      case BuildStatusType.started:
      case BuildStatusType.restarted:
        return 'in_progress'
      case BuildStatusType.success:
      case BuildStatusType.failure:
      case BuildStatusType.canceled:
      case BuildStatusType.unknown:
        return 'completed'
    }
  }
}
