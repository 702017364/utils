import { URLParamsValues, connectURLParams } from '@vope/utils'
import { strictEqual } from 'assert'

describe('connectURLParams()', function () { 
  const url = 'http://abc'

  it('Empty params', function () { 
    strictEqual(url, connectURLParams(url, {}))
  })

  it('Multiple params', function () { 
    strictEqual(url + '?a=a&b=2&c=false&d&e=a,,2,false', connectURLParams(url, {
      a: 'a',
      b: 2,
      c: false,
      d: undefined,
      e: ['a', , 2, false]
    }))
  })

  it('Existing params', function () { 
    const url = 'http://abc?d=1'
    strictEqual(url + '&a=a', connectURLParams(url, {
      a: 'a'
    }))
  })

  it('Open type', function () { 
    const url = 'http://abc?d=1'
    strictEqual(url + '&a="2"&b=2&e="1",null,1,true', connectURLParams(url, {
      a: '2',
      b: 2,
      e: ['1', undefined, 1, true]
    }, true))
  })

  it('serializes', () => { 
    interface C { 
      a: number
      b: string
    }

    const url = 'http://abc'
    strictEqual(url + '?a=true&b=1&c=10%2C10', connectURLParams(url, {
      a: true,
      b: 1,
      c: {
        a: 10,
        b: '10',
      },
    }, {
      a: Boolean,
      b: Number,
      c: {
        cube(text: string): C { 
          const [a, b] = text.split(',')
          return {
            a: +a,
            b,
          }
        },
        flat(data: C) { 
          return data.a + ',' + data.b
        }
      },
    } satisfies URLParamsValues))
  })
})