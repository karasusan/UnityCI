/* eslint-disable no-undef */
//import { WebhookEvent, WebhookPayloadWithRepository } from '@octokit/webhooks' // eslint-disable-line
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

// Built-in app to expose stats about the deployment
module.exports = (app: Application) => {
  // Cache of stats that get reported

  // Check for accounts (typically spammy or abusive) to ignore
  // const ignoredAccounts = (process.env.IGNORED_ACCOUNTS || '').toLowerCase().split(',')

  // Setup /webhook endpoint to return cached stats
  app.router.post('/webhook', async (req: Request, res: Response) => {
    app.log(req.body)
    //const repository = context.payload.repository
    const event: any = {
      event: 'unitycloudbuild',
      payload: {
        action: 'completed'
      }
    }
    return app.receive(event)
  })

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
