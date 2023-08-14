/**
 * 值比较(深度浅比较)
 */
const compareValue = (from: any, to: any) => {
  if (typeof from !== 'object'
    || from === null
    || typeof to !== 'object'
    || to === null
  ) return from === to
  if (Array.isArray(from) && Array.isArray(to)) {
    if (from.length !== to.length) return false
    return !from.some((t1, index) => {
      if (!compareValue(t1, to[index])) {
        return true
      }
    })
  } else {
    const caches: Record<string, string> = {}
    for (const key in from) {
      if (!compareValue(from[key], to[key])) {
        return false
      } else {
        caches[key] = key
      }
    }
    for (const key in to) {
      if (key in caches) continue
      if (!compareValue(from[key], to[key])) {
        return false
      }
    }
  }
  return true
}

export default compareValue