import { deconPowersSum } from '../power/decon'
import { MemoryBasic } from './basic'
import { type Memory } from './type'

/**
 * 分类存储(基于2的n次幂之和构建唯一键进行存储)
 */
export class MemoryPower<
  T,
  Type extends Memory.Type = Memory.Type
> extends MemoryBasic<T, number, Type> {
  constructor(key: Memory.Pitch<T, Type>) {
    super(key, {
      mount: (index, reactor) => (reactor || 0) + 2 ** index,
      reflex: (reactor) => deconPowersSum(reactor, 'asc'),
    })
  }
}