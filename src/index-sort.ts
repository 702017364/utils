/**
 * 索引排序
 * @param list 列表
 * @param key 索引字段
 */
export default <K extends string, T extends { [P in K]: number }>(list: T[], key: K) => {
  const { length } = list
  if (length < 2) return list

  const first = list[0][key]
  const caches: Record<number, number> = { [first]: first }
  let isA = false
  let max = first
  let min = first
  for (let i = 1; i < length; i++) { 
    const value = list[i][key]
    if (value === Math.trunc(value) && value in caches === false) {
      if (value > max) {
        max = value
      } else if (value < min) {
        min = value
      }
      caches[value] = value
    } else { 
      isA = true
      break
    }
  }
  if (!isA && max - min === length - 1) {
    return list.reduce<T[]>((cache, data) => {
      cache[data[key] - min] = data
      return cache
    }, [])
  } else {
    return list.sort((a, b) => a[key] - b[key])
  }
}