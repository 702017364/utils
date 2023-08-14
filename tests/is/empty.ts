import { isEmpty } from '@vope/utils'
import { strictEqual } from 'assert'

describe('isEmpty()', () => { 
  it('"" is true', () => { 
    strictEqual(true, isEmpty(""))
  })

  it('null is true', () => { 
    strictEqual(true, isEmpty(null))
  })

  it('undefined is true', () => { 
    strictEqual(true, isEmpty(undefined))
  })

  it('0 is false', () => { 
    strictEqual(false, isEmpty(0))
  })
})