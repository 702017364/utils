import { hash8strings } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8strings()', () => { 
  it('default', () => { 
    const uuid = Symbol()

    deepStrictEqual(
      hash8strings([
        'a',
        1,
        uuid,
        'a',
      ]),
      {
        a: 3,
        1: 1,
        [uuid]: 2,
      }
    )
  })
})