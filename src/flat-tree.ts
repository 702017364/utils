import type { PartialRecord } from '@vope/types'
import { forBfsEach, forDfsEach } from './each'
import { isNull } from './is/null'

type Value = keyof any

type PValue = Value | null | undefined

type Sup<K, T> = [K] extends [never] ? ((data: T) => PValue) : K

interface Options<K, SK, T> { 
  /**
   * 节点数据唯一标识字段
   */
  key: K

  /**
   * 节点数据源
   */
  origin: T[]

  /**
   * 节点数据与上级节点关系标识
   */
  sup: Sup<SK, T>
}

export namespace FlatTree { 
  /**
   * (0) 先入先出的普通模式 (1) 广度优先 (2) 深度优先
   */
  export type Mode = 0 | 1 | 2
}

const eachs = {
  1: forBfsEach,
  2: forDfsEach,
} satisfies PartialRecord<FlatTree.Mode, Function>

/**
 * 扁平树
 */
export class FlatTree<K extends string, T extends { [P in K]: Value } & { [P in SK]?: PValue }, SK extends string = never> {
  protected key: K

  protected sup: Sup<SK, T>

  /**
   * 节点存储
   */
  protected memory = new Map<Value, T>()

  /**
   * 顶级节点
   */
  protected list = new Set<Value>()

  /**
   * 节点下钻
   */
  protected downs = new Map<Value, Set<Value>>()

  /**
   * 节点上钻
   */
  protected ups = new Map<Value, Value>()

  constructor(options: Options<K, SK, T>) { 
    this.key = options.key
    this.sup = options.sup
    options.origin.forEach((data) => this.add(data))
  }

  /**
   * 获取指定节点的上级节点标识
   */
  protected getPid(data: T) { 
    const { sup } = this
    return typeof sup === 'function'
      ? sup(data)
      : data[sup as SK]
  }

  /**
   * 添加节点
   */
  add(data: T) {
    const { memory, downs } = this
    const id = data[this.key]
    if (memory.has(id)) return false
    const pid = this.getPid(data)
    if (isNull(pid)) {
      this.list.add(id)
    } else {
      const tmp = downs.get(pid)
      tmp
        ? tmp.add(id)
        : downs.set(pid, new Set([id]))
      this.ups.set(id, pid)
    }
    this.memory.set(id, data)
    return true
  }

  /**
   * 删除节点
   * @description 删除节点时如果存在子孙节点也将被同步删除
   */
  delete(value: Value) { 
    const { memory, downs } = this
    if (!memory.has(value)) return false
    let isTop = false
    const stack = [value]
    for (const id of stack) { 
      const pid = this.ups.get(id)
      const tmp = downs.get(id)
      if (tmp) { 
        downs.delete(id)
        tmp.forEach((value) => stack.push(value))
      }
      this.ups.delete(id)
      isNull(pid)
        ? isTop = true
        : downs.get(pid)?.delete(id)
      memory.delete(id)
    }
    isTop && this.list.delete(value)
    return true
  }

  /**
   * 删除指定节点所有的子节点
   */
  deleteSubs(value: Value) { 
    if (!this.memory.has(value)) return false
    const { downs } = this
    const subs = downs.get(value)
    if (!subs) return true
    for (const id of subs) { 
      this.delete(id)
    }
    return true
  }

  /**
   * 更新上级节点标识
   */
  updateSup(data: T) { 
    const { memory } = this
    const id = data[this.key]
    if (!memory.has(id)) return false
    const oldPid = this.ups.get(id)
    const newPid = this.getPid(data)
    if (oldPid === newPid || (isNull(oldPid) && isNull(newPid))) return true
    const { list, ups, downs } = this
    if (isNull(oldPid)) {
      if (!memory.has(newPid!)) return false
      list.delete(id)
      ups.set(id, newPid!)
      downs.get(newPid!)!.add(id)
    } else { 
      if (isNull(newPid)) {
        list.add(id)
        ups.delete(id)
      } else {
        if (!memory.has(newPid)) return false
        ups.set(id, newPid)
        const tmp = downs.get(newPid)
        tmp
          ? tmp.add(id)
          : downs.set(newPid, new Set([id]))
      }
      downs.get(oldPid)!.delete(id)
    }
    return true
  }

  /**
   * 获取节点
   */
  get(value: Value) { 
    return this.memory.get(value)
  }

  /**
   * 获取上级节点
   */
  getSup(value: Value) { 
    const pid = this.ups.get(value)
    return isNull(pid)
      ? void 0
      : this.memory.get(pid)
  }

  /**
   * 获取子级节点
   * @description 当value === null时则获取所有顶级节点
   */
  getSub(value: Value | null, callback?: (data: T) => void) { 
    const { memory } = this
    const tmp = value === null
      ? this.list
      : this.downs.get(value)
    if (!tmp) return
    const list: T[] = []
    for (const id of tmp) { 
      const data = memory.get(id)!
      callback?.(data)
      list.push(data)
    }
    return list
  }

  /**
   * 是否含有节点
   */
  has(value: Value) { 
    return this.memory.has(value)
  }

  /**
   * 遍历节点
   * @param mode 遍历模式
   */
  forEach(callback: (data: T) => void, mode?: FlatTree.Mode) { 
    if (mode === void 0 || mode === 0) {
      this.memory.forEach(callback)
    } else { 
      eachs[mode](
        this.list,
        (value) => this.downs.get(value),
        (value) => (callback(this.memory.get(value)!), true)
      )
    }
  }

  /**
   * 查询节点
   * @param callback 节点回调，返回false则停止查询
   * @param mode 遍历模式
   */
  some(callback: (data: T) => boolean, mode?: FlatTree.Mode) { 
    const { memory } = this
    let result = false
    if (mode === void 0 || mode === 0) {
      for (const [, data] of memory) { 
        if (callback(data)) { 
          result = true
          break
        }
      }
    } else { 
      eachs[mode](
        this.list,
        (value) => this.downs.get(value),
        (value) => (result = true, callback(memory.get(value)!))
      )
    }
    return result
  }

  /**
   * 清除所有节点数据
   */
  clear() { 
    this.memory.clear()
    this.list.clear()
    this.downs.clear()
    this.ups.clear()
  }
}