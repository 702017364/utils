import { Equal, Expect } from '@type-challenges/utils'
import { cubeURLParams } from '@vope/utils'
import { deepStrictEqual } from 'assert'
import { F, G, serializes } from './options'

describe('cubeURLParams()', function () { 
  it('default', function () { 
    const cube = cubeURLParams('a=true&b=5.3&c=2017-10-10T10:10:10.102z&d=100&e=^test$&f=a12&g=23true&h=45false&i=1', serializes)

    type Cube = typeof cube

    type cases = [
      Expect<Equal<Cube, {
        a: boolean
        b: number
        c: Date
        d: bigint
        e: RegExp
        f: F
        g: G
        h: G
        i: 1
      }>>,
    ]

    deepStrictEqual(cube, {
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
    })
  })
})