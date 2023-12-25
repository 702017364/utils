import { joinPaths } from '@vope/utils'
import { strictEqual } from 'assert'

describe('joinPaths()', () => { 
  it('Empty params', () => { 
    strictEqual('', joinPaths())
  })

  it('Only one params', () => { 
    strictEqual('abc', joinPaths('abc'))
  })

  it('Two params', function () { 
    strictEqual('abc/e', joinPaths('abc', 'e'))
  })

  it('Multiple params', function () { 
    strictEqual('abc/e/f', joinPaths('abc', 'e', 'f'))
  })

  it('With /', function () { 
    strictEqual('/abc/a/b/c', joinPaths('/abc/', '/a', '/b/', 'c'))
  })
  
  it('With http://', function () { 
    strictEqual('http://abc/e/f/', joinPaths('http://abc', 'e/', 'f/'))
  })
})