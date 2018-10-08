/* eslint-disable no-undef */
import { Request, Response } from 'express' // eslint-disable-line
import {Application, Context} from 'probot' // eslint-disable-line
import {createWebhookProxy} from 'probot/lib/webhook-proxy'
import md5 from "md5"; // eslint-disable-line

const contexts: { [key: string]: Context } = {} // eslint-disable-line

export function addContext (orgId: string, projectId: string, buildTargetId: string, context:Context) {
  const hash = getHash(orgId, projectId, buildTargetId)
  contexts[hash] = context
}

export function deleteContext (hash: string) {
  delete contexts[hash]
}

function getHash (orgId: string, projectId: string, buildTargetId: string) : string {
  return md5(`${orgId}/${projectId}/${buildTargetId}`)
}

export function webhookFunc (app: Application) {
  app.router.use(middleware)
  app.router.post('/webhook', async (req: Request, res: Response) => {
    res.writeHead(200)
    res.end()

    const result: BuildResult = parseBuildResult(req.body)
    const hash = getHash(result.orgId, result.projectId, result.buildTargetId)
    const context = contexts[hash]

    const event = {
      name: 'unitycloudbuild',
      payload: context.payload
    }
    event.payload.action = convertEventAction(result.buildStatus)
    event.payload.buildResult = result
    return app.receive(event)
  })

  // Launch Smee client to receive webhook from UnityCloudBuild
  const webhookUrl = process.env.UNITYCLOUDBUILD_WEBHOOK_PROXY_URL
  if (process.env.NODE_ENV !== 'production' && webhookUrl) {
    createWebhookProxy({
      logger: app.log,
      path: '/webhook',
      port: 3000,
      url: webhookUrl
    })
  }
}

export interface BuildResult {
  orgId: string
  projectId: string
  buildTargetId: string
  buildNumber: number
  buildStatus: BuildStatusType
}

export enum BuildStatusType {
  queued = 'queued',
  sentToBuilder = 'sentToBuilder',
  started = 'started',
  restarted = 'restarted',
  success = 'success',
  failure = 'failure',
  canceled = 'canceled',
  unknown = 'unknown'
}

function convertEventAction (buildStatus : BuildStatusType): string {
  switch (buildStatus) {
    case BuildStatusType.queued:
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

export function parseBuildResult (body: any) : BuildResult {
  const path = body.links.api_self.href
  const splitted = path.split('/')
  return {
    orgId: splitted[3],
    projectId: splitted[5],
    buildTargetId: splitted[7],
    buildNumber: splitted[9],
    buildStatus: BuildStatusType[body.buildStatus] as BuildStatusType
  }
}

function middleware (request: Request, response: Response, next: () => void) {
  // TODO::verify request
  if (request.headers['x-unity-event'] === undefined) {
    response.statusCode = 400
    response.end('Invalid Request')
    return
  }

  const dataChunks: Uint8Array[] = []
  request.on('error', (error) => {
    response.statusCode = 500
    response.end(error.toString())
  })

  request.on('data', (chunk: Uint8Array) => {
    dataChunks.push(chunk)

    const data = Buffer.concat(dataChunks).toString()
    let payload

    try {
      payload = JSON.parse(data)
    } catch (error) {
      response.statusCode = 400
      response.end('Invalid JSON')
      return
    }
    request.body = payload
    next()
  })

  /*
  // TODO:: 'end' event not fired, why?
  request.on('end', () => {
    console.log('end')
  })
  */
}
