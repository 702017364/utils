import { Serializes, flatURLParams } from '../serialize/url-params'

/**
 * url拼接参数
 * @param url 
 * @param params 需要让url携带的参数
 * @param serializes 转换套件
 */
export const connectURLParams = <T extends object>(url: string, params: T, serializes: Serializes<T>) => { 
  const query = flatURLParams(params, serializes)
  return query
    ? url.includes('?')
      ? url + '&' + query
      : url + '?' + query
    : url
}