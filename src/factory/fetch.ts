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
    onRequest({ options: _options }) {
      hooks.callHook('request:prepare')
      _options.query = {
        ..._options.query,
        ...query(),
      }
    },
    onRequestError(reqError) {
      hooks.callHook('request:error', reqError.error)
      hooks.callHook('done')
    },
    onResponseError({ error, response }) {
      hooks.callHook('done')

      if (error) {
        response._data = undefined
        hooks.callHook('response:error', error)
      }
      else {
        const errcode = response.status
        const errmsg = response.statusText

        hooks.callHook('response:error', { errcode, errmsg })
      }
    },
    onResponse({ response }) {
      hooks.callHook('done')
      const { errcode, errmsg } = response._data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS) {
        const data = pickWeilaData(response._data)
        hooks.callHook('success', data)
        response._data = data
      }
      else if (weilaLogoutErrorCodes.findIndex(i => errcode === i) >= 0) {
        hooks.callHook('auth:error')
      }
      // weila error
      else {
        hooks.callHook('response:error', { errcode, errmsg })
        throw new Error(JSON.stringify({ errcode, errmsg }, null, 2))
      }
    },
  })

  Object.assign(instance, hooks)

  return instance as HookAbleFetch
}
