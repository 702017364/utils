import { cubeURLParams } from '@vope/utils'
import { deepStrictEqual } from 'assert'
import { type IParams, serializes } from './options'

describe('cubeURLParams()', function () { 
  it('解析URL参数为对象', function () { 
    const inputs = [
      'a=true&b=5.3&c=2017-10-10T10:10:10.102z&d=100&e=^test$&f=%7B%22a%22%3A%22a%22%2C%22b%22%3A12%7D&g=23true&h=45false&i=1&j=null',
      'a=false&b=10&c=2020-01-01T00:00:00.000z&d=200&e=^example$&f=%7B%22a%22%3A%22b%22%2C%22b%22%3A24%7D&g=46true&h=90false&i=1&j=null',
      'a=true&b=0&c=1999-12-31T23:59:59.999z&d=0&e=^empty$&f=%7B%22a%22%3A%22c%22%2C%22b%22%3A0%7D&g=00false&h=00true&i=1&j=null'
    ]
    
    const expected = [
      {
        a: true,
        b: 5.3,
        c: new Date('2017-10-10T10:10:10.102z'),
        d: 100n,
        e: /^test$/,
        f: {
          a: 'a',
          b: 12,
        },
        g: {
          b: true,
          c: 23,
        },
        h: {
          b: false,
          c: 45,
        },
        i: 1,
        j: null,
      },
      {
        a: false,
        b: 10,
        c: new Date('2020-01-01T00:00:00.000z'),
        d: 200n,
        e: /^example$/,
        f: {
          a: 'b',
          b: 24,
        },
        g: {
          b: true,
          c: 46,
        },
        h: {
          b: false,
          c: 90,
        },
        i: 1,
        j: null,
      },
      {
        a: true,
        b: 0,
        c: new Date('1999-12-31T23:59:59.999z'),
        d: 0n,
        e: /^empty$/,
        f: {
          a: 'c',
          b: 0,
        },
        g: {
          b: false,
          c: 0,
        },
        h: {
          b: true,
          c: 0,
        },
        i: 1,
        j: null,
      }
    ]

    const actual = inputs.map(input => cubeURLParams<IParams, typeof serializes>(input, serializes))

    deepStrictEqual(actual, expected)
  })
})