import { isBoolean } from 'lodash-es'
import { URLParamsFlats, URLParamsValues, flatURLParams } from '../serialize/url-params'

type Param = string | number | boolean | undefined

type Params = Param | Param[]

const formatter = (params: Record<string, Params>, isOpenType?: boolean) => { 
  const list: string[] = []
  for (const key in params) { 
    const value = params[key]
    if (value === void 0) {
      list.push(key)
    } else if (Array.isArray(value)) {
      list.push(
        key
        + '='
        + (
          isOpenType
            ? JSON.stringify(value).slice(1, -1)
            : value.join(',')
        )
      )
    } else { 
      list.push(key + '=' + (isOpenType ? JSON.stringify(value) : value.toString()))
    }
  }
  return list.join('&')
}

/**
 * url拼接参数
 * @param url 
 * @param params 需要让url携带的参数
 * @param serializes 泛型对象(转换套件)，boolean或缺省(是否将undefined会被转成null)
 */
export function connectURLParams<T extends URLParamsValues>(url: string, params: URLParamsFlats<T>, serializes: T): string
export function connectURLParams(url: string, params?: Record<string, Params>, serializes?: boolean): string
export function connectURLParams(url: string, params?: Record<string, any>, serializes?: boolean | Record<string, any>) { 
  if (!params) return url
  const query = serializes === void 0 || isBoolean(serializes)
    ? formatter(params, serializes)
    : flatURLParams(params, serializes)
  if (!query) return url
  return url.includes('?')
    ? url + '&' + query
    : url + '?' + query
}