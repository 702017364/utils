/**
 * 广度优先搜索
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false则停止搜索
 */
export const forBfsEach = <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean
) => { 
  const stack = Array.isArray(list)
    ? list.slice()
    : Array.from(list)
  for (const value of stack) { 
    if (!callback(value)) break
    const result = up(value)
    result === void 0 || stack.push(...result)
  }
}

const reverseMergeIn = <T>(from: T[] | Set<T>, to: T[] = []) => { 
  let i = to.length + (
    Array.isArray(from)
      ? from.length
      : from.size
  )
  for (const value of from) { 
    to[--i] = value
  }
  return to
}

/**
 * 深度优先搜索
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false则停止搜索
 */
export const forDfsEach = <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean
) => { 
  const stack = reverseMergeIn(list)
  while (stack.length > 0) { 
    const value = stack.pop()!
    if (!callback(value)) break
    const result = up(value)
    result === void 0 || reverseMergeIn(result, stack)
  }
}