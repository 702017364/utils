import { isClass } from '@vope/utils'
import { strictEqual } from 'assert'

describe('isClass()', () => { 
  it('class { } is true', () => { 
    strictEqual(true, isClass(class { }))
  })

  it('function() {} is false', () => { 
    strictEqual(false, isClass(function () { }))
  })

  it('() => {} is false', () => { 
    strictEqual(false, isClass(() => {}))
  })
})