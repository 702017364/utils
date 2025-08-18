import { isCalc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('isCalc()', () => { 
  const effec = (actual: boolean, expected: boolean[]) => { 
    deepStrictEqual(expected.map(() => actual), expected)
  }

  it('true', () => { 
    effec(true, [
      isCalc('calc(0)'),
      isCalc('calc(10px)'),
      isCalc('calc(10px + 2em)'),
      isCalc('calc(max(10px, 2em))'),
    ])
  })

  it('false', () => { 
    effec(false, [
      // @ts-ignore
      isCalc('abc'),
      isCalc('min(5px, 1em)'),
    ])
  })

})