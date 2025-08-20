import { hash8json } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8json()', () => { 
  interface Item { 
    key: keyof any
    value: number
  }

  it('default', () => {
    const uuid = Symbol()

    deepStrictEqual(
      hash8json<'key', Item>([
        { key: 'a', value: 1 },
        { key: uuid, value: 2 },
        { key: 1, value: 3 },
        { key: '1', value: 4 },
      ], 'key'),
      {
        a: { key: 'a', value: 1 },
        [uuid]: { key: uuid, value: 2 },
        1: { key: '1', value: 4 },
      }
    )
  })
})