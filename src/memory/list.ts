import MemoryBasic from './basic'
import { Memory } from './type'

/**
 * 分类存储(基于普通的键值存储)
 */
export default class MemoryList<
  V,
  Type extends Memory.Type = Memory.Type
> extends MemoryBasic<V, number[], Type> {
  constructor(key: Memory.Pitch<V, Type>) { 
    super(key, {
      mount: (index, reactor) => reactor
        ? (reactor.push(index), reactor)
        : [index],
      reflex: (reactor) => reactor,
    })
  }
}
