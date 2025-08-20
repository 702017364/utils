/**
 * 数组转hash
 * @example 
 *  hash8strings(['a', 'b']).a // 0
 */
export const hash8strings = <T extends keyof any>(list: T[]) =>
  list.reduce((caches, data, index) => {
    caches[data] = index
    return caches
  }, {} as { [P in T]: number })