const re = /(^|[^:/])\/{2,}/g

/**
 * 实现多个路径拼接
 */
const joinURLs = (...list: string[]) => { 
  const { length } = list
  if (length === 0) return ''
  return length === 1
    ? list[0]
    : list.join('/').replace(re, ($0, $1: string) => `${$1}/`)
}

export default joinURLs