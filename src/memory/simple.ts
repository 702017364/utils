import { MemoryBasic, _LV } from './basic'
import { Memory } from './type'

/**
 * 简易存储(不分类)
 */
export class MemorySimple<T, Type extends Memory.Type> { 
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

  push(...list: _LV<T>) { 
    const memory = this.#memory
    list.forEach((data) => { 
      if (Array.isArray(data)) {
        this.push(...data)
      } else if(!memory.includes(this.#getType(data))) { 
        memory.push(data)
      }
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
   * 获取指定类型存储数据
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