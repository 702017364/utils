import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.clamp()', () => { 
  it('default', () => { 
    const actual = [
      calc.clamp(5, {}),
      calc.clamp(5, { min: '2em' }),
      calc.clamp(50, { max: '10%' }),
      calc.clamp('10em', { min: 100, max: '50%' }),
    ]

    deepStrictEqual(actual, [
      '5px',
      'min(2em, 5px)',
      'max(10%, 50px)',
      'clamp(100px, 10em, 50%)',
    ])
  })
})