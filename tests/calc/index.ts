import { type Calc, calc } from '@vope/utils'
import { deepEqual, deepStrictEqual } from 'assert'

describe('calc()', () => {
  const patch = (actuals: Calc.Value[], expected: Calc.Value) => { 
    deepStrictEqual(actuals, actuals.map(() => expected))
  }

  it('运算结果等于0', () => {
    patch([
      calc(),
      calc(0),
      calc(0, 0),
      calc(3, -3),
      calc('5px', -5),
      calc('-5px', 5),
      calc('2px', '-3em', '-2px', '3em'),
      calc('calc(100%)', '-50%', 'calc(-50%)'),
      calc('calc(-100%)', '40%', 'calc(60%)'),
      calc('0px', '0em', '0pt', '5pt', calc.multiply('5pt', -1)),
    ], 0)
  })

  it('复杂运算', () => { 
    const value = calc('4px', '5pt', 'min(10px, 1em)', 'max(1rem, 16px)', 'clamp(20px, 1vw, 2em)', 'calc(10px + 5pt)', 6, '-5pt', '-90%', 'calc(50%)')
    deepEqual(value, 'calc(10px + min(10px, 1em) + max(1rem, 16px) + clamp(20px, 1vw, 2em) + (10px + 5pt) - 40%)')
  })

  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 基本数值计算
      calc(10),
      calc(-5),
      calc(3.14),
      
      // 字符串值计算
      calc('10px'),
      calc('-5em'),
      calc('3.14rem'),
      
      // 复杂表达式
      calc('calc(10px + 5em)'),
      calc('min(10px, 5em)'),
      calc('max(10px, 5em)'),
      calc('clamp(5px, 10px, 15px)'),
      
      // 混合计算
      calc(10, '-5px'),
      calc('10px', -5),
      calc('calc(10px)', '5em'),
      
      // 多个参数
      calc(1, 2, 3, 4, 5),
      calc('1px', '2em', '3rem', '4pt'),
      
      // 包含零值的计算
      calc(0, '0px', 0),
      
      // 负数计算
      calc(-1, -2, -3),
      calc('-1px', '-2em', '-3rem'),
      
      // 小数计算
      calc(1.5, 2.7, -3.14),
      calc('1.5px', '2.7em', '-3.14rem'),
      
      // 边界情况：科学计数法
      calc(1e6, -2e6),
      calc('1e6px', '-2e6px'),
    ]

    deepStrictEqual(actual, [
      '10px',
      '-5px',
      '3.14px',
      
      '10px',
      '-5em',
      '3.14rem',
      
      'calc(10px + 5em)',
      'min(10px, 5em)',
      'max(10px, 5em)',
      'clamp(5px, 10px, 15px)',
      
      '5px',
      '5px',
      'calc(10px + 5em)',
      
      '15px',
      'calc(1px + 2em + 3rem + 4pt)',
      
      0,
      
      '-6px',
      'calc(-1px - 2em - 3rem)',
      
      '1.06px',
      'calc(1.5px + 2.7em - 3.14rem)',
      
      '-1000000px',
      '-1000000px',
    ])
  })
})