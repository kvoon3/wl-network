import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import type { Hookable } from 'hookable'

export interface WeilaRes<T = undefined> {
  data?: T

  errmsg: string
  errcode: number

  code?: number
  msg?: string
}

export interface CreateWeilaApiOptions {
  baseURL?: string
  query?: () => Record<string, any>
  hooks?: Hookable
}

export interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}

export interface WeilaHooks {
  'request:prepare': () => void
  'request:error': (error: Error) => void
  'response:error': (error: Error) => void
  'auth:error': () => void
  'done': () => void
}
