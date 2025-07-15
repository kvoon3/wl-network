import type { CreateWeilaApiOptions } from './types'
import { isBrowser } from '@antfu/utils'
import CryptoJS from 'crypto-js'
import { createFetch, createRequest } from './factory'
import { v1Query, v2Query } from './shared'

export class WeilaApi {
  fetch // without extra options
  request // without extra options
  v1
  v2

  loginTime = -1

  token = $local('token')
  refresh_token = $local('refresh_token', 'weila-test')
  expires_in = $local('expires_in')

  get isNeedRefresh(): boolean {
    const EXPIRES_BUFFER = 1000 * 60 * 60 * 12
    return Date.now() - this.loginTime > Number(this.expires_in) * 1000 - EXPIRES_BUFFER
  }

  constructor(
    app_id: string,
    key: string,
    options?: Omit<CreateWeilaApiOptions, 'options'>,
  ) {
    this.fetch = createFetch(options)
    this.request = isBrowser ? createRequest(options) : undefined
    this.v1 = {
      fetch: createFetch({
        query: () => v1Query(app_id, key),
        ...options,
        baseURL: 'v1',
      }),
      request: isBrowser
        ? createRequest({
            query: () => v1Query(app_id, key),
            ...options,
            baseURL: 'v1',
          })
        : undefined,
    }
    this.v2 = {
      fetch: createFetch({
        query: () => v2Query(app_id, key),
        ...options,
        baseURL: 'v2',
      }),
      request: isBrowser
        ? createRequest({
            query: () => v2Query(app_id, key),
            ...options,
            baseURL: 'v2',
          })
        : undefined,
    }
  }

  async login(url = 'sessions/login', body: object): Promise<any> {
    const data = await this.fetch(url, { body })

    if (data) {
      this.token.value = data.access_token || 0
      this.refresh_token.value = data.refresh_token
      this.expires_in.value = data.expires_in || -1
    }

    this.loginTime = Date.now()

    return data
  }

  clear(): void {
    this.token.value = ''
    this.refresh_token.value = ''
    this.expires_in.value = ''
  }
}

interface Local {
  value: string | undefined
}

function $local(key: string, encodeKey?: string): Local {
  const target: Local = {
    value: undefined,
  }

  return new Proxy(target, {
    get(target) {
      let value = localStorage.getItem(key) || ''
      if (encodeKey)
        value = CryptoJS.AES.encrypt(value, encodeKey).toString() || ''

      if (!target.value)
        target.value = value

      return target.value
    },
    set(target, __, value: string) {
      if (encodeKey)
        value = CryptoJS.AES.encrypt(value, encodeKey).toString()

      localStorage.setItem(key, value)

      target.value = value
      return true
    },
  })
}
