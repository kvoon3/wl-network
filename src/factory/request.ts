import type { Hookable } from 'hookable'
import type { CreateWeilaApiOptions, WeilaHooks, WeilaRequestInstance, WeilaRes } from '../types'
import axios from 'axios'
import { createHooks } from 'hookable'
import { WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export interface HookableWeilaAxiosInstance extends WeilaRequestInstance, Hookable<WeilaHooks> {

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
    async (config) => {
      await hooks.callHook('request:prepare')
      if (config) {
        config.params = {
          ...config.params,
          ...query(),
        }
      }
      return config
    },
    async (error) => {
      await hooks.callHook('done')
      await hooks.callHook('request:error', error)
    },
  )

  instance.interceptors.response.use(
    // @ts-expect-error type error
    async (response: AxiosResponse<WeilaRes>) => {
      await hooks.callHook('done')
      const { errcode, code } = response.data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS || code === 200) {
        const data = pickWeilaData(response.data)
        await hooks.callHook('success', data)
        return data
      }
      else if (
        weilaLogoutErrorCodes
          .findIndex(i => errcode === i) >= 0
      ) {
        await hooks.callHook('auth:error')
      }
      else {
        const { errcode, errmsg } = response.data

        await hooks.callHook('response:error', { errcode, errmsg })

        throw new Error(JSON.stringify({ errcode, errmsg }, null, 2))
      }
    },
    async (error: Error) => {
      await hooks.callHook('done')
      await hooks.callHook('response:error', error)
    },
  )

  Object.assign(instance, hooks)

  return instance as HookableWeilaAxiosInstance
}
