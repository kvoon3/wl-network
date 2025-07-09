import { createFetch, createRequest } from "./factory";
import { v1Options, v2Options } from "./shared";
import type { CreateWeilaApiOptions } from "./types";
import CryptoJS from 'crypto-js'

// TODO: refresh
export class WeilaApi {
  fetch // without extra options
  request // without extra options
  v1 
  v2

  loginTime = -1

  token = $local('token')
  refresh_token = $local('refresh_token', 'weila-test')
  expires_in = $local('expires_in')

  get isNeedRefresh() {
    const EXPIRES_BUFFER = 1000 * 60 * 60 * 12
    return Date.now() - this.loginTime > Number(this.expires_in) * 1000 - EXPIRES_BUFFER
  }

  constructor(options?: Omit<CreateWeilaApiOptions, 'options'>) {
    this.fetch = createFetch(options)
    this.request = createRequest(options)
    this.v1 =  {
      fetch: createFetch({ options: v1Options, ...options }),
      request: createRequest({ options: v1Options, ...options })
    }
    this.v2 = {
      fetch: createFetch({options: v2Options, ...options }),
      request: { options: v2Options, ...options }
    }
  }

  async login(url = 'sessions/login', body: object) {
    const data = await this.fetch(url, { body })

    if (data) {
      this.token.value = data.access_token || 0
      this.refresh_token.value = data.refresh_token
      this.expires_in.value = data.expires_in || -1
    }

    this.loginTime = Date.now()

    return data
  }

  clear() {
    this.token.value = ''
    this.refresh_token.value = ''
    this.expires_in.value = ''
  }
}

function $local<T>(key: string, encodeKey?: string) {
  const target: { value: T | undefined } = {
    value: undefined
  }

  return new Proxy(target, {
    get() {
      let value = localStorage.getItem(key) || ''
      if(encodeKey)
        value = CryptoJS.AES.encrypt(value, encodeKey).toString() || ''

      return value
    },
    set(_, __, value: string) {
      if(encodeKey)
        value = CryptoJS.AES.encrypt(value, encodeKey).toString()

      localStorage.setItem('key', value)
      return true
    }
  })
}
