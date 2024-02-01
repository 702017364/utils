import { isKey } from '@vope/utils'
import { strictEqual } from 'assert'

describe('isKey()', () => { 
  const data = new class Test { 
    a = 1
    b = 2
  }

  it('for in', () => { 
    let total = 0
    for (const key in data) { 
      if (isKey(key, data)) { 
        total += data[key]
      }
    }
    strictEqual(3, total)
  })
})