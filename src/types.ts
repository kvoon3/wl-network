import type { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface WeilaRes<T = undefined> {
  data?: T

  errmsg: string
  errcode: number

  code?: number
  msg?: string
}

export interface CreateWeilaApiOptions {
  baseURL?: string
  options?: () => Record<string, any>
  onError?: (error: Error | { errcode: number, errmsg: string }) => any
  onLogout?: () => void
  enableRequest?: boolean
}

export interface WeilaRequestInstance extends AxiosInstance {
  post: <T = any, R = WeilaRes<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<R>
}
