import { MemorySimple } from '@vope/utils'
import { strictEqual } from 'assert'

interface Item {
  id: string
}

describe('class MemorySimple', function () { 
  const simple = new MemorySimple<Item, string>('id')
  simple.push(
    { id: '1' },
    [
      { id: '2' },
      { id: '3' },
    ],
    { id: '4' },
    { id: '3' },
  )

  it('forEach()', function () { 
    const list: string[] = []
    simple.forEach((data) => list.push(data.id))
    strictEqual('1234', list.join(''))
  })

  it('getter() value', function () { 
    strictEqual('3', simple.get('3')!.id)
  })

  it('getter() null', function () { 
    strictEqual(null, simple.get(''))
  })
})