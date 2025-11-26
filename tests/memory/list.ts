import { MemoryList } from '@vope/utils'
import { deepStrictEqual } from 'assert'

type Type = 1 | 2 | 3 | 4

interface Item {
  id: string
  label: string
  type: Type
}

describe('class MemoryList', function () {
  const memory = new MemoryList<Item, Type>('type')
  
  const first: Item = {
    id: '1',
    label: '1',
    type: 1
  }

  const last: Item = {
    id: '4',
    label: '4',
    type: 4
  }

  it('push() 添加数据', function () {
    const actual = [
      memory.push(first).size,
      memory
        .push(
          {
            id: '2',
            label: '2',
            type: 2
          },
          {
            id: '3',
            label: '3',
            type: 2
          }
        )
        .push(last).size
    ]
    
    deepStrictEqual(actual, [1, 4])
  })

  it('at() 获取指定索引数据', function () {
    const actual = [
      memory.at(0),
      memory.at(-memory.size),
      memory.at(2 ^ 9)
    ]
    
    const expected = [
      first,
      first,
      undefined
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('forType() 遍历所有分类数据', function () {
    const actual: string[] = []
    memory.forType((data) => {
      data.forEach(({ id }) => actual.push(id))
    })
    
    deepStrictEqual(actual, ['1', '2', '3', '4'])
  })

  it('get() 获取指定类型数据', function () {
    const actual = [
      memory.get(3),
      memory.get(2)?.map(item => item.id)
    ]
    
    const expected = [
      null,
      ['2', '3'],
    ]
    
    deepStrictEqual(actual, expected)
  })

  it('delete() 删除指定数据', function () {
    memory.delete(first)
    memory.delete(last)
    
    const actual: string[] = []
    memory.forEach((data) => actual.push(data.id))
    
    deepStrictEqual(actual, ['2', '3'])
  })

  it('deleteType() 删除指定类型数据', function () {
    memory.deleteType(2)
    
    const actual: string[] = []
    memory.forEach((data) => actual.push(data.id))
    
    deepStrictEqual(actual, [])
  })
})