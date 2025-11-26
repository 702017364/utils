import { MemorySimple } from '@vope/utils'
import { deepStrictEqual } from 'assert'

interface Item {
  id: string
  label: string
  type: string
}

describe('class MemorySimple', function () {
  it('push() 添加数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' },
      { id: '3', label: '3', type: 'a' },
      { id: '4', label: '4', type: 'c' },
      { id: '4', label: '5', type: 'd' },
    ]
    
    memory.push(items[0])
    memory.push(items[1], items[2], items[3], items[4])
    
    const actual = [
      memory.size,
      memory.at(0)?.id,
      memory.at(1)?.id,
      memory.at(2)?.id,
      memory.at(3)?.id,
      memory.at(4)?.id,
    ]
    
    const expected = [
      4, // 重复的ID不会被添加
      '1',
      '2',
      '3',
      '4',
      undefined,
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('at() 获取指定索引数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
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
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)
    
    const actual: string[] = []
    memory.forEach((item, index) => {
      actual.push(`${item.id}-${index}`)
    })
    
    const expected = ['1-0', '2-1']
    
    deepStrictEqual(actual, expected)
  })

  it('some() 检查是否包含满足条件的数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)

    const actual = [
      memory.some(item => item.id === '2'),
      memory.some(item => item.id === '3')
    ]
    
    const expected = [
      true,
      false
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('map() 映射所有存储数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)
    
    const actual = memory.map(item => item.id)
    const expected = ['1', '2']
    
    deepStrictEqual(actual, expected)
  })

  it('reduce() 归约所有存储数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)
    
    const actual = memory.reduce((acc, item) => acc + item.id, '')
    const expected = '12'
    
    deepStrictEqual(actual, expected)
  })

  it('get() 获取指定类型数据', function () {
    const memory = new MemorySimple<Item, string>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)

    const actual = [
      memory.get('a')?.id,
      memory.get('b')?.id,
      memory.get('c')
    ]
    
    const expected = [
      '1',
      '2',
      null
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('includes() 判断是否包含指定类型', function () {
    const memory = new MemorySimple<Item, string>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
    ]
    
    memory.push(...items)

    const actual = [
      memory.includes('a'),
      memory.includes('b'),
      memory.includes('c')
    ]
    
    const expected = [
      true,
      true,
      false
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('delete() 删除指定存储数据', function () {
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' },
      { id: '3', label: '3', type: 'c' }
    ]
    
    memory.push(...items)
    memory.delete(items[0]) // 删除id为'1'的项
    memory.delete(items[2]) // 删除id为'3'的项
    
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

  it('deleteType() 删除指定类型存储数据', function () {
    const memory = new MemorySimple<Item, string>('type')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' },
      { id: '3', label: '3', type: 'b' },
      { id: '4', label: '4', type: 'c' }
    ]
    
    memory.push(...items)
    memory.deleteType('b')
    
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
    const memory = new MemorySimple<Item, string>('id')
    
    const items: Item[] = [
      { id: '1', label: '1', type: 'a' },
      { id: '2', label: '2', type: 'b' }
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