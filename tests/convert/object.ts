import { hash8object } from '@vope/utils'
import { strictEqual } from 'assert'

describe('hash8object()', () => { 
  interface Item<K extends unknown = unknown> { 
    key: K
    value: number
  }

  it('...', () => { 
    const list = [
      { key: String, value: 1 },
      { key: Object, value: 2 }
    ] as Item<object>[]
    strictEqual(list[1], hash8object(list, 'key').get(Object))
  })
})