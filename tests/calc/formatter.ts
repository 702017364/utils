import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.formatter()', () => { 
  it('default', () => { 
    deepStrictEqual([0, '5px', '5px'], [
      calc.formatter(0),
      calc.formatter(5),
      calc.formatter('5px'),
    ])
  })
})