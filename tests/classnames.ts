import { classnames } from '@vope/utils'
import { strictEqual } from 'assert'

describe('classnames()', function () { 
  it('empty params', function () { 
    strictEqual('', classnames())
  })

  it('string and string', function () { 
    strictEqual('a b', classnames('a', 'b'))
  })

  it('string and array', function () { 
    strictEqual('a b', classnames('a', [null, 'b']))
  })

  it('string and object', function () { 
    strictEqual('a b', classnames('a', {
      b: true,
      c: false
    }))
  })
})