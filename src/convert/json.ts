/**
 * 对象数组转hash
 * @example 
 *  hash8json(
 *    [
 *      { key: 'a', value: 1 }, 
 *      { key: 'b', value: 2 }
 *    ], 
 *    'key'
 *  ).a.value // 1
 */
export const hash8json = <
  K extends string | symbol,
  T extends Record<K, keyof any>
>(list: T[], key: K) => list.reduce((caches, data) => {
  caches[data[key]] = data
  return caches
}, {} as Record<T[K], T>)