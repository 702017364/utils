import { MemoryBasic } from '@vope/utils'
import { deepStrictEqual } from 'assert'

type Type = 1 | 2 | 3 | 4

interface Item {
  id: string
  label: string
  type: Type
}

// 定义测试事件类型
interface TestEvent {
  type: number
  data: any
}

describe('MemoryBasic', function () {
  it('基本功能测试 - push 操作', function () {
    // 创建一个不带 emit 的 MemoryBasic 实例
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1)
    memory.push(item2)
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id
    ]
    
    const expected = [
      2,
      '1',
      '2'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('基本功能测试 - delete 操作', function () {
    // 创建一个不带 emit 的 MemoryBasic 实例
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1, item2)
    memory.delete(item1)
    
    const actual = [
      memory.size,
      memory.at(0)?.id
    ]
    
    const expected = [
      1,
      '2'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('基本功能测试 - deleteType 操作', function () {
    // 创建一个不带 emit 的 MemoryBasic 实例
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    const item3: Item = { id: '3', label: '3', type: 3 }
    
    memory.push(item1, item2, item3)
    memory.deleteType(2) // 删除 type 为 2 的元素
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id
    ]
    
    const expected = [
      2,
      '1',
      '3'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('基本功能测试 - clear 操作', function () {
    // 创建一个不带 emit 的 MemoryBasic 实例
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1, item2)
    memory.clear()
    
    const actual = [
      memory.size
    ]
    
    const expected = [
      0
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('数据同步功能测试 - push 操作触发 emit', function () {
    const events: TestEvent[] = []
    
    // 创建一个自定义的 MemoryBasic 实例，传入 emit 配置项
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor,
      emit: (type: number, data: any) => {
        events.push({ type, data })
      }
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1)
    memory.push(item2)
    
    const actual = [
      events.length,
      events[0].type,
      events[0].data.id,
      events[1].type,
      events[1].data.id
    ]
    
    const expected = [
      2,
      MemoryBasic.PUSH, // PUSH = 1
      '1',
      MemoryBasic.PUSH, // PUSH = 1
      '2'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('数据同步功能测试 - delete 操作触发 emit', function () {
    const events: TestEvent[] = []
    
    // 创建一个自定义的 MemoryBasic 实例，传入 emit 配置项
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor,
      emit: (type: number, data: any) => {
        events.push({ type, data })
      }
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1, item2)
    memory.delete(item1)
    
    const actual = [
      events.length,
      events[2].type, // 前两个是 push 事件
      events[2].data
    ]
    
    const expected = [
      3, // push 两次，delete 一次
      MemoryBasic.DELETE, // DELETE = 0
      0 // 删除的索引
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('数据同步功能测试 - deleteType 操作触发 emit', function () {
    const events: TestEvent[] = []
    
    // 创建一个自定义的 MemoryBasic 实例，传入 emit 配置项
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor,
      emit: (type: number, data: any) => {
        events.push({ type, data })
      }
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    const item3: Item = { id: '3', label: '3', type: 3 }
    
    memory.push(item1, item2, item3)
    memory.deleteType(2) // 这会触发 reset 事件
    
    const actual = [
      events.length,
      events[3].type, // 前三个是 push 事件
      events[3].data.length
    ]
    
    const expected = [
      4, // push 三次，deleteType 一次
      MemoryBasic.RESET, // RESET = 2
      2 // 剩余元素数量
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('数据同步功能测试 - clear 操作触发 emit', function () {
    const events: TestEvent[] = []
    
    // 创建一个自定义的 MemoryBasic 实例，传入 emit 配置项
    const memory = new MemoryBasic<Item, number[], Type>('type', {
      mount: (index: number, reactor?: number[]) => reactor ? (reactor.push(index), reactor) : [index],
      reflex: (reactor: number[]) => reactor,
      emit: (type: number, data: any) => {
        events.push({ type, data })
      }
    })
    
    const item1: Item = { id: '1', label: '1', type: 1 }
    const item2: Item = { id: '2', label: '2', type: 2 }
    
    memory.push(item1, item2)
    memory.clear()
    
    const actual = [
      events.length,
      events[2].type, // 前两个是 push 事件
      events[2].data.length
    ]
    
    const expected = [
      3, // push 两次，clear 一次
      MemoryBasic.RESET, // RESET = 2
      0 // 清除后元素数量
    ]
    
    deepStrictEqual(actual, expected)
  })
})