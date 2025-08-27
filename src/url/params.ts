import { type Serializes, flatURLParams } from '../serialize/url-params'

const rasterize = <T extends object>(data: T) => { 
  const params = new URLSearchParams()
  for (const key in data) { 
    params.append(
      key,
      <string>data[key]
    )
  }
  return params.toString()
}

/**
 * url拼接参数
 * @param url 
 * @param params 需要让url携带的参数
 * @param serializes 转换套件
 * @description 未设置转换套件时使用URLSearchParams的默认处理方式
 */
export const connectURLParams = <T extends object>(url: string, params: T, serializes?: Serializes<T>) => { 
  const query = serializes
    ? flatURLParams(params, serializes)
    : rasterize(params)
  return query
    ? url.includes('?')
      ? url + '&' + query
      : url + '?' + query
    : url
}