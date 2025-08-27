import { flatURLParams } from '@vope/utils'
import { strictEqual } from 'assert'
import { type IParams, serializes } from './options'

describe('flatURLParams()', function () { 
  it('default', function () { 
    const data: IParams = {
      a: true,
      b: 1,
      c: new Date('2018-05-05T01:01:01.112Z'),
      d: 10n,
      e: /te&+s t/,
      f: {
        a: 'a|',
        b: 1,
      },
      g: {
        b: true,
        c: 12,
      },
      h: {
        b: false,
        c: 34,
      },
      i: 1,
      j: null,
    }

    const actual = flatURLParams(data, serializes)
    const list: [string, string][] = []

    for (const key in data) { 
      switch (key) { 
        case 'a':
          list.push([key, 'true'])
          break
        case 'b':
          list.push([key, '1'])
          break
        case 'c':
          list.push([key, '2018-05-05T01%3A01%3A01.112Z'])
          break
        case 'd':
          list.push([key, '10'])
          break
        case 'e':
          list.push([key, 'te%26%252Bs+t'])
          break
        case 'f':
          list.push([key, '%7B%22a%22%3A%22a%7C%22%2C%22b%22%3A1%7D'])
          break
        case 'g':
          list.push([key, '12true'])
          break
        case 'h':
          list.push([key, '34false'])
          break
        case 'i':
          list.push([key, '1'])
          break
        case 'j':
          list.push([key, 'null'])
          break
      }
    }

    strictEqual(actual, list.reduce((caches, [key, value]) => { 
      return caches
        ? caches + '&' + key + '=' + value
        : key + '=' + value
    }, ''))
  })
})