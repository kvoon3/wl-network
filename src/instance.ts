import type { CreateWeilaApiOptions } from './types'
import { createFetch, createRequest } from './factory'
import { v1Query, v2Query } from './shared'

export class WeilaApi {
  fetch
  request
  v1
  v2

  loginTime = -1

  constructor(
    app_id: string,
    key: string,
    options?: Omit<CreateWeilaApiOptions, 'options'>,
  ) {
    this.fetch = createFetch(options)
    this.request = createRequest(options)
    this.v1 = {
      fetch: createFetch({
        query: () => v1Query(app_id, key),
        ...options,
        baseURL: 'v1',
      }),
      request: createRequest({
        query: () => v1Query(app_id, key),
        ...options,
        baseURL: 'v1',
      }),
    }
    this.v2 = {
      fetch: createFetch({
        query: () => v2Query(app_id, key),
        ...options,
        baseURL: 'v2',
      }),
      request: createRequest({
        query: () => v2Query(app_id, key),
        ...options,
        baseURL: 'v2',
      }),
    }
  }
}
