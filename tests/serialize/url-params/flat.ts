import { URLParamsFlats, flatURLParams } from '@vope/utils'
import { serializes } from './options'
import { strictEqual } from 'assert'

describe('flatURLParams()', function () { 
  it('default', function () { 
    const data = {
      a: true,
      b: 1,
      c: new Date('2018-05-05T01:01:01.112Z'),
      d: 10n,
      e: /te&+s t/,
      f: {
        a: 'a|',
        b: 1,
        toString() { 
          return this.a + this.b
        },
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
    } satisfies URLParamsFlats<typeof serializes>

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
          list.push([key, 'a%7C1'])
          break
        case 'g':
          list.push([key, '%5Bobject+Object%5D'])
          break
        case 'h':
          list.push([key, '34false'])
          break
        case 'i':
          list.push([key, '1'])
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