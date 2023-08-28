import { once } from '@vope/utils'
import { strictEqual } from 'assert'

describe('once()', function () { 
  it('Multiple call', function () { 
    let count = 1
    const a = {
      get: () => count++
    }
    const callback = once(a.get)
    callback()
    callback()
    const result = callback()
    strictEqual(1, result)
  })
})