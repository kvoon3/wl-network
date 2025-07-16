import type { $Fetch } from 'ofetch'
import type { CreateWeilaApiOptions, WeilaRes } from '../types'
import { ofetch } from 'ofetch'
import { noop, WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export function createFetch(opts?: CreateWeilaApiOptions): $Fetch {
  const {
    baseURL = '/v1',
    onError = noop,
    onStart = noop,
    onDone = noop,
    onAuthError = noop,
    query = () => ({}),
  } = opts || {}

  return ofetch.create({
    baseURL,
    timeout: 20 * 1000,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    onRequest({ options: _options }) {
      onStart()
      _options.query = {
        ..._options.query,
        ...query(),
      }
    },
    onRequestError(reqError) {
      onDone()
      onError?.(reqError.error)
      console.error('reqError')
    },
    onResponseError({ error, response }) {
      onDone()

      if (error) {
        response._data = undefined
        onError?.(error)
        console.error('resError', error)
      }
      else {
        const errcode = response.status
        const errmsg = response.statusText
        onError?.({ errcode, errmsg })
        console.error('resError', errcode, errmsg)
      }
    },
    onResponse({ response }) {
      onDone()
      const { errcode, errmsg } = response._data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS) {
        response._data = pickWeilaData(response._data)
      }
      else if (weilaLogoutErrorCodes.findIndex(i => errcode === i) >= 0) {
        onAuthError()
      }
      // weila error
      else {
        onError({ errcode, errmsg })
        throw new Error(JSON.stringify({ errcode, errmsg }, null, 2))
      }
    },
  })
}
