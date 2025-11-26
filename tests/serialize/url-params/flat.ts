import { flatURLParams } from '@vope/utils'
import { deepStrictEqual } from 'assert'
import { type IParams, serializes } from './options'

describe('flatURLParams()', function () { 
  it('将对象序列化为URL参数', function () { 
    const testData: IParams[] = [
      {
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
      },
      {
        a: false,
        b: 5.5,
        c: new Date('2020-12-31T23:59:59.999Z'),
        d: 100n,
        e: /^test$/,
        f: {
          a: 'hello world',
          b: 42,
        },
        g: {
          b: false,
          c: 99,
        },
        h: {
          b: true,
          c: 1,
        },
        i: 1,
        j: null,
      }
    ]

    const expected = [
      'a=true&b=1&c=2018-05-05T01%3A01%3A01.112Z&d=10&e=te%26%252Bs+t&f=%7B%22a%22%3A%22a%7C%22%2C%22b%22%3A1%7D&g=12true&h=34false&i=1&j=null',
      'a=false&b=5.5&c=2020-12-31T23%3A59%3A59.999Z&d=100&e=%5Etest%24&f=%7B%22a%22%3A%22hello+world%22%2C%22b%22%3A42%7D&g=99false&h=1true&i=1&j=null'
    ]

    const actual = testData.map(data => flatURLParams(data, serializes))

    deepStrictEqual(actual, expected)
  })
})