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
  const stack = [list]
  for (const list of stack) { 
    for (const value of list) { 
      if (!callback(value)) return
      const result = up(value)
      result === void 0 || stack.push(result)
    }
  }
}

/**
 * 广度优先异步搜索
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false/Promise<false>则停止搜索
 */
export const forBfsAsyncEach = async <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean | Promise<boolean>
) => { 
  const stack = [list]
  for (const list of stack) { 
    for (const value of list) { 
      if (!await callback(value)) return
      const result = up(value)
      result === void 0 || stack.push(result)
    }
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
    if (!callback(value)) return
    const result = up(value)
    result === void 0 || reverseMergeIn(result, stack)
  }
}

/**
 * 深度优先异步搜索
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false/Promise<false>则停止搜索
 */
export const forDfsAsyncEach = async <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean | Promise<boolean>
) => { 
  const stack = reverseMergeIn(list)
  while (stack.length > 0) { 
    const value = stack.pop()!
    if (!await callback(value)) return
    const result = up(value)
    result === void 0 || reverseMergeIn(result, stack)
  }
}

const mergeIns = <T>(from: T[] | Set<T>, asc: T[], desc: T[]) => { 
  let count = desc.length + (
    Array.isArray(from)
      ? from.length
      : from.size
  )
  for (const value of from) { 
    asc.push(value)
    desc[--count] = value
  }
  return [asc, desc]
}

/**
 * 深度优先搜索(栈模式)，回调规则为从里到外
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false则停止搜索
 * @description 应用场景：统计子节点的数据量
 */
export const forDfsStackEach = <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean
) => { 
  const [stack, locals] = mergeIns(list, [], [])
  while (stack.length > 0) { 
    const value = stack.pop()!
    const result = up(value)
    result === void 0 || mergeIns(result, stack, locals)
  }
  for (let i = locals.length; i > 0;) { 
    if (!callback(locals[--i])) break
  }
}

/**
 * 深度优先异步搜索(栈模式)，回调规则为从里到外
 * @param list 节点源
 * @param up 节点下钻，返回当前节点的子节点
 * @param callback 节点回调，返回false/Promise<false>则停止搜索
 * @description 应用场景：统计子节点的数据量
 */
export const forDfsStackAsyncEach = async <T>(
  list: T[] | Set<T>,
  up: (data: T) => T[] | Set<T> | void,
  callback: (data: T) => boolean | Promise<boolean>
) => { 
  const [stack, locals] = mergeIns(list, [], [])
  while (stack.length > 0) { 
    const value = stack.pop()!
    const result = up(value)
    result === void 0 || mergeIns(result, stack, locals)
  }
  for (let i = locals.length; i > 0;) { 
    if (!await callback(locals[--i])) break
  }
}