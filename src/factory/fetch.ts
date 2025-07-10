import type { $Fetch } from 'ofetch'
import type { CreateWeilaApiOptions, WeilaRes } from '../types'
import { ofetch } from 'ofetch'
import { noop, WeilaErrorCode, weilaLogoutErrorCodes } from '../constant'
import { pickWeilaData } from '../shared'

export function createFetch(opts?: CreateWeilaApiOptions): $Fetch {
  const {
    baseURL = '/v1',
    onError,
    onLogout = noop,
    options = () => ({}),
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
      _options.query = {
        ..._options.query,
        ...options(),
      }
    },
    onResponse({ response }) {
      const { errcode, errmsg } = response._data as WeilaRes

      if (errcode === WeilaErrorCode.SUCCESS) {
        response._data = pickWeilaData(response._data)
      }
      else if (weilaLogoutErrorCodes.findIndex(i => errcode === i) >= 0) {
        onLogout()
      }
      else {
        if (onError)
          onError({ errcode, errmsg })
        else
          throw new Error(`${errcode}: ${errmsg}`)
      }
    },
    onRequestError(reqError) {
      onError?.(reqError.error)
      console.error('reqError')
    },
    onResponseError({ error, response }) {
      if (error) {
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
  })
}
