import request from 'superagent'
import { SuperAgentStatic } from 'superagent'

type CallbackHandler = (err: any, res ? : request.Response) => void

type Logger = {
  log: (line: string) => any
}

/**
 * This API is intended to be used in conjunction with the Unity Cloud Build
service. A tool for building your Unity projects in the Cloud.

See https://developer.cloud.unity3d.com for more information.

## Making requests
This website is built to allow requests to be made against the API. If you are
currently logged into Cloud Build you should be able to make requests without
entering an API key.


You can find your API key in the Unity Cloud Services portal by clicking on
'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
upper left corner of this website. It will be used in all subsequent requests.

## Clients
The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
your projects can easily be generated with the
[Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

The JSON schema required to generate a client for this API version is located here:

```
[API_URL][BASE_PATH]/api.json
```

## Authorization
The Unity Cloud Build API requires an access token from your Unity Cloud
Build account, which can be found at https://build.cloud.unity3d.com/login/me

To authenticate requests, include a Basic Authentication header with
your API key as the value. e.g.

```
Authorization: Basic [YOUR API KEY]
```

## Pagination
Paged results will take two parameters. A page number that is calculated based
upon the per_page amount. For instance if there are 40 results and you specify
page 2 with per_page set to 10 you will receive records 11-20.

Paged results will also return a Content-Range header. For the example above the
content range header would look like this:

```
Content-Range: items 11-20/40
```

## Versioning
The API version is indicated in the request URL. Upgrading to a newer API
version can be done by changing the path.

The API will receive a new version in the following cases:

  * removal of a path or request type
  * addition of a required field
  * removal of a required field

The following changes are considered backwards compatible and will not trigger a new
API version:

  * addition of an endpoint or request type
  * addition of an optional field
  * removal of an optional field
  * changes to the format of ids

## Rate Limiting
Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
the quality of service throughout Cloud Build, additional rate limits may apply to some
actions. For example, polling aggressively instead of using webhooks or making API calls
with a high concurrency may result in rate limiting.

It is not intended for these rate limits to interfere with any legitimate use of the API.
Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

You can check the returned HTTP headers for any API request to see your current rate limit status.
  * __X-RateLimit-Limit:__ maximum number of requests per minute
  * __X-RateLimit-Remaining:__ remaining number of requests in the current window
  * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

Once you go over the rate limit you will receive an error response:
```
HTTP Status: 429
{
  "error": "Rate limit exceeded, retry in XX seconds"
}
```

 * @class UnityCloudBuildAPI
 * @param {(string)} [domainOrOptions] - The project domain.
 */
export default class UnityCloudBuildAPI {

  private domain: string = ""
  private errorHandlers: CallbackHandler[] = []

  constructor(domain ? : string, private logger ? : Logger, private apikey? : string) {
    if (domain) {
      this.domain = domain
    }
  }

  getDomain() {
    return this.domain
  }

  addErrorHandler(handler: CallbackHandler) {
    this.errorHandlers.push(handler)
  }

  private request(method: string, url: string, body: any, headers: any, queryParameters: any, form: any, reject: CallbackHandler, resolve: CallbackHandler) {
    if (this.logger) {
      this.logger.log(`Call ${method} ${url}`)
    }

    let req = (request as SuperAgentStatic)(method, url).query(queryParameters)

    //Add APIKEY to HeaderParameter
    headers['Authorization'] = `Basic ${this.apikey}`

    Object.keys(headers).forEach(key => {
      req.set(key, headers[key])
    })

    if (body) {
      req.send(body)
    }

    if (typeof(body) === 'object' && !(body.constructor.name === 'Buffer')) {
      req.set('Content-Type', 'application/json')
    }

    if (Object.keys(form).length > 0) {
      req.type('form')
      req.send(form)
    }

    req.end((error, response) => {
      if (error || !response.ok) {
        reject(error)
        this.errorHandlers.forEach(handler => handler(error))
      } else {
        resolve(response)
      }
    })
  }

  listUnityVersionsURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/versions/unity'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * List all unity versions
   * @method
   * @name UnityCloudBuildAPI#listUnityVersions
   */
  listUnityVersions(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/versions/unity'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listXcodeVersionsURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/versions/xcode'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * List all xcode versions
   * @method
   * @name UnityCloudBuildAPI#listXcodeVersions
   */
  listXcodeVersions(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/versions/xcode'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getUserSelfURL(parameters: {
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me'
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the currently authenticated user.
   * @method
   * @name UnityCloudBuildAPI#getUserSelf
   * @param {string} include - Extra fields to include in the response
   */
  getUserSelf(parameters: {
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateUserSelfURL(parameters: {
    'options' ? : {
      'disableNotifications': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * You can update a few fields on the current user. Each field is optional and you
  do not need to specify all fields on update.
  * @method
  * @name UnityCloudBuildAPI#updateUserSelf
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  updateUserSelf(parameters: {
    'options' ? : {
      'disableNotifications': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getUserApiKeyURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/apikey'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the currently authenticated user's API key.
   * @method
   * @name UnityCloudBuildAPI#getUserApiKey
   */
  getUserApiKey(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/apikey'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  regenApiKeyURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/apikey'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Remove current API key and generate a new one. *WARNING* you will need to use the returned
  API key in all subsequent calls.
  * @method
  * @name UnityCloudBuildAPI#regenApiKey
  */
  regenApiKey(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/apikey'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/x-www-form-urlencoded'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listDevicesForUserURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/devices'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * List all iOS device profiles for the current user
   * @method
   * @name UnityCloudBuildAPI#listDevicesForUser
   */
  listDevicesForUser(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/devices'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  createDeviceURL(parameters: {
    'options': {
      'udid': string

      'devicename': string

      'os': string

      'osversion': string

      'product': string

      'status': "disabled" | "active"

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/devices'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Create iOS device profile for the current user
  * @method
  * @name UnityCloudBuildAPI#createDevice
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  createDevice(parameters: {
    'options': {
      'udid': string

      'devicename': string

      'os': string

      'osversion': string

      'product': string

      'status': "disabled" | "active"

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/users/me/devices'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBillingPlansURL(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/billingplan'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the billing plan for the specified organization
   * @method
   * @name UnityCloudBuildAPI#getBillingPlans
   * @param {string} orgid - Organization identifier
   */
  getBillingPlans(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/billingplan'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listHooksForOrgURL(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * List all hooks configured for the specified organization
   * @method
   * @name UnityCloudBuildAPI#listHooksForOrg
   * @param {string} orgid - Organization identifier
   */
  listHooksForOrg(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addHookForOrgURL(parameters: {
    'orgid': string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Adds a new organization level hook. An organization level hook is triggered by events from all projects
  belonging to the organziation. NOTE: you must be a manager in the organization to add new hooks.
  <h4>Hook Type Configuration Parameters</h4>
  <div class="webhook-tag-desc">
  <table>
  <tr><th>Type</th><th>Configuration Options</th></tr>
  <tr>
     <td><code>web</code>
     <td>
      <table>
       <tr><th>url</th><td>Endpoint to submit POST request</td></tr>
       <tr><th>encoding</th><td>Either <code>json</code> (default) or <code>form</code></td></tr>
       <tr><th>sslVerify</th><td>Verify SSL certificates of HTTPS endpoint</td></tr>
       <tr><th>secret</th><td>Used to compute the SHA256 HMAC signature of the hook body and adds
       a <code>X-UnityCloudBuild-Signature</code> header to the payload</td></tr>
      </table>
     </td>
  </tr>
  <tr>
     <td><code>slack</code>
     <td>
      <table>
       <tr><th>url</th><td>Slack incoming webhook URL. Learn more at https://api.slack.com/incoming-webhooks</td></tr>
      </table>
     </td>
  </tr>
  </table>
  </div>

  * @method
  * @name UnityCloudBuildAPI#addHookForOrg
     * @param {string} orgid - Organization identifier
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  addHookForOrg(parameters: {
    'orgid': string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getHookURL(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get details of a hook by id
   * @method
   * @name UnityCloudBuildAPI#getHook
   * @param {string} orgid - Organization identifier
   * @param {string} id - Hook record identifier
   */
  getHook(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteHookURL(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Delete organization hook
   * @method
   * @name UnityCloudBuildAPI#deleteHook
   * @param {string} orgid - Organization identifier
   * @param {string} id - Hook record identifier
   */
  deleteHook(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateHookURL(parameters: {
    'orgid': string,
    'id' ? : string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Update a new hook. NOTE: you must be a manager in the
  organization to update hooks.

  * @method
  * @name UnityCloudBuildAPI#updateHook
     * @param {string} orgid - Organization identifier
     * @param {string} id - Hook record identifier
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  updateHook(parameters: {
    'orgid': string,
    'id' ? : string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  pingHookURL(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}/ping'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Send a ping event to an org hook.

  * @method
  * @name UnityCloudBuildAPI#pingHook
     * @param {string} orgid - Organization identifier
     * @param {string} id - Hook record identifier
  */
  pingHook(parameters: {
    'orgid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/hooks/{id}/ping'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getSSHKeyURL(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/sshkey'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the ssh public key for the specified org
   * @method
   * @name UnityCloudBuildAPI#getSSHKey
   * @param {string} orgid - Organization identifier
   */
  getSSHKey(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/sshkey'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  regenerateSSHKeyURL(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/sshkey'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Regenerate the ssh key for the specified org
   *WARNING* this is a destructive operation that will permanently remove your current SSH key.
   * @method
   * @name UnityCloudBuildAPI#regenerateSSHKey
   * @param {string} orgid - Organization identifier
   */
  regenerateSSHKey(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/sshkey'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listProjectsForUserURL(parameters: {
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/projects'
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * List all projects that you have permission to access across all organizations. Add "?include=settings"
  as a query parameter to include the project settings with the response.

  * @method
  * @name UnityCloudBuildAPI#listProjectsForUser
     * @param {string} include - Extra fields to include in the response
  */
  listProjectsForUser(parameters: {
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/projects'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getProjectByUpidURL(parameters: {
    'projectupid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/projects/{projectupid}'

    path = path.replace('{projectupid}', `${parameters['projectupid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Gets the same data as /orgs/{orgid}/project/{projectid} but looks up the project by the Unity Project ID. This
  value is returned in the project's guid field.
  * @method
  * @name UnityCloudBuildAPI#getProjectByUpid
     * @param {string} projectupid - Project UPID - Unity global id
  */
  getProjectByUpid(parameters: {
    'projectupid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/projects/{projectupid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{projectupid}', `${parameters['projectupid']}`)

      if (parameters['projectupid'] === undefined) {
        reject(new Error('Missing required  parameter: projectupid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listProjectsForOrgURL(parameters: {
    'orgid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects'

    path = path.replace('{orgid}', `${parameters['orgid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * List all projects that belong to the specified organization. Add "?include=settings"
  as a query parameter to include the project settings with the response.

  * @method
  * @name UnityCloudBuildAPI#listProjectsForOrg
     * @param {string} orgid - Organization identifier
     * @param {string} include - Extra fields to include in the response
  */
  listProjectsForOrg(parameters: {
    'orgid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addProjectURL(parameters: {
    'orgid': string,
    'options': {
      'name': string

      'disabled': boolean

      'disableNotifications': boolean

      'generateShareLinks': boolean

      'settings': {
        'remoteCacheStrategy': "none" | "library" | "workspace"

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'url': string

          'user': string

          'pass': string

          'fingerprint': string

          'p4authtype': string

          'shallowclone': boolean

          'oauth': {
            'scm_provider': string

            'temp_state': string

            'github': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'gitlab': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'bitbucket': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

          }

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Create a project for the specified organization
   * @method
   * @name UnityCloudBuildAPI#addProject
   * @param {string} orgid - Organization identifier
   * @param {} options - Options for project create/update
   */
  addProject(parameters: {
    'orgid': string,
    'options': {
      'name': string

      'disabled': boolean

      'disableNotifications': boolean

      'generateShareLinks': boolean

      'settings': {
        'remoteCacheStrategy': "none" | "library" | "workspace"

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'url': string

          'user': string

          'pass': string

          'fingerprint': string

          'p4authtype': string

          'shallowclone': boolean

          'oauth': {
            'scm_provider': string

            'temp_state': string

            'github': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'gitlab': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'bitbucket': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

          }

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get project details
   * @method
   * @name UnityCloudBuildAPI#getProject
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} include - Extra fields to include in the response
   */
  getProject(parameters: {
    'orgid': string,
    'projectid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'name': string

      'disabled': boolean

      'disableNotifications': boolean

      'generateShareLinks': boolean

      'settings': {
        'remoteCacheStrategy': "none" | "library" | "workspace"

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'url': string

          'user': string

          'pass': string

          'fingerprint': string

          'p4authtype': string

          'shallowclone': boolean

          'oauth': {
            'scm_provider': string

            'temp_state': string

            'github': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'gitlab': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'bitbucket': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

          }

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Update project details
   * @method
   * @name UnityCloudBuildAPI#updateProject
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {} options - Options for project create/update
   */
  updateProject(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'name': string

      'disabled': boolean

      'disableNotifications': boolean

      'generateShareLinks': boolean

      'settings': {
        'remoteCacheStrategy': "none" | "library" | "workspace"

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'url': string

          'user': string

          'pass': string

          'fingerprint': string

          'p4authtype': string

          'shallowclone': boolean

          'oauth': {
            'scm_provider': string

            'temp_state': string

            'github': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'gitlab': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

            'bitbucket': {
              'repository': {}

              'token': string

              'refreshToken': string

              'expiration': string

              'expirationInterval': number

            }

          }

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  archiveProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * This will archive the project in Cloud Build ONLY. Use with caution - this process is not reversible.
  The projects UPID will be removed from Cloud Build allowing the project to be reconfigured.
  * @method
  * @name UnityCloudBuildAPI#archiveProject
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
  */
  archiveProject(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBillingPlansURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/billingplan'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the billing plan for the specified project
   * @method
   * @name UnityCloudBuildAPI#getBillingPlans
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   */
  getBillingPlansWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/billingplan'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getSSHKeyURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/sshkey'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get the ssh public key for the specified project
   * @method
   * @name UnityCloudBuildAPI#getSSHKey
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   */
  getSSHKeyWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/sshkey'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getStatsURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/stats'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get statistics for the specified project
   * @method
   * @name UnityCloudBuildAPI#getStats
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   */
  getStats(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/stats'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getAuditLogURL(parameters: {
    'orgid': string,
    'projectid': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/auditlog'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)
    if (parameters['perPage'] !== undefined) {
      queryParameters['per_page'] = parameters['perPage']
    }

    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Retrieve a list of historical settings changes for this project
   * @method
   * @name UnityCloudBuildAPI#getAuditLog
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {number} perPage - Number of audit log records to retrieve
   * @param {number} page - Skip to page number, based on per_page value
   */
  getAuditLog(parameters: {
    'orgid': string,
    'projectid': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/auditlog'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['perPage'] !== undefined) {
        queryParameters['per_page'] = parameters['perPage']
      }

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  listHooksForProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * List all hooks configured for the specified project
   * @method
   * @name UnityCloudBuildAPI#listHooksForProject
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   */
  listHooksForProject(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addHookForProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Adds a new project level hook. A project level hook is only triggered by events from the specific project.
  NOTE: you must be a manager in the organization to add new hooks.
  <h4>Hook Type Configuration Parameters</h4>
  <div class="webhook-tag-desc">
  <table>
  <tr><th>Type</th><th>Configuration Options</th></tr>
  <tr>
     <td><code>web</code>
     <td>
      <table>
       <tr><th>url</th><td>Endpoint to submit POST request</td></tr>
       <tr><th>encoding</th><td>Either <code>json</code> (default) or <code>form</code></td></tr>
       <tr><th>sslVerify</th><td>Verify SSL certificates of HTTPS endpoint</td></tr>
       <tr><th>secret</th><td>Used to compute the SHA256 HMAC signature of the hook body and adds
       a <code>X-UnityCloudBuild-Signature</code> header to the payload</td></tr>
      </table>
     </td>
  </tr>
  <tr>
     <td><code>slack</code>
     <td>
      <table>
       <tr><th>url</th><td>Slack incoming webhook URL. Learn more at https://api.slack.com/incoming-webhooks</td></tr>
      </table>
     </td>
  </tr>
  </table>
  </div>

  * @method
  * @name UnityCloudBuildAPI#addHookForProject
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  addHookForProject(parameters: {
    'orgid': string,
    'projectid': string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getHookURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get details of a hook by id
   * @method
   * @name UnityCloudBuildAPI#getHook
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} id - Hook record identifier
   */
  getHookWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteHookURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Delete project hook
   * @method
   * @name UnityCloudBuildAPI#deleteHook
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} id - Hook record identifier
   */
  deleteHookWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateHookURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Update an existing hook. NOTE: you must be a manager of the
  project to update hooks.

  * @method
  * @name UnityCloudBuildAPI#updateHook
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} id - Hook record identifier
     * @param {} options - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

  */
  updateHookWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    'options' ? : {
      'hookType': "web" | "slack"

      'events': Array < "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload" >
        | "ProjectBuildQueued" | "ProjectBuildStarted" | "ProjectBuildRestarted" | "ProjectBuildSuccess" | "ProjectBuildFailure" | "ProjectBuildCanceled" | "ProjectBuildUpload"

      'config': {}

      'active': boolean

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  pingHookURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}/ping'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{id}', `${parameters['id']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Send a ping event to a project hook.

  * @method
  * @name UnityCloudBuildAPI#pingHook
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} id - Hook record identifier
  */
  pingHookWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'id' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/hooks/{id}/ping'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{id}', `${parameters['id']}`)

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getEnvVariablesForProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/envvars'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get all configured environment variables for a given project
   * @method
   * @name UnityCloudBuildAPI#getEnvVariablesForProject
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   */
  getEnvVariablesForProject(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/envvars'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  setEnvVariablesForProjectURL(parameters: {
    'orgid': string,
    'projectid': string,
    'envvars': any,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/envvars'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Set all configured environment variables for a given project
   * @method
   * @name UnityCloudBuildAPI#setEnvVariablesForProject
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {} envvars - Environment variables
   */
  setEnvVariablesForProject(parameters: {
    'orgid': string,
    'projectid': string,
    'envvars': any,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/envvars'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['envvars'] !== undefined) {
        body = parameters['envvars']
      }

      if (parameters['envvars'] === undefined) {
        reject(new Error('Missing required  parameter: envvars'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildTargetsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'include' ? : string,
    'includeLastSuccess' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters['includeLastSuccess'] !== undefined) {
      queryParameters['include_last_success'] = parameters['includeLastSuccess']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Gets all configured build targets for a project, regardless of whether they are enabled. Add "?include=settings,credentials"
  as a query parameter to include the build target settings and credentials with the response.

  * @method
  * @name UnityCloudBuildAPI#getBuildTargets
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} include - Extra fields to include in the response
     * @param {boolean} includeLastSuccess - Include last successful build
  */
  getBuildTargets(parameters: {
    'orgid': string,
    'projectid': string,
    'include' ? : string,
    'includeLastSuccess' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters['includeLastSuccess'] !== undefined) {
        queryParameters['include_last_success'] = parameters['includeLastSuccess']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'name': string

      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"

      'enabled': boolean

      'settings': {
        'autoBuild': boolean

        'unityVersion': string

        'executablename': string

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'branch': string

          'subdirectory': string

          'client': string

        }

        'platform': {
          'bundleId': string

          'xcodeVersion': string

        }

        'advanced': {
          'xcode': {
            'useArchiveAndExport': boolean

          }

          'unity': {
            'preExportMethod': string

            'postExportMethod': string

            'preBuildScript': string

            'postBuildScript': string

            'scriptingDefineSymbols': string

            'playerExporter': {
              'sceneList': Array < string >
                | string

              'buildOptions': Array < string >
                | string

              'export': boolean

            }

            'playerSettings': {
              'Android': {
                'useAPKExpansionFiles': boolean

              }

            }

            'editorUserBuildSettings': {
              'androidBuildSystem': "internal" | "gradle"

            }

            'assetBundles': {
              'buildBundles': boolean

              'basePath': string

              'buildAssetBundleOptions': string

              'copyToStreamingAssets': boolean

              'copyBundlePatterns': Array < string >
                | string

            }

            'runUnitTests': boolean

            'runEditModeTests': boolean

            'runPlayModeTests': boolean

            'failedUnitTestFailsBuild': boolean

            'unitTestMethod': string

            'enableLightBake': boolean

          }

        }

      }

      'credentials': {
        'signing': {
          'credentialid': string

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Create build target for a project
   * @method
   * @name UnityCloudBuildAPI#addBuildTarget
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {} options - Options for build target create/update
   */
  addBuildTarget(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'name': string

      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"

      'enabled': boolean

      'settings': {
        'autoBuild': boolean

        'unityVersion': string

        'executablename': string

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'branch': string

          'subdirectory': string

          'client': string

        }

        'platform': {
          'bundleId': string

          'xcodeVersion': string

        }

        'advanced': {
          'xcode': {
            'useArchiveAndExport': boolean

          }

          'unity': {
            'preExportMethod': string

            'postExportMethod': string

            'preBuildScript': string

            'postBuildScript': string

            'scriptingDefineSymbols': string

            'playerExporter': {
              'sceneList': Array < string >
                | string

              'buildOptions': Array < string >
                | string

              'export': boolean

            }

            'playerSettings': {
              'Android': {
                'useAPKExpansionFiles': boolean

              }

            }

            'editorUserBuildSettings': {
              'androidBuildSystem': "internal" | "gradle"

            }

            'assetBundles': {
              'buildBundles': boolean

              'basePath': string

              'buildAssetBundleOptions': string

              'copyToStreamingAssets': boolean

              'copyBundlePatterns': Array < string >
                | string

            }

            'runUnitTests': boolean

            'runEditModeTests': boolean

            'runPlayModeTests': boolean

            'failedUnitTestFailsBuild': boolean

            'unitTestMethod': string

            'enableLightBake': boolean

          }

        }

      }

      'credentials': {
        'signing': {
          'credentialid': string

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get a build target
   * @method
   * @name UnityCloudBuildAPI#getBuildTarget
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   */
  getBuildTarget(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'options': {
      'name': string

      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"

      'enabled': boolean

      'settings': {
        'autoBuild': boolean

        'unityVersion': string

        'executablename': string

        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"

          'branch': string

          'subdirectory': string

          'client': string

        }

        'platform': {
          'bundleId': string

          'xcodeVersion': string

        }

        'advanced': {
          'xcode': {
            'useArchiveAndExport': boolean

          }

          'unity': {
            'preExportMethod': string

            'postExportMethod': string

            'preBuildScript': string

            'postBuildScript': string

            'scriptingDefineSymbols': string

            'playerExporter': {
              'sceneList': Array < string >
                | string

              'buildOptions': Array < string >
                | string

              'export': boolean

            }

            'playerSettings': {
              'Android': {
                'useAPKExpansionFiles': boolean

              }

            }

            'editorUserBuildSettings': {
              'androidBuildSystem': "internal" | "gradle"

            }

            'assetBundles': {
              'buildBundles': boolean

              'basePath': string

              'buildAssetBundleOptions': string

              'copyToStreamingAssets': boolean

              'copyBundlePatterns': Array < string >
                | string

            }

            'runUnitTests': boolean

            'runEditModeTests': boolean

            'runPlayModeTests': boolean

            'failedUnitTestFailsBuild': boolean

            'unitTestMethod': string

            'enableLightBake': boolean

          }

        }

      }

      'credentials': {
        'signing': {
          'credentialid': string

        }

      }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Update build target details
   * @method
   * @name UnityCloudBuildAPI#updateBuildTarget
   * @param parameters
   */
  updateBuildTarget( parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'options': {
      'name': string
      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"
      'enabled': boolean
      'settings': {
        'autoBuild': boolean
        'unityVersion': string
        'executablename': string
        'scm': {
          'type': "git" | "svn" | "p4" | "hg" | "collab" | "oauth"
          'branch': string
          'subdirectory': string
          'client': string
        }
        'platform': {
          'bundleId': string
          'xcodeVersion': string
        }
        'advanced': {
          'xcode': {
            'useArchiveAndExport': boolean
          }
          'unity': {
            'preExportMethod': string
            'postExportMethod': string
            'preBuildScript': string
            'postBuildScript': string
            'scriptingDefineSymbols': string
            'playerExporter': {
              'sceneList': Array < string >
                | string
              'buildOptions': Array < string >
                | string
              'export': boolean
            }
            'playerSettings': {
              'Android': {
                'useAPKExpansionFiles': boolean
              }
            }
            'editorUserBuildSettings': {
              'androidBuildSystem': "internal" | "gradle"
            }
            'assetBundles': {
              'buildBundles': boolean
              'basePath': string
              'buildAssetBundleOptions': string
              'copyToStreamingAssets': boolean
              'copyBundlePatterns': Array < string >
                | string
            }
            'runUnitTests': boolean
            'runEditModeTests': boolean
            'runPlayModeTests': boolean
            'failedUnitTestFailsBuild': boolean
            'unitTestMethod': string
            'enableLightBake': boolean
          }
        }
      }
      'credentials': {
        'signing': {
          'credentialid': string
        }
      }
    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Delete build target
   * @method
   * @name UnityCloudBuildAPI#deleteBuildTarget
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   */
  deleteBuildTarget(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getEnvVariablesForBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/envvars'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get all configured environment variables for a given build target
   * @method
   * @name UnityCloudBuildAPI#getEnvVariablesForBuildTarget
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   */
  getEnvVariablesForBuildTarget(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/envvars'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  setEnvVariablesForBuildTargetURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'envvars': any,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/envvars'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Set all configured environment variables for a given build target
   * @method
   * @name UnityCloudBuildAPI#setEnvVariablesForBuildTarget
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {} envvars - Environment variables
   */
  setEnvVariablesForBuildTarget(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'envvars': any,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/envvars'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters['envvars'] !== undefined) {
        body = parameters['envvars']
      }

      if (parameters['envvars'] === undefined) {
        reject(new Error('Missing required  parameter: envvars'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getAuditLogURLWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/auditlog'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)
    if (parameters['perPage'] !== undefined) {
      queryParameters['per_page'] = parameters['perPage']
    }

    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Retrieve a list of historical settings changes for this build target.
   * @method
   * @name UnityCloudBuildAPI#getAuditLog
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {number} perPage - Number of audit log records to retrieve
   * @param {number} page - Skip to page number, based on per_page value
   */
  getAuditLogWithProjectId(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/auditlog'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters['perPage'] !== undefined) {
        queryParameters['per_page'] = parameters['perPage']
      }

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildTargetsForOrgURL(parameters: {
    'orgid': string,
    'include' ? : string,
    'includeLastSuccess' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/buildtargets'

    path = path.replace('{orgid}', `${parameters['orgid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters['includeLastSuccess'] !== undefined) {
      queryParameters['include_last_success'] = parameters['includeLastSuccess']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Gets all configured build targets for an org, regardless of whether they are enabled. Add "?include=settings,credentials"
  as a query parameter to include the build target settings and credentials with the response.

  * @method
  * @name UnityCloudBuildAPI#getBuildTargetsForOrg
     * @param {string} orgid - Organization identifier
     * @param {string} include - Extra fields to include in the response
     * @param {boolean} includeLastSuccess - Include last successful build
  */
  getBuildTargetsForOrg(parameters: {
    'orgid': string,
    'include' ? : string,
    'includeLastSuccess' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/buildtargets'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters['includeLastSuccess'] !== undefined) {
        queryParameters['include_last_success'] = parameters['includeLastSuccess']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getAllAndroidURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Get all credentials available for the project. A user in the
  projects org will see all credentials uploaded for any project
  within the org, whereas a user with project-level permissions
  will only see credentials assigned to the specific project.

  * @method
  * @name UnityCloudBuildAPI#getAllAndroid
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
  */
  getAllAndroid(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addCredentialsAndroidURL(parameters: {
    'orgid': string,
    'projectid': string,
    'label': string,
    'file': {},
    'alias': string,
    'keypass': string,
    'storepass': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Upload a new android keystore for the project. NOTE: you must
  be a manager in the project's organization to add new credentials.

  * @method
  * @name UnityCloudBuildAPI#addCredentialsAndroid
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} label - Label for the uploaded credential
     * @param {file} file - Keystore file
     * @param {string} alias - Keystore alias
     * @param {string} keypass - Keystore keypass
     * @param {string} storepass - Keystore storepass
  */
  addCredentialsAndroid(parameters: {
    'orgid': string,
    'projectid': string,
    'label': string,
    'file': {},
    'alias': string,
    'keypass': string,
    'storepass': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'multipart/form-data'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['label'] !== undefined) {
        form['label'] = parameters['label']
      }

      if (parameters['label'] === undefined) {
        reject(new Error('Missing required  parameter: label'))
        return
      }

      if (parameters['file'] !== undefined) {
        form['file'] = parameters['file']
      }

      if (parameters['file'] === undefined) {
        reject(new Error('Missing required  parameter: file'))
        return
      }

      if (parameters['alias'] !== undefined) {
        form['alias'] = parameters['alias']
      }

      if (parameters['alias'] === undefined) {
        reject(new Error('Missing required  parameter: alias'))
        return
      }

      if (parameters['keypass'] !== undefined) {
        form['keypass'] = parameters['keypass']
      }

      if (parameters['keypass'] === undefined) {
        reject(new Error('Missing required  parameter: keypass'))
        return
      }

      if (parameters['storepass'] !== undefined) {
        form['storepass'] = parameters['storepass']
      }

      if (parameters['storepass'] === undefined) {
        reject(new Error('Missing required  parameter: storepass'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getOneAndroidURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get specific android credential details
   * @method
   * @name UnityCloudBuildAPI#getOneAndroid
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} credentialid - Credential Identifier
   */
  getOneAndroid(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateAndroidURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    'label' ? : string,
    'file' ? : {},
    'alias' ? : string,
    'keypass' ? : string,
    'storepass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Update an android keystore for the project. NOTE: you must
  be a manager in the project's organization to add new credentials.

  * @method
  * @name UnityCloudBuildAPI#updateAndroid
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} credentialid - Credential Identifier
     * @param {string} label - Label for the uploaded credential
     * @param {file} file - Keystore file
     * @param {string} alias - Keystore alias
     * @param {string} keypass - Keystore keypass
     * @param {string} storepass - Keystore storepass
  */
  updateAndroid(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    'label' ? : string,
    'file' ? : {},
    'alias' ? : string,
    'keypass' ? : string,
    'storepass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'multipart/form-data'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters['label'] !== undefined) {
        form['label'] = parameters['label']
      }

      if (parameters['file'] !== undefined) {
        form['file'] = parameters['file']
      }

      if (parameters['alias'] !== undefined) {
        form['alias'] = parameters['alias']
      }

      if (parameters['keypass'] !== undefined) {
        form['keypass'] = parameters['keypass']
      }

      if (parameters['storepass'] !== undefined) {
        form['storepass'] = parameters['storepass']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteAndroidURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Delete specific android credentials for a project. NOTE:
  you must be a manager in the project's organization to
  delete credentials.

  * @method
  * @name UnityCloudBuildAPI#deleteAndroid
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} credentialid - Credential Identifier
  */
  deleteAndroid(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/android/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getAllIosURL(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Get all credentials available for the project. A user in the
  projects org will see all credentials uploaded for any project
  within the org, whereas a user with project-level permissions
  will only see credentials assigned to the specific project.

  * @method
  * @name UnityCloudBuildAPI#getAllIos
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
  */
  getAllIos(parameters: {
    'orgid': string,
    'projectid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  addCredentialsIosURL(parameters: {
    'orgid': string,
    'projectid': string,
    'label': string,
    'fileCertificate': {},
    'fileProvisioningProfile': {},
    'certificatePass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Upload a new iOS certificate and provisioning profile for the project.
  NOTE: you must be a manager in the project's organization to add new
  credentials.

  * @method
  * @name UnityCloudBuildAPI#addCredentialsIos
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} label - Label for the uploaded credentials
     * @param {file} fileCertificate - Certificate file (.p12)
     * @param {file} fileProvisioningProfile - Provisioning Profile (.mobileprovision)
     * @param {string} certificatePass - Certificate (.p12) password
  */
  addCredentialsIos(parameters: {
    'orgid': string,
    'projectid': string,
    'label': string,
    'fileCertificate': {},
    'fileProvisioningProfile': {},
    'certificatePass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'multipart/form-data'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['label'] !== undefined) {
        form['label'] = parameters['label']
      }

      if (parameters['label'] === undefined) {
        reject(new Error('Missing required  parameter: label'))
        return
      }

      if (parameters['fileCertificate'] !== undefined) {
        form['fileCertificate'] = parameters['fileCertificate']
      }

      if (parameters['fileCertificate'] === undefined) {
        reject(new Error('Missing required  parameter: fileCertificate'))
        return
      }

      if (parameters['fileProvisioningProfile'] !== undefined) {
        form['fileProvisioningProfile'] = parameters['fileProvisioningProfile']
      }

      if (parameters['fileProvisioningProfile'] === undefined) {
        reject(new Error('Missing required  parameter: fileProvisioningProfile'))
        return
      }

      if (parameters['certificatePass'] !== undefined) {
        form['certificatePass'] = parameters['certificatePass']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getOneIosURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get specific iOS credential details
   * @method
   * @name UnityCloudBuildAPI#getOneIos
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} credentialid - Credential Identifier
   */
  getOneIos(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateIosURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    'label' ? : string,
    'fileCertificate' ? : {},
    'fileProvisioningProfile' ? : {},
    'certificatePass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Update an iOS certificate / provisioning profile for the project.
  NOTE: you must be a manager in the project's organization to update
  credentials.

  * @method
  * @name UnityCloudBuildAPI#updateIos
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} credentialid - Credential Identifier
     * @param {string} label - Label for the updated credentials
     * @param {file} fileCertificate - Certificate file (.p12)
     * @param {file} fileProvisioningProfile - Provisioning Profile (.mobileprovision)
     * @param {string} certificatePass - Certificate (.p12) password
  */
  updateIos(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    'label' ? : string,
    'fileCertificate' ? : {},
    'fileProvisioningProfile' ? : {},
    'certificatePass' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'multipart/form-data'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters['label'] !== undefined) {
        form['label'] = parameters['label']
      }

      if (parameters['fileCertificate'] !== undefined) {
        form['fileCertificate'] = parameters['fileCertificate']
      }

      if (parameters['fileProvisioningProfile'] !== undefined) {
        form['fileProvisioningProfile'] = parameters['fileProvisioningProfile']
      }

      if (parameters['certificatePass'] !== undefined) {
        form['certificatePass'] = parameters['certificatePass']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteIosURL(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{credentialid}', `${parameters['credentialid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Delete specific ios credentials for a project. NOTE:
  you must be a manager in the project's organization to
  delete credentials.

  * @method
  * @name UnityCloudBuildAPI#deleteIos
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} credentialid - Credential Identifier
  */
  deleteIos(parameters: {
    'orgid': string,
    'projectid': string,
    'credentialid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/credentials/signing/ios/{credentialid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{credentialid}', `${parameters['credentialid']}`)

      if (parameters['credentialid'] === undefined) {
        reject(new Error('Missing required  parameter: credentialid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteAllBuildArtifactsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/artifacts'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Delete all artifacts associated with all non-favorited builds for a specified buildtargetid (_all is allowed).
   * @method
   * @name UnityCloudBuildAPI#deleteAllBuildArtifacts
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   */
  deleteAllBuildArtifacts(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/artifacts'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  deleteBuildArtifactsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/artifacts'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Delete all artifacts associated with a specific build
   * @method
   * @name UnityCloudBuildAPI#deleteBuildArtifacts
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {string} number - Build number or in some cases _all
   */
  deleteBuildArtifacts(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/artifacts'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  batchDeleteBuildArtifactsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'builds': Array < {
          'buildtargetid': string

          'build': number

        } >
        | {
          'buildtargetid': string

          'build': number

        }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/artifacts/delete'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Delete all artifacts associated with the builds identified by the
  provided build target ids and build numbers. Builds marked as do
  not delete or that are currently building will be ignored.

  * @method
  * @name UnityCloudBuildAPI#batchDeleteBuildArtifacts
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {} options - Options to specify what builds to delete
  */
  batchDeleteBuildArtifacts(parameters: {
    'orgid': string,
    'projectid': string,
    'options': {
      'builds': Array < {
          'buildtargetid': string

          'build': number

        } >
        | {
          'buildtargetid': string

          'build': number

        }

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/artifacts/delete'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'include' ? : string,
    'perPage' ? : number,
    'page' ? : number,
    'buildStatus' ? : string,
    'platform' ? : string,
    'showDeleted' ? : boolean,
    'onlyFavorites' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters['perPage'] !== undefined) {
      queryParameters['per_page'] = parameters['perPage']
    }

    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page']
    }

    if (parameters['buildStatus'] !== undefined) {
      queryParameters['buildStatus'] = parameters['buildStatus']
    }

    if (parameters['platform'] !== undefined) {
      queryParameters['platform'] = parameters['platform']
    }

    if (parameters['showDeleted'] !== undefined) {
      queryParameters['showDeleted'] = parameters['showDeleted']
    }

    if (parameters['onlyFavorites'] !== undefined) {
      queryParameters['onlyFavorites'] = parameters['onlyFavorites']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * List all running and finished builds, sorted by build number
  (optionally paginating the results). Use '_all' as the buildtargetid
  to get all configured build targets. The response includes a Content-Range
  header that identifies the range of results returned and the total number
  of results matching the given query parameters.

  * @method
  * @name UnityCloudBuildAPI#getBuilds
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
     * @param {string} include - Extra fields to include in the response
     * @param {number} perPage - Number of audit log records to retrieve
     * @param {number} page - Skip to page number, based on per_page value
     * @param {string} buildStatus - Query for only builds of a specific status
     * @param {string} platform - Query for only builds of a specific platform
     * @param {boolean} showDeleted - Query for builds that have been deleted
     * @param {boolean} onlyFavorites - Query for builds that have been favorited
  */
  getBuilds(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'include' ? : string,
    'perPage' ? : number,
    'page' ? : number,
    'buildStatus' ? : string,
    'platform' ? : string,
    'showDeleted' ? : boolean,
    'onlyFavorites' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters['perPage'] !== undefined) {
        queryParameters['per_page'] = parameters['perPage']
      }

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page']
      }

      if (parameters['buildStatus'] !== undefined) {
        queryParameters['buildStatus'] = parameters['buildStatus']
      }

      if (parameters['platform'] !== undefined) {
        queryParameters['platform'] = parameters['platform']
      }

      if (parameters['showDeleted'] !== undefined) {
        queryParameters['showDeleted'] = parameters['showDeleted']
      }

      if (parameters['onlyFavorites'] !== undefined) {
        queryParameters['onlyFavorites'] = parameters['onlyFavorites']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  startBuildsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'options' ? : {
      'clean': boolean

      'delay': number

      'commit': string

      'headless': boolean

      'label': string

      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Start the build process for this build target (or all targets,
   if '_all' is specified as the buildtargetid), if there is not one
   currently in process.

   If a build is currently in process that information will be related
   in the 'error' field.

   * @method
   * @name UnityCloudBuildAPI#startBuilds
   * @param parameters
   */
  startBuilds (parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'options' ? : {
      'clean': boolean
      'delay': number
      'commit': string
      'headless': boolean
      'label': string
      'platform': "ios" | "android" | "webplayer" | "webgl" | "standaloneosxintel" | "standaloneosxintel64" | "standaloneosxuniversal" | "standalonewindows" | "standalonewindows64" | "standalonelinux" | "standalonelinux64" | "standalonelinuxuniversal"
    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  cancelAllBuildsURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Cancel all builds in progress for this build target (or all targets,
  if '_all' is specified as the buildtargetid). Canceling an already
  finished build will do nothing and respond successfully.

  * @method
  * @name UnityCloudBuildAPI#cancelAllBuilds
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
  */
  cancelAllBuilds(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Retrieve information for a specific build. A Build resource contains
  information related to a build attempt for a build target, including
  the build number, changeset, build times, and other pertinent data.

  * @method
  * @name UnityCloudBuildAPI#getBuild
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
     * @param {string} number - Build number or in some cases _all
     * @param {string} include - Extra fields to include in the response
  */
  getBuild(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  cancelBuildURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Cancel a build in progress. Canceling an already finished build
  will do nothing and respond successfully.

  * @method
  * @name UnityCloudBuildAPI#cancelBuild
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
     * @param {string} number - Build number or in some cases _all
  */
  cancelBuild(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  updateBuildURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'options': {
      'favorited': boolean

      'label': string

    },
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Update build information
   * @method
   * @name UnityCloudBuildAPI#updateBuild
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {string} number - Build number or in some cases _all
   * @param {} options - Options for build update
   */
  updateBuild(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'options': {
      'favorited': boolean

      'label': string

    },
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters['options'] !== undefined) {
        body = parameters['options']
      }

      if (parameters['options'] === undefined) {
        reject(new Error('Missing required  parameter: options'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('PUT', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getAuditLogURLWithProjectIdAndNumber(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/auditlog'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)
    if (parameters['perPage'] !== undefined) {
      queryParameters['per_page'] = parameters['perPage']
    }

    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Retrieve a list of settings changes between the last and current build.
   * @method
   * @name UnityCloudBuildAPI#getAuditLog
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {string} number - Build number or in some cases _all
   * @param {number} perPage - Number of audit log records to retrieve
   * @param {number} page - Skip to page number, based on per_page value
   */
  getAuditLogWithProjectIdAndNumber(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'perPage' ? : number,
    'page' ? : number,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/auditlog'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters['perPage'] !== undefined) {
        queryParameters['per_page'] = parameters['perPage']
      }

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildsForOrgURL(parameters: {
    'orgid': string,
    'include' ? : string,
    'perPage' ? : number,
    'page' ? : number,
    'buildStatus' ? : string,
    'platform' ? : string,
    'showDeleted' ? : boolean,
    'onlyFavorites' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/builds'

    path = path.replace('{orgid}', `${parameters['orgid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters['perPage'] !== undefined) {
      queryParameters['per_page'] = parameters['perPage']
    }

    if (parameters['page'] !== undefined) {
      queryParameters['page'] = parameters['page']
    }

    if (parameters['buildStatus'] !== undefined) {
      queryParameters['buildStatus'] = parameters['buildStatus']
    }

    if (parameters['platform'] !== undefined) {
      queryParameters['platform'] = parameters['platform']
    }

    if (parameters['showDeleted'] !== undefined) {
      queryParameters['showDeleted'] = parameters['showDeleted']
    }

    if (parameters['onlyFavorites'] !== undefined) {
      queryParameters['onlyFavorites'] = parameters['onlyFavorites']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * List all running and finished builds, sorted by build number
  (optionally paginating the results). The response includes a Content-Range
  header that identifies the range of results returned and the total number
  of results matching the given query parameters.

  * @method
  * @name UnityCloudBuildAPI#getBuildsForOrg
     * @param {string} orgid - Organization identifier
     * @param {string} include - Extra fields to include in the response
     * @param {number} perPage - Number of audit log records to retrieve
     * @param {number} page - Skip to page number, based on per_page value
     * @param {string} buildStatus - Query for only builds of a specific status
     * @param {string} platform - Query for only builds of a specific platform
     * @param {boolean} showDeleted - Query for builds that have been deleted
     * @param {boolean} onlyFavorites - Query for builds that have been favorited
  */
  getBuildsForOrg(parameters: {
    'orgid': string,
    'include' ? : string,
    'perPage' ? : number,
    'page' ? : number,
    'buildStatus' ? : string,
    'platform' ? : string,
    'showDeleted' ? : boolean,
    'onlyFavorites' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/builds'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters['perPage'] !== undefined) {
        queryParameters['per_page'] = parameters['perPage']
      }

      if (parameters['page'] !== undefined) {
        queryParameters['page'] = parameters['page']
      }

      if (parameters['buildStatus'] !== undefined) {
        queryParameters['buildStatus'] = parameters['buildStatus']
      }

      if (parameters['platform'] !== undefined) {
        queryParameters['platform'] = parameters['platform']
      }

      if (parameters['showDeleted'] !== undefined) {
        queryParameters['showDeleted'] = parameters['showDeleted']
      }

      if (parameters['onlyFavorites'] !== undefined) {
        queryParameters['onlyFavorites'] = parameters['onlyFavorites']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  cancelBuildsForOrgURL(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/builds'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Cancel all in progress builds for an organization. Canceling an already finished build
  will do nothing and respond successfully.

  * @method
  * @name UnityCloudBuildAPI#cancelBuildsForOrg
     * @param {string} orgid - Organization identifier
  */
  cancelBuildsForOrg(parameters: {
    'orgid': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/builds'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getBuildLogURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'offsetlines' ? : number,
    'linenumbers' ? : boolean,
    'lastLineNumber' ? : number,
    'compact' ? : boolean,
    'withHtml' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/log'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)
    if (parameters['offsetlines'] !== undefined) {
      queryParameters['offsetlines'] = parameters['offsetlines']
    }

    if (parameters['linenumbers'] !== undefined) {
      queryParameters['linenumbers'] = parameters['linenumbers']
    }

    if (parameters['lastLineNumber'] !== undefined) {
      queryParameters['lastLineNumber'] = parameters['lastLineNumber']
    }

    if (parameters['compact'] !== undefined) {
      queryParameters['compact'] = parameters['compact']
    }

    if (parameters['withHtml'] !== undefined) {
      queryParameters['withHtml'] = parameters['withHtml']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Retrieve the plain text log for a specifc build.
  * @method
  * @name UnityCloudBuildAPI#getBuildLog
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
     * @param {string} number - Build number or in some cases _all
     * @param {number} offsetlines - Stream log from the given line number
     * @param {boolean} linenumbers - Include log line numbers in the text output
     * @param {number} lastLineNumber - The last line number seen, numbering will continue from here
     * @param {boolean} compact - Return the compact log, showing only errors and warnings
     * @param {boolean} withHtml - Surround important lines (errors, warnings) with SPAN and CSS markup

  */
  getBuildLog(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    'offsetlines' ? : number,
    'linenumbers' ? : boolean,
    'lastLineNumber' ? : number,
    'compact' ? : boolean,
    'withHtml' ? : boolean,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/log'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters['offsetlines'] !== undefined) {
        queryParameters['offsetlines'] = parameters['offsetlines']
      }

      if (parameters['linenumbers'] !== undefined) {
        queryParameters['linenumbers'] = parameters['linenumbers']
      }

      if (parameters['lastLineNumber'] !== undefined) {
        queryParameters['lastLineNumber'] = parameters['lastLineNumber']
      }

      if (parameters['compact'] !== undefined) {
        queryParameters['compact'] = parameters['compact']
      }

      if (parameters['withHtml'] !== undefined) {
        queryParameters['withHtml'] = parameters['withHtml']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getShareURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Gets a share link if it exists
   * @method
   * @name UnityCloudBuildAPI#getShare
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {string} number - Build number or in some cases _all
   */
  getShare(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  createShareURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    queryParameters = {}

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * Create a new short link to share a project. If this is called when a share already exists, that share
  will be revoked and a new one created.
  * @method
  * @name UnityCloudBuildAPI#createShare
     * @param {string} orgid - Organization identifier
     * @param {string} projectid - Project identifier
     * @param {string} buildtargetid - unique id auto-generated from the build target name
     * @param {string} number - Build number or in some cases _all
  */
  createShare(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/x-www-form-urlencoded'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      form = queryParameters
      queryParameters = {}

      this.request('POST', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  revokeShareURL(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'

    path = path.replace('{orgid}', `${parameters['orgid']}`)

    path = path.replace('{projectid}', `${parameters['projectid']}`)

    path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

    path = path.replace('{number}', `${parameters['number']}`)

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Revoke a shared link, both {buildtargetid} and {number} may use _all to revoke all share links for a given buildtarget or entire project.
   * @method
   * @name UnityCloudBuildAPI#revokeShare
   * @param {string} orgid - Organization identifier
   * @param {string} projectid - Project identifier
   * @param {string} buildtargetid - unique id auto-generated from the build target name
   * @param {string} number - Build number or in some cases _all
   */
  revokeShare(parameters: {
    'orgid': string,
    'projectid': string,
    'buildtargetid': string,
    'number': string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/orgs/{orgid}/projects/{projectid}/buildtargets/{buildtargetid}/builds/{number}/share'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{orgid}', `${parameters['orgid']}`)

      if (parameters['orgid'] === undefined) {
        reject(new Error('Missing required  parameter: orgid'))
        return
      }

      path = path.replace('{projectid}', `${parameters['projectid']}`)

      if (parameters['projectid'] === undefined) {
        reject(new Error('Missing required  parameter: projectid'))
        return
      }

      path = path.replace('{buildtargetid}', `${parameters['buildtargetid']}`)

      if (parameters['buildtargetid'] === undefined) {
        reject(new Error('Missing required  parameter: buildtargetid'))
        return
      }

      path = path.replace('{number}', `${parameters['number']}`)

      if (parameters['number'] === undefined) {
        reject(new Error('Missing required  parameter: number'))
        return
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('DELETE', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getShareMetadataURL(parameters: {
    'shareid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/shares/{shareid}'

    path = path.replace('{shareid}', `${parameters['shareid']}`)
    if (parameters['include'] !== undefined) {
      queryParameters['include'] = parameters['include']
    }

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
  * This is an endpoint accessible without an api key that provides information about a
  specific build including download links.
  A shareid is generated by POSTing to a <a href="#!/builds/createShare">build's share endpoint</a>.
  * @method
  * @name UnityCloudBuildAPI#getShareMetadata
     * @param {string} shareid - This API is intended to be used in conjunction with the Unity Cloud Build
  service. A tool for building your Unity projects in the Cloud.

  See https://developer.cloud.unity3d.com for more information.

  ## Making requests
  This website is built to allow requests to be made against the API. If you are
  currently logged into Cloud Build you should be able to make requests without
  entering an API key.


  You can find your API key in the Unity Cloud Services portal by clicking on
  'Cloud Build Preferences' in the sidebar. Copy the API Key and paste it into the
  upper left corner of this website. It will be used in all subsequent requests.

  ## Clients
  The Unity Cloud Build API is based upon Swagger. Client libraries to integrate with
  your projects can easily be generated with the
  [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen).

  The JSON schema required to generate a client for this API version is located here:

  ```
  [API_URL][BASE_PATH]/api.json
  ```

  ## Authorization
  The Unity Cloud Build API requires an access token from your Unity Cloud
  Build account, which can be found at https://build.cloud.unity3d.com/login/me

  To authenticate requests, include a Basic Authentication header with
  your API key as the value. e.g.

  ```
  Authorization: Basic [YOUR API KEY]
  ```

  ## Pagination
  Paged results will take two parameters. A page number that is calculated based
  upon the per_page amount. For instance if there are 40 results and you specify
  page 2 with per_page set to 10 you will receive records 11-20.

  Paged results will also return a Content-Range header. For the example above the
  content range header would look like this:

  ```
  Content-Range: items 11-20/40
  ```

  ## Versioning
  The API version is indicated in the request URL. Upgrading to a newer API
  version can be done by changing the path.

  The API will receive a new version in the following cases:

    * removal of a path or request type
    * addition of a required field
    * removal of a required field

  The following changes are considered backwards compatible and will not trigger a new
  API version:

    * addition of an endpoint or request type
    * addition of an optional field
    * removal of an optional field
    * changes to the format of ids

  ## Rate Limiting
  Requests against the Cloud Build API are limited to a rate of 100 per minute. To preserve
  the quality of service throughout Cloud Build, additional rate limits may apply to some
  actions. For example, polling aggressively instead of using webhooks or making API calls
  with a high concurrency may result in rate limiting.

  It is not intended for these rate limits to interfere with any legitimate use of the API.
  Please contact support at <cloudbuild@unity3d.com> if your use is affected by this rate limit.

  You can check the returned HTTP headers for any API request to see your current rate limit status.
    * __X-RateLimit-Limit:__ maximum number of requests per minute
    * __X-RateLimit-Remaining:__ remaining number of requests in the current window
    * __X-RateLimit-Reset:__ time at which the current window will reset (UTC epoch seconds)

  Once you go over the rate limit you will receive an error response:
  ```
  HTTP Status: 429
  {
    "error": "Rate limit exceeded, retry in XX seconds"
  }
  ```

     * @param {string} include - Extra fields to include in the response
  */
  getShareMetadata(parameters: {
    'shareid': string,
    'include' ? : string,
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/shares/{shareid}'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      path = path.replace('{shareid}', `${parameters['shareid']}`)

      if (parameters['shareid'] === undefined) {
        reject(new Error('Missing required  parameter: shareid'))
        return
      }

      if (parameters['include'] !== undefined) {
        queryParameters['include'] = parameters['include']
      }

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

  getStatusURL(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): string {
    let queryParameters: any = {}
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/status'

    if (parameters.$queryParameters) {
      Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
        queryParameters[parameterName] = parameters.$queryParameters[parameterName]
      })
    }

    let keys = Object.keys(queryParameters)
    return domain + path + (keys.length > 0 ? '?' + (keys.map(key => key + '=' + encodeURIComponent(queryParameters[key])).join('&')) : '')
  }

  /**
   * Get Cloud Build Status
   * @method
   * @name UnityCloudBuildAPI#getStatus
   */
  getStatus(parameters: {
    $queryParameters ? : any,
    $domain ? : string
  }): Promise < request.Response > {
    const domain = parameters.$domain ? parameters.$domain : this.domain
    let path = '/status'
    let body: any
    let queryParameters: any = {}
    let headers: any = {}
    let form: any = {}
    return new Promise((resolve, reject) => {
      headers['Accept'] = 'application/json, text/plain, text/html, text/csv'
      headers['Content-Type'] = 'application/json'

      if (parameters.$queryParameters) {
        Object.keys(parameters.$queryParameters).forEach(function(parameterName) {
          queryParameters[parameterName] = parameters.$queryParameters[parameterName]
        })
      }

      this.request('GET', domain + path, body, headers, queryParameters, form, reject, resolve)
    })
  }

}
