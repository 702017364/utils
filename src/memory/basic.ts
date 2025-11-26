import type { GetGivenProps } from '@vope/types'
import { hash8strings } from '../convert/strings'

const PUSH = 1
const RESET = 2
const DELETE = 0

export namespace Memory { 
  export type Type = string | number | symbol

  export type Pitch<Data, Type> = (
    Data extends object
      ? GetGivenProps<Data, Type>
      : never
  ) | ((data: Data) => Type)

  export interface Emit<T> { 
    (type: typeof PUSH, data: T): void
    (type: typeof RESET, data: T[]): void
    (type: typeof DELETE, index: number): void
  }
}

interface Mount<T> { 
  /**
   * @param index 当前存入数据对应的角标
   * @param reactor 当前存入数据对应存储单元
   */
  (index: number, reactor?: T): T
}

interface Reflex<T> { 
  /**
   * @param reactor 存储单元
   */
  (reactor: T): number[]
}

interface Config<T, Reactor> {
  /**
   * 定义数据如何挂载到存储中
   */
  mount: Mount<Reactor>
  
  /**
   * 定义存储单元和存储关系
   * @param reactor 存储单元
   */
  reflex: Reflex<Reactor>

  /**
   * 存储变化触发(用于同步数据)
   */
  emit?: Memory.Emit<T>
}

const LIST_SYMBOL = Symbol()
const MEMORYS_SYMBOL = Symbol()

/**
 * 分类存储(通过继承，可用于拓展存储方式)
 */
export class MemoryBasic<
  T,
  Reactor,
  Type extends Memory.Type
> {
  static readonly PUSH = PUSH
  static readonly RESET = RESET
  static readonly DELETE = DELETE

  #mount: Mount<Reactor>
  #reflex: Reflex<Reactor>
  #emit?: Memory.Emit<T>
  
  protected [LIST_SYMBOL]: T[] = []
  protected [MEMORYS_SYMBOL] = new Map<Type, Reactor>()

  /**
   * 返回存储长度
   */
  get size() { 
    return this[LIST_SYMBOL].length
  }

  /**
   * @param key     用于对数据进行分类的key
   * @param config  配置项
   */
  constructor(protected key: Memory.Pitch<T, Type>, config: Config<T, Reactor>) { 
    this.#mount = config.mount
    this.#reflex = config.reflex
    this.#emit = config.emit
  }

  protected getType(data: T) {
    const { key } = this
    return typeof key === 'function' ? key(data) : data[key] as Type
  }

  /**
   * 添加数据
   */
  push(...values: T[]) { 
    const memorys = this[MEMORYS_SYMBOL]
    const list = this[LIST_SYMBOL]
    values.forEach((data) => {
      const type = this.getType(data)
      const memory = memorys.get(type)
      const index = list.push(data) - 1
      const result = this.#mount(index, memory)
      memory === result || memorys.set(type, result)
      this.#emit?.(PUSH, data)
    })
    return this
  }

  /**
   * 返回位于指定索引处的项
   */
  at(index: number) { 
    const list = this[LIST_SYMBOL]
    if (index < 0) { 
      index += list.length
    }
    return list.at(index)
  }

  /**
   * 遍历所有存储数据(按入栈顺序)
   */
  forEach(callback: (data: T, index: number) => void) { 
    this[LIST_SYMBOL].forEach(callback)
    return this
  }

  /**
   * 遍历所有存储类型
   */
  forType(callback: (data: T[], type: Type) => void) { 
    const memorys = this[MEMORYS_SYMBOL]
    const list = this[LIST_SYMBOL]
    for (const [type, memory] of memorys) {
      const caches = this.#reflex(memory).map((index) => list[index])
      callback(caches, type)
    }
    return this
  }

  /**
   * some(按入栈顺序)
   */
  some(callback: (data: T, index: number) => boolean) { 
    return this[LIST_SYMBOL].some(callback)
  }

  /**
   * map(按入栈顺序)
   */
  map<V>(callback: (data: T, index: number) => V) { 
    return this[LIST_SYMBOL].map(callback)
  }

  /**
   * reduce(按入栈顺序)
   */
  reduce<V>(callback: (previousValue: V, currentValue: T, currentIndex: number) => V, initialValue: V) { 
    return this[LIST_SYMBOL].reduce(callback, initialValue)
  }

  /**
   * 判断存储是否包含指定类型
   */
  includes(type: Type) { 
    return this[MEMORYS_SYMBOL].has(type)
  }

  /**
   * 获取指定类型存储数据
   */
  get(type: Type) {
    const memory = this[MEMORYS_SYMBOL].get(type)
    return memory === void 0
      ? null
      : this.#reflex(memory).map((count) => this[LIST_SYMBOL][count])
  }

  /**
   * 删除指定存储数据
   */
  delete(data: T) { 
    const memorys = this[MEMORYS_SYMBOL]
    const list = this[LIST_SYMBOL]
    let index = -1
    if (!list.some((value, i) => {
      if (data === value) {
        index = i
        list.splice(index, 1)
        const type = this.getType(value)
        const memory = this.#reflex(memorys.get(type)!)
        if (memory.length === 1) {
          memorys.delete(type)
        } else { 
          memory.some((count, j) => { 
            if (count === i) {
              memory.splice(j, 1)
              return true
            }
          })
        }
        return true
      }
    })) return this
    for (const [type, target] of memorys) { 
      const memory = this.#reflex(target)
      memory.forEach((value, i) => { 
        if (value >= index) { 
          memory[i] = value - 1
        }
      })
      if (memory !== target) {
        let reactor: Reactor
        memory.forEach((count) => {
          reactor = this.#mount(count, reactor)
        })
        memorys.set(type, reactor!)
      }
    }
    this.#emit?.(DELETE, index)
    return this
  }

  /**
   * 删除指定类型存储数据
   */
  deleteType(type: Type) { 
    const memorys = this[MEMORYS_SYMBOL]
    const list = this[LIST_SYMBOL]
    if (!memorys.has(type)) return this
    const local = hash8strings(this.#reflex(memorys.get(type)!))
    const imitator = new MemoryBasic(this.key, {
      mount: this.#mount,
      reflex: this.#reflex,
    })
    list.forEach((data, index) => { 
      index in local || imitator.push(data)
    })
    const tmp = this[LIST_SYMBOL] = imitator[LIST_SYMBOL]
    this[MEMORYS_SYMBOL] = imitator[MEMORYS_SYMBOL]
    this.#emit?.(RESET, tmp.slice(0))
    return this
  }

  /**
   * 清理存储
   */
  clear() { 
    this[LIST_SYMBOL] = []
    this[MEMORYS_SYMBOL].clear()
    this.#emit?.(RESET, [])
  }
}