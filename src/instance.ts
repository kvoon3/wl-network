import type { CreateWeilaApiOptions } from './types'
import { isBrowser } from '@antfu/utils'
import CryptoJS from 'crypto-js'
import { createFetch, createRequest } from './factory'
import { v1Options, v2Options } from './shared'

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

  constructor(options?: Omit<CreateWeilaApiOptions, 'options'>) {
    const { enableRequest } = options || {}
    this.fetch = createFetch(options)
    this.request = enableRequest && isBrowser ? createRequest(options) : undefined
    this.v1 = {
      fetch: createFetch({ options: v1Options, ...options }),
      request: enableRequest && isBrowser ? createRequest({ options: v1Options, ...options }) : undefined,
    }
    this.v2 = {
      fetch: createFetch({ options: v2Options, ...options }),
      request: enableRequest && isBrowser ? createRequest({ options: v2Options, ...options }) : undefined,
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
