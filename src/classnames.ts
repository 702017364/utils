type Base = string | undefined | null

type Item = Base | Base[] | Record<string, boolean>

const add = (a: string, b: string) => 
  a
    ? a + '\u0020' + b
    : b

/**
 * 拼接多个class
 */
export default (...list: Item[]) => list.reduce<string>((caches, data) => { 
  if (typeof data === 'string') {
    data && (caches = add(caches, data))
  } else if (Array.isArray(data)) {
    data.forEach((value) => value && (caches = add(caches, value)))
  } else if (data) { 
    for (const key in data) { 
      key && data[key] && (caches = add(caches, key))
    }
  }
  return caches
}, '')