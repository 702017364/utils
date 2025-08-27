import { MemoryBasic } from './basic'
import type { Memory } from './type'

/**
 * 分类存储(基于普通的键值存储)
 */
export class MemoryList<
  T,
  Type extends Memory.Type = Memory.Type
> extends MemoryBasic<T, number[], Type> {
  constructor(key: Memory.Pitch<T, Type>) { 
    super(key, {
      mount: (index, reactor) => reactor
        ? (reactor.push(index), reactor)
        : [index],
      reflex: (reactor) => reactor,
    })
  }
}
