import { MemoryList } from '@vope/utils'
import { strictEqual } from 'assert'

describe('class MemoryList', function () { 
  type Type = 1 | 2 | 3 | 4

  interface Item { 
    id: string
    label: string
    type: Type
  }

  const memory = new MemoryList<Item, Type>('type')

  const logMemorys = () => {
    const list: string[] = []
    memory.forEach((data) => list.push(data.id))
    return list.join(',')
  }

  const logMemory = (memory: Item[] | null) => { 
    if (!memory) return null
    const list: string[] = []
    memory.forEach((data) => list.push(data.id))
    return list.join(',')
  }

  const first: Item = {
    id: '1',
    label: '1',
    type: 1
  }

  it('push()', function () {
    memory
      .push(first)
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
      .push(
        {
          id: '4',
          label: '4',
          type: 4
        },
      )
    
    strictEqual(4, memory.size)
  })

  it('forType()', function () { 
    const list: string[] = []
    memory.forType((data) => { 
      data.forEach(({ id }) => list.push(id))
    })
    strictEqual('1,2,3,4', list.join(','))
  })

  it('get(): null', function () { 
    strictEqual(null, memory.get(3))
  })

  it('get()', function () { 
    strictEqual('2,3', logMemory(memory.get(2)))
  })

  it('delete()', function () { 
    memory.delete(first)
    strictEqual('2,3,4', logMemorys())
  })

  it('deleteType()', function () { 
    memory.deleteType(2)
    strictEqual('4', logMemorys())
  })
})