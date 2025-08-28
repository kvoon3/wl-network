import type { Hookable } from 'hookable'
import type { $Fetch } from 'ofetch'
import type { CreateWeilaApiOptions, WeilaHooks, WeilaRes } from '../types'
import { createHooks } from 'hookable'
import { ofetch } from 'ofetch'
import { WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export interface HookAbleFetch extends $Fetch, Hookable<WeilaHooks> {

}

export function createFetch(opts?: CreateWeilaApiOptions): HookAbleFetch {
  const {
    baseURL = '/v1',
    hooks = createHooks(),
    query = () => ({}),
  } = opts || {}
  const instance = ofetch.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    async onRequest(ctx) {
      const { options: _options } = ctx
      await hooks.callHook('request:prepare', ctx)
      _options.query = {
        ..._options.query,
        ...query(),
      }
    },
    async onRequestError(reqError) {
      await hooks.callHook('request:error', reqError.error)
      await hooks.callHook('done')
    },
    async onResponseError(ctx) {
      await hooks.callHook('done')

      await hooks.callHook('response:error', ctx)
    },
    async onResponse(ctx) {
      const { response } = ctx
      await hooks.callHook('done')
      const { errcode, errmsg } = response._data as WeilaRes

      if (!response.ok) {
        throw ctx
      }

      if (errcode === WeilaErrorCode.SUCCESS) {
        const data = pickWeilaData(response._data)
        await hooks.callHook('success', data)
        response._data = data
      }
      else if (weilaLogoutErrorCodes.findIndex(i => errcode === i) >= 0) {
        await hooks.callHook('auth:error')
        throw new Error('logout')
      }
      // weila error
      else {
        throw new Error(JSON.stringify({ errcode, errmsg }, null, 2))
      }
    },
  })

  Object.assign(instance, hooks)

  return instance as HookAbleFetch
}
