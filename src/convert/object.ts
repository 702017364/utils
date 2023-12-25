/**
 * 对象数组转hash
 * @example 
 *  hash8object(
 *    [
 *      { key: String, value: 1 }, 
 *      { key: Object, value: 2 }
 *    ], 
 *    'key'
 *  ).get(Object).value // 2
 */
export const hash8object = <
  K extends string | symbol,
  T extends Record<K, unknown>
>(list: T[], key: K) => list.reduce((caches, data) => {
  caches.set(data[key], data)
  return caches
}, new Map<T[K], T>())