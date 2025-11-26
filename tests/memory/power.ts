import { MemoryPower } from '@vope/utils'
import { deepStrictEqual } from 'assert'

type Type = 1 | 2 | 3 | 4

interface Item {
  id: string
  label: string
  type: Type
}

describe('class MemoryPower', function () {
  it('push() 添加数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 },
      { id: '3', label: '3', type: 2 },
      { id: '4', label: '4', type: 4 }
    ]
    
    memory.push(items[0])
    memory.push(items[1], items[2])
    memory.push(items[3])
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id,
      memory.at(2)?.id,
      memory.at(3)?.id
    ]
    
    const expected = [
      4,
      '1',
      '2',
      '3',
      '4'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('at() 获取指定索引数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 }
    ]
    
    memory.push(...items)
    
    const actual = [
      memory.at(0)?.id,
      memory.at(-1)?.id,
      memory.at(999),
      memory.at(-999)
    ]
    
    const expected = [
      '1',
      '2',
      undefined,
      undefined
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('forEach() 遍历所有存储数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 }
    ]
    
    memory.push(...items)
    
    const actual: string[] = []
    memory.forEach((item, index) => {
      actual.push(`${item.id}-${index}`)
    })
    
    const expected = ['1-0', '2-1']
    
    deepStrictEqual(actual, expected)
  })

  it('forType() 遍历所有分类数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 },
      { id: '3', label: '3', type: 2 },
      { id: '4', label: '4', type: 4 }
    ]
    
    memory.push(...items)

    const actual: string[] = []
    memory.forType((data) => {
      data.forEach(({ id }) => actual.push(id))
    })
    
    deepStrictEqual(actual, ['1', '2', '3', '4'])
  })

  it('get() 获取指定类型数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 },
      { id: '3', label: '3', type: 2 },
      { id: '4', label: '4', type: 4 }
    ]
    
    memory.push(...items)

    const actual = [
      memory.get(1)?.map(item => item.id),
      memory.get(2)?.map(item => item.id),
      memory.get(3),
      memory.get(4)?.map(item => item.id)
    ]
    
    const expected = [
      ['1'],
      ['2', '3'],
      null,
      ['4']
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('includes() 判断是否包含指定类型', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 }
    ]
    
    memory.push(...items)

    const actual = [
      memory.includes(1),
      memory.includes(2),
      memory.includes(3)
    ]
    
    const expected = [
      true,
      true,
      false
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('delete() 删除指定数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 },
      { id: '3', label: '3', type: 2 },
      { id: '4', label: '4', type: 4 }
    ]
    
    memory.push(...items)
    
    const first = items[0]
    const last = items[3]
    
    memory.delete(first)
    memory.delete(last)
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id
    ]
    
    const expected = [
      2,
      '2',
      '3'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('deleteType() 删除指定类型数据', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 },
      { id: '3', label: '3', type: 2 },
      { id: '4', label: '4', type: 4 }
    ]
    
    memory.push(...items)
    memory.deleteType(2)
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id
    ]
    
    const expected = [
      2,
      '1',
      '4'
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('clear() 清理存储', function () {
    const memory = new MemoryPower<Item, Type>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 1 },
      { id: '2', label: '2', type: 2 }
    ]
    
    memory.push(...items)
    memory.clear()
    
    const actual = [
      memory.size
    ]
    
    const expected = [
      0
    ]
    
    deepStrictEqual(actual, expected)
  })
})