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
  // onStart?: () => void
  // onDone?: () => void
  // onError?: (error: Error | { errcode: number, errmsg: string }) => any
  // onAuthError?: () => void
}

export interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}
