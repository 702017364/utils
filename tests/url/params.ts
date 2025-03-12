import { connectURLParams } from '@vope/utils'
import { strictEqual } from 'assert'

describe('connectURLParams()', function () {
  const url = 'http://abc'

  it('Empty parameters', function () {
    strictEqual(url, connectURLParams(url, {}, {}))
  })

  it('Not serializes', function () { 
    strictEqual(url + '?a=a&a1=null&a2=&a3=undefined&b=2&c=2&d=false&e1=%5Bobject+Object%5D&e2=e2', connectURLParams(url, {
      a: 'a',
      a1: null,
      a2: '',
      a3: undefined,
      b: 2,
      c: '2',
      d: false,
      e1: {},
      e2: {
        toString() { 
          return 'e2'
        },
      },
    }))
  })

  it('There are parameters', function () {
    interface T1 {
      a: string
      b: number
      c: boolean
      d: undefined
      e: (string | number | boolean | undefined)[]
    }

    strictEqual(url + '?a=a&b=2&c=false&d=&e=a%2C%2C2%2Cfalse', connectURLParams<T1>(url, {
      a: 'a',
      b: 2,
      c: false,
      d: undefined,
      e: ['a', , 2, false]
    }, {
      a: 'string',
      b: 'number',
      c: 'boolean',
      d: {
        flat(value) {
          return ''
        },
        cube(text) {
          return undefined
        },
      },
      e: {
        flat(value) {
          return value.join(',')
        },
        cube(text) {
          const list = text.split(',')
          return [list[0], , +list[2], list[3] === 'true']
        },
      },
    }))
  })

  it('Already carried parameters', () => {
    interface C {
      a: number
      b: string
    }

    interface T2 {
      a: boolean
      b: number
      c: C
    }

    const url = 'http://abc?d=1'
    strictEqual(url + '&a=true&b=1&c=10%2C10', connectURLParams<T2>(url, {
      a: true,
      b: 1,
      c: {
        a: 10,
        b: '10',
      },
    }, {
      a: 'boolean',
      b: 'number',
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
    }))
  })
})