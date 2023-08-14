import { ReviseRequired } from '@vope/types'
import { AxiosInstance, AxiosRequestConfig } from 'axios'
import connectURLParams from './url/params'

type RejectValue = symbol | string | false

interface Config<V> extends AxiosRequestConfig {
  /** 变更默认错误返回值 */
  rejectValue?: V
  /** 错误拦截 */
  twist?: (e: Error) => void
}

const cut = <T, K extends Exclude<keyof Config<T>, keyof AxiosRequestConfig>>(config: Config<T>, key: K) => {
  if (key in config) {
    const value = config[key]
    delete config[key]
    return value
  }
}

type Options = NonNullable<Parameters<typeof connectURLParams>[1]>

export const apiPost = (axios: AxiosInstance, handle: (e: Error) => void) => {
  /**
   * 基于axios.post封装的post方法
   */
  function post<T, V extends false = false>(url: string, options?: Options, config?: Config<V>): Promise<T | V>
  function post<T, V extends Exclude<RejectValue, false>>(url: string, options: Options | undefined, config: ReviseRequired<Config<V>, 'rejectValue'>): Promise<T | V>
  function post<T, V extends RejectValue = false>(url: string, options?: Options, config?: Config<V>) {
    let twist: Config<V>['twist']
    let rejectValue = false as V
    if (config) {
      twist = cut(config, 'twist')
      const rejectValue0 = cut(config, 'rejectValue')
      rejectValue0 !== void 0 && (rejectValue = rejectValue0)
    }
    return new Promise<T | V>((resolve) => {
      axios.post(url, options, config).then(
        // @ts-ignore
        resolve,
        (e: Error) => {
          twist ? twist(e) : handle(e)
          resolve(rejectValue)
        },
      )
    })
  }
  return post
}

export const apiGet = (axios: AxiosInstance, handle: (e: Error) => void) => {
  /**
   * 基于axios.get封装的get方法
   */
  function get<T, V extends false = false>(url: string, options?: Options, config?: Config<V>): Promise<T | V>
  function get<T, V extends Exclude<RejectValue, false>>(url: string, options: Options | undefined, config: ReviseRequired<Config<V>, 'rejectValue'>): Promise<T | V>
  function get<T, V extends RejectValue>(url: string, options?: Options, config?: Config<V>) {
    let twist: Config<V>['twist']
    let rejectValue = false as V
    if (config) {
      twist = cut(config, 'twist')
      const rejectValue0 = cut(config, 'rejectValue')
      rejectValue0 !== void 0 && (rejectValue = rejectValue0)
    }
    return new Promise<T | V>((resolve) => {
      axios.get(connectURLParams(url, options), config).then(
        // @ts-ignore
        resolve,
        (e: Error) => {
          twist ? twist(e) : handle(e)
          resolve(rejectValue)
        },
      )
    })
  }
  return get
}