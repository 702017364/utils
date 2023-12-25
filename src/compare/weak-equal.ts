/**
 * 深度相等性比较(弱比较)
 */
export const deepWeakEqual = (from: any, to: any) => {
  if (typeof from !== 'object'
    || from === null
    || typeof to !== 'object'
    || to === null
  ) return from === to
  if (Array.isArray(from) && Array.isArray(to)) {
    if (from.length !== to.length) return false
    return !from.some((t1, index) => {
      if (!deepWeakEqual(t1, to[index])) {
        return true
      }
    })
  } else {
    const caches: Record<string, string> = {}
    for (const key in from) {
      if (!deepWeakEqual(from[key], to[key])) {
        return false
      } else {
        caches[key] = key
      }
    }
    for (const key in to) {
      if (key in caches) continue
      if (!deepWeakEqual(from[key], to[key])) {
        return false
      }
    }
  }
  return true
}