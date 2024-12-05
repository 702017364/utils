import { MemorySimple } from '@vope/utils'
import { strictEqual } from 'assert'

interface Item {
  id: string
}

describe('class MemorySimple', function () { 
  const simple = new MemorySimple<Item, string>('id')
  simple.push(
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '3' },
  )

  it('at()', function () { 
    strictEqual(true, simple.at(0)?.id === '1' && simple.at(-1)?.id === '4' && simple.at(2 ^ 9) === void 0)
  })

  it('forEach()', function () { 
    const list: string[] = []
    simple.forEach((data) => list.push(data.id))
    strictEqual('1234', list.join(''))
  })

  it('get() value', function () { 
    strictEqual('3', simple.get('3')!.id)
  })

  it('get() null', function () { 
    strictEqual(null, simple.get(''))
  })

  it('map()', function () { 
    const list = simple.map((data) => data.id)
    strictEqual('1234', list.join(''))
  })

  it('some() => true', function () { 
    const value = simple.some((data) => data.id === '2')
    strictEqual(true, value)
  })

  it('some() => false', function () { 
    const value = simple.some((data) => data.id === '200')
    strictEqual(false, value)
  })

  it('reduce()', function () { 
    const value = simple.reduce((caches, data) => { 
      return caches + data.id
    }, '')
    strictEqual('1234', value)
  })
})