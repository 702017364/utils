import { Assign } from '@vope/types'
import { MemoryBasic } from './basic'
import { type Memory } from './type'

type Transform<T, V> = {
  [P in keyof T]: T[P] extends (...args: any) => any
    ? (...args: Parameters<T[P]>) => ReturnType<T[P]> extends T
      ? V
      : ReturnType<T[P]>
    : T[P]
}

type Basic<T, V, Type extends Memory.Type> = Assign<Transform<Omit<MemoryBasic<T, V, Type>, 'forType'>, MemorySimple<T, Type>>, {
  get(type: Type): T | null
  at(index: number): T | undefined
}>

/**
 * 简易存储(不分类)
 */
export class MemorySimple<T, Type extends Memory.Type> implements Basic<T, number, Type> { 
  #memory: MemoryBasic<T, number, Type>

  #key: Memory.Pitch<T, Type>

  get size() { 
    return this.#memory.size
  }

  constructor(key: Memory.Pitch<T, Type>) { 
    this.#key = key
    this.#memory = new MemoryBasic<T, number, Type>(key, {
      mount: (index) => index,
      reflex: (reactor) => [reactor],
    })
  }

  #getType(data: T) { 
    const key = this.#key
    return typeof key === 'function' ? key(data) : data[key] as Type
  }

  /**
   * 返回位于指定索引处的项
   */
  at(index: number) { 
    return this.#memory.at(index)
  }

  push(...list: T[]) { 
    const memory = this.#memory
    list.forEach((data) => { 
      memory.includes(this.#getType(data)) || memory.push(data)
    })
    return this
  }

  /**
   * 获取指定类型存储数据
   */
  get(type: Type) { 
    const value = this.#memory.get(type)
    if (value === null) return value
    return value.length
      ? value[0]
      : null
  }

  /**
   * 遍历所有存储数据(按入栈顺序)
   */
  forEach(callback: (data: T, index: number) => void) { 
    this.#memory.forEach(callback)
    return this
  }

  /**
   * some(按入栈顺序)
   */
  some(callback: (data: T, index: number) => boolean) { 
    return this.#memory.some(callback)
  }

  /**
   * map(按入栈顺序)
   */
  map<V>(callback: (data: T, index: number) => V) { 
    return this.#memory.map(callback)
  }

  /**
   * reduce(按入栈顺序)
   */
  reduce<V>(callback: (previousValue: V, currentValue: T, currentIndex: number) => V, initialValue: V) { 
    return this.#memory.reduce(callback, initialValue)
  }

  /**
   * 判断是否包含指定类型
   */
  includes(type: Type) { 
    return this.#memory.includes(type)
  }

  /**
   * 删除指定存储数据
   */
  delete(data: T) { 
    this.#memory.delete(data)
    return this
  }

  /**
   * 删除指定类型存储数据
   */
  deleteType(type: Type) { 
    this.#memory.deleteType(type)
    return this
  }

  /**
   * 清理存储
   */
  clear() { 
    this.#memory.clear()
  }
}