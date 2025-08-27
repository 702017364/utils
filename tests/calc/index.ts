import { type Calc, calc } from '@vope/utils'
import { deepEqual, deepStrictEqual } from 'assert'

describe('calc()', () => {
  const patch = (actuals: Calc.Value[], expected: Calc.Value) => { 
    deepStrictEqual(actuals, actuals.map(() => expected))
  }

  it('= 0', () => {
    patch([
      calc(),
      calc(0),
      calc(3, -3),
      calc('5px', -5),
      calc('-5px', 5),
      calc('2px', '-3em', '-2px', '3em'),
      calc('calc(100%)', '-50%', 'calc(-50%)'),
      calc('calc(-100%)', '40%', 'calc(60%)'),
    ], 0)
  })

  it('复杂运算', () => { 
    const value = calc('4px', '5pt', 'min(10px, 1em)', 'max(1rem, 16px)', 'clamp(20px, 1vw, 2em)', 'calc(10px + 5pt)', 6, '-5pt', '-90%', 'calc(50%)')
    deepEqual(value, 'calc(10px + min(10px, 1em) + max(1rem, 16px) + clamp(20px, 1vw, 2em) + (10px + 5pt) - 40%)')
  })
})