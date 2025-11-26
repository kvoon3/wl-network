import type { WeilaRes } from './types'
import { isObject, objectKeys } from '@antfu/utils'
import md5 from 'md5'
import { nanoid } from 'nanoid'

interface V1Query {
  'app_id': string
  'access-token'?: string
  'et': string
  'sign': string
  'uuid': string
}

interface V2Query {
  appid: string
  token?: string
  et: string
  sign: string
  uuid: string
}

export function v1Query(appName: string, app_id: string, key: string): V1Query {
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${key}`)
  const uuid = getOrCreateUuid(appName)

  const res: V1Query = {
    app_id,
    et: String(et),
    sign: app_sign,
    uuid,
  }

  const access_token = localStorage.getItem('token')

  if (access_token)
    res['access-token'] = access_token

  return res
}

export function v2Query(appName: string, app_id: string, key: string): V2Query {
  const timestamp = Date.now() || -1
  const et = Math.floor(timestamp / 1000)
  const app_sign = md5(`${et}${key}`)
  const app_sign_v2 = getMd5Middle8Chars(app_sign)
  const uuid = getOrCreateUuid(appName)

  const res: V2Query = {
    appid: app_id,
    et: String(et),
    sign: app_sign_v2,
    uuid,
  }

  const token = localStorage.getItem('token')

  if (token)
    res.token = token

  return res
}

export function getMd5Middle8Chars(md5: string): string {
  // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
  return md5.slice(12, 20)
}

export function getOrCreateUuid(appName: string): string {
  const uuidKey = `__${appName}-uuid__`
  let uuid = localStorage.getItem(uuidKey)
  if (!uuid) {
    uuid = nanoid()
    localStorage.setItem(uuidKey, uuid)
  }
  return uuid
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
