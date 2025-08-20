import { hash8object } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8object()', () => { 
  interface Item { 
    key: Object
    value: number
  }

  it('default', () => { 
    const uuid = Symbol()

    deepStrictEqual(
      hash8object<'key', Item>([
        { key: String, value: 1 },
        { key: Object, value: 2 },
        { key: 1, value: 3 },
        { key: uuid, value: 4 },
        { key: String, value: 5 },
      ], 'key'),
      new Map<any, Item>([
        [String, { key: String, value: 5 }],
        [Object, { key: Object, value: 2 }],
        [1, { key: 1, value: 3 }],
        [uuid, { key: uuid, value: 4 }],
      ])
    )
  })
})