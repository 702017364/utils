import hash8strings from '../convert/strings'
import { Memory } from './type'

interface Config<Reactor> {
  /**
   * 定义数据如何挂载到存储中
   * @param index 当前存入数据对应的角标
   * @param reactor 当前存入数据对应存储单元
   */
  mount(index: number, reactor?: Reactor): Reactor
  /**
   * 定义存储单元和存储关系
   * @param reactor 存储单元
   */
  reflex(reactor: Reactor): number[]
}

/**
 * 分类存储(通过继承，可用于拓展存储方式)
 */
export default class MemoryBasic<
  V,
  Reactor,
  Type extends Memory.Type
> {
  #mount: Config<Reactor>['mount']
  #reflex: Config<Reactor>['reflex']
  
  protected list: V[] = []
  protected memorys = new Map<Type, Reactor>()

  /**
   * 返回存储长度
   */
  get size() { 
    return this.list.length
  }

  /**
   * @param key 用于对数据进行分类的key
   * @param config 
   */
  constructor(protected key: Memory.Pitch<V, Type>, config: Config<Reactor>) { 
    this.#mount = config.mount
    this.#reflex = config.reflex
  }

  protected getType(data: V) {
    const { key } = this
    return typeof key === 'function' ? key(data) : data[key] as Type
  }

  push(...list: V[]) { 
    const { memorys } = this
    list.forEach((data) => { 
      const type = this.getType(data)
      const memory = memorys.get(type)
      const index = this.list.push(data) - 1
      const result = this.#mount(index, memory)
      memory === result || memorys.set(type, result)
    })
    return this
  }

  /**
   * 遍历所有存储数据(按入栈顺序)
   */
  forEach(callback: (data: V, index: number) => void): this { 
    this.list.forEach(callback)
    return this
  }

  /**
   * 遍历所有存储类型
   */
  forType(callback: (data: V[], type: Type) => void) { 
    const { memorys, list } = this
    for (const [type, memory] of memorys) {
      const caches = this.#reflex(memory).map((index) => list[index])
      callback(caches, type)
    }
    return this
  }

  /**
   * 检测存储是否包含某种类型
   */
  includes(type: Type) { 
    return this.memorys.has(type)
  }

  /**
   * 获取指定类型存储数据
   */
  get(type: Type) {
    const memory = this.memorys.get(type)
    return memory === void 0
      ? null
      : this.#reflex(memory).map((count) => this.list[count])
  }

  /**
   * 删除指定存储数据
   */
  delete(data: V) { 
    const { memorys, list } = this
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
      memory.forEach((value, index) => { 
        if (value >= index) { 
          memory[index] = value - 1
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
    return this
  }

  /**
   * 删除指定类型存储数据
   */
  deleteType(type: Type) { 
    const { memorys, list } = this
    if (!memorys.has(type)) return this
    const local = hash8strings(this.#reflex(memorys.get(type)!))
    const Memory = this.constructor as new (key: ConstructorParameters<typeof MemoryBasic<V, Reactor, Type>>[0]) => MemoryBasic<V, Reactor, Type>
    const imitator = new Memory(this.key)
    list.forEach((data, index) => { 
      index in local || imitator.push(data)
    })
    this.list = imitator.list
    this.memorys = imitator.memorys
    return this
  }

  /**
   * 清理存储
   */
  clear() { 
    this.list = []
    this.memorys.clear()
  }
}