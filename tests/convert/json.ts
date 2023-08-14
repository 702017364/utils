import { hash8json } from '@vope/utils'
import { strictEqual } from 'assert'

describe('hash8json()', () => { 
  interface Item { 
    key: string
    value: number
  }

  it('...', () => {
    const list = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ] as Item[]
    strictEqual(list[1], hash8json(list, 'key').b)
  })
})