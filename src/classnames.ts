import { isBoolean, isString } from 'lodash-es'

type Base = string | boolean | undefined | null

type Item = Base | Base[] | Record<string, boolean>

const add = (a: string, b: string) => 
  a
    ? a + '\u0020' + b
    : b

/**
 * 拼接多个class
 */
export const classnames = (...list: Item[]) => list.reduce<string>((caches, data) => { 
  if (isString(data)) {
    data && (caches = add(caches, data))
  } else if (Array.isArray(data)) {
    data.forEach((value) => value
      && isString(value)
      && (caches = add(caches, value)))
  } else if (!isBoolean(data)) { 
    for (const key in data) { 
      key && data[key] && (caches = add(caches, key))
    }
  }
  return caches
}, '')