import { classnames } from '@vope/utils'
import { strictEqual } from 'assert'

describe('classnames()', function () { 
  it('Empty params', function () { 
    strictEqual('', classnames())
  })

  it('Width string and string', function () { 
    strictEqual('a b', classnames('a', 'b'))
  })

  it('With string and array', function () { 
    strictEqual('a b', classnames('a', [null, 'b']))
  })

  it('With string and object', function () { 
    strictEqual('a b', classnames('a', {
      b: true,
      c: false
    }))
  })
})