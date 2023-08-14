type Param = string | number | boolean | undefined

type Params = Param | Param[]

/**
 * url拼接参数
 * @param url 
 * @param params 需要让url携带的参数
 * @param isOpenType 是否开启类型处理
 * @description 开始类型处理的情况下，undefined会被转成null
 */
const connectURLParams = (url: string, params?: Record<string, Params>, isOpenType?: boolean) => { 
  if (!params) return url
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
  if (!list.length) return url
  const caches = list.join('&')
  return url.includes('?')
    ? url + '&' + caches
    : url + '?' + caches
}

export default connectURLParams