export enum WeilaErrorCode {
  SUCCESS = 0,
  TOKEN_INVALID = 31,
  USER_IS_NOT_REGIST_CORP = 45016,
}

export const noop = (): void => void 0

export const weilaLogoutErrorCodes = [
  WeilaErrorCode.TOKEN_INVALID,
]
