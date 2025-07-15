import type { WeilaRes } from './types'
import { isObject, objectKeys } from '@antfu/utils'
import md5 from 'md5'

interface V1Query {
  'app_id': string
  'access-token': string
  'et': string
  'sign': string
}
interface V2Query {
  appid: string
  token: string
  et: string
  sign: string
}

export function v1Query(app_id: string, key: string): V1Query {
  const access_token = localStorage.getItem('token') || ''
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${key}`)

  return {
    'app_id': app_id,
    'access-token': access_token,
    'et': String(et),
    'sign': app_sign,
  }
}

export function v2Query(app_id: string, key: string): V2Query {
  const access_token = localStorage.getItem('token') || ''
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${key}`)
  const app_sign_v2 = getMd5Middle8Chars(app_sign)

  return {
    appid: app_id,
    token: access_token,
    et: String(et),
    sign: app_sign_v2,
  }
}

export function getMd5Middle8Chars(md5: string): string {
  // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
  return md5.slice(12, 20)
}

export function pickWeilaData(weilaRes: WeilaRes): any {
  const { data } = weilaRes

  if (isObject(data)) {
    const keys = objectKeys(data)
    if (keys.length === 1)
      return weilaRes.data?.[keys[0]]
  }

  return weilaRes.data
}
