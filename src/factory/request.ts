import type { CreateWeilaApiOptions, WeilaRequestInstance, WeilaRes } from '../types'
import axios from 'axios'
import { noop, WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export function createRequest(opts?: CreateWeilaApiOptions): WeilaRequestInstance {
  const {
    baseURL = '/v1',
    onError,
    onLogout = noop,
    options = () => ({}),
  } = opts || {}

  const request: WeilaRequestInstance = axios.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  request.interceptors.request.use(
    (config) => {
      if (config) {
        config.params = {
          ...config.params,
          ...options(),
        }
      }
      return config
    },
    (error) => {
      onError?.(error)
      console.error('reqError', error)
    },
  )

  request.interceptors.response.use(
    // @ts-expect-error type error
    (response: AxiosResponse<WeilaRes>) => {
      const { errcode, code } = response.data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
        return pickWeilaData(response.data)
      }
      else if (
        weilaLogoutErrorCodes
          .findIndex(i => errcode === i) >= 0
      ) {
        onLogout()
      }
      else {
        const { errcode, errmsg } = response.data

        onError?.({ errcode, errmsg })

        throw new Error(`${errcode} ${errmsg}`)
      }
    },
    (error: Error) => {
      onError?.(error)
      console.error('resError', error)
    },
  )

  return request
}
