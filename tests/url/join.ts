import { joinURLs } from '@vope/utils'
import { strictEqual } from 'assert'

describe('joinURLs()', () => { 
  it('Empty params', () => { 
    strictEqual('', joinURLs())
  })

  it('Only one params', () => { 
    const params = 'abc'
    strictEqual(params, joinURLs(params))
  })

  it('Two params', function () { 
    strictEqual('abc/e', joinURLs('abc', 'e'))
  })

  it('Multiple params', function () { 
    strictEqual('abc/e/f', joinURLs('abc', 'e', 'f'))
  })

  it('With /', function () { 
    strictEqual('abc/e/f/', joinURLs('abc/', 'e/', 'f/'))
  })
  
  it('With http://', function () { 
    strictEqual('http://abc/e/f/', joinURLs('http://abc', 'e/', 'f/'))
  })
})