import type { Hookable } from 'hookable'
import type { CreateWeilaApiOptions, WeilaRequestInstance, WeilaRes } from '../types'
import axios from 'axios'
import { createHooks } from 'hookable'
import { WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export interface HookableWeilaAxiosInstance extends WeilaRequestInstance, Hookable {

}

export function createRequest(opts?: CreateWeilaApiOptions): HookableWeilaAxiosInstance {
  const {
    baseURL = '/v1',
    hooks = createHooks(),
    query = () => ({}),
  } = opts || {}

  const instance: WeilaRequestInstance = axios.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.request.use(
    (config) => {
      hooks.callHook('request:prepare')
      if (config) {
        config.params = {
          ...config.params,
          ...query(),
        }
      }
      return config
    },
    (error) => {
      hooks.callHook('done')
      hooks.callHook('request:error', error)
    },
  )

  instance.interceptors.response.use(
    // @ts-expect-error type error
    (response: AxiosResponse<WeilaRes>) => {
      hooks.callHook('done')
      const { errcode, code } = response.data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
        const data = pickWeilaData(response.data)
        hooks.callHook('success', data)
        return data
      }
      else if (
        weilaLogoutErrorCodes
          .findIndex(i => errcode === i) >= 0
      ) {
        hooks.callHook('auth:error')
      }
      else {
        const { errcode, errmsg } = response.data

        hooks.callHook('response:error', { errcode, errmsg })

        throw new Error(JSON.stringify({ errcode, errmsg }, null, 2))
      }
    },
    (error: Error) => {
      hooks.callHook('done')
      hooks.callHook('response:error', error)
    },
  )

  Object.assign(instance, hooks)

  return instance as HookableWeilaAxiosInstance
}
