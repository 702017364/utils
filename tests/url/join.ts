import { joinPaths } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('joinPaths()', () => { 
  it('路径拼接', () => { 
    const inputs = [
      [],
      ['abc'],
      ['abc', 'e'],
      ['abc', 'e', 'f'],
      ['/abc/', '/a', '/b/', 'c'],
      ['http://abc', 'e/', 'f/'],
      ['https://example.com', 'api', 'v1/'],
      ['path1/', '/path2', '//path3'],
      ['a', 'b', 'c', 'd', 'e'],
      ['single']
    ]
    
    const expected = [
      '',
      'abc',
      'abc/e',
      'abc/e/f',
      '/abc/a/b/c',
      'http://abc/e/f/',
      'https://example.com/api/v1/',
      'path1/path2/path3',
      'a/b/c/d/e',
      'single'
    ]
    
    const actual = inputs.map(args => joinPaths(...args))
    
    deepStrictEqual(actual, expected)
  })
})