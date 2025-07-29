import type { HookAbleFetch, HookableWeilaAxiosInstance } from './factory'
import type { CreateWeilaApiOptions } from './types'
import { Hookable } from 'hookable'
import { createFetch, createRequest } from './factory'
import { v1Query, v2Query } from './shared'

export class WeilaApi extends Hookable {
  fetch
  request
  v1: { fetch: HookAbleFetch, request: HookableWeilaAxiosInstance }
  v2: { fetch: HookAbleFetch, request: HookableWeilaAxiosInstance }

  loginTime = -1

  constructor(
    app_id: string,
    key: string,
    options?: Omit<CreateWeilaApiOptions, 'options'>,
  ) {
    super()

    this.fetch = createFetch({
      hooks: this,
      ...options,
    })

    this.request = createRequest({
      hooks: this,
      ...options,
    })

    this.v1 = {
      fetch: createFetch({
        hooks: this,
        query: () => v1Query(app_id, key),
        ...options,
        baseURL: 'v1',
      }),
      request: createRequest({
        hooks: this,
        query: () => v1Query(app_id, key),
        ...options,
        baseURL: 'v1',
      }),
    }
    this.v2 = {
      fetch: createFetch({
        hooks: this,
        query: () => v2Query(app_id, key),
        ...options,
        baseURL: 'v2',
      }),
      request: createRequest({
        hooks: this,
        query: () => v2Query(app_id, key),
        ...options,
        baseURL: 'v2',
      }),
    }
  }
}
