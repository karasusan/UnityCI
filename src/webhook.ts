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

// Built-in app to expose stats about the deployment
export function webhookFunc (app: Application) {
  app.router.use('/webhook', middleware)

  // Webhook Proxy for UnityCloudBuild
  const webhookUrl = process.env.UNITYCLOUDBUILD_WEBHOOK_PROXY_URL
  if (process.env.NODE_ENV !== 'production' && webhookUrl) {
    createWebhookProxy({
      logger: app.log,
      path: '/webhook',
      port: 3000,
      url: webhookUrl
    })
  }

  function middleware (state: any, request: Request, response: Response, next: () => void) {
    const dataChunks: Uint8Array[] = []
    request.on('error', (error) => {
      response.statusCode = 500
      response.end(error.toString())
    })

    request.on('data', (chunk: Uint8Array) => {
      dataChunks.push(chunk)
    })

    request.on('end', () => {
      const data = Buffer.concat(dataChunks).toString()
      let payload

      try {
        payload = JSON.parse(data)
      } catch (error) {
        response.statusCode = 400
        response.end('Invalid JSON')
        return
      }

      app.log(payload)

      state.eventHandler.receive({
        id: 1,
        name: 'unitycloudbuild',
        payload: payload
      })
      response.end('ok\n')
      /*
      verifyAndReceive(state, {
        id: id,
        name: eventName,
        payload,
        signature
      })
        .then(() => {
          response.end('ok\n')
        })

        .catch(error => {
          response.statusCode = error.status || 500
          response.end(error.toString())
        })
    })
    */
    })
  }
}
