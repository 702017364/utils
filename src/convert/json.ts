/**
 * 对象数组转hash(要求主键值为string类型)
 * @example 
 *  hash8json(
 *    [
 *      { key: 'a', value: 1 }, 
 *      { key: 'b', value: 2 }
 *    ], 
 *    'key'
 *  ).a.value // 1
 */
const hash8json = <
  K extends string | symbol,
  T extends Record<K, string>
>(list: T[], key: K) => list.reduce((caches, data) => {
  caches[data[key]] = data
  return caches
}, {} as Record<T[K], T>)

export default hash8json