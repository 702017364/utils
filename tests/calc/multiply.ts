import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.multiply()', () => {
  it('default', () => {
    const actual = [
      calc.multiply(5, 2),
      calc.multiply('5px', 2),
      calc.multiply('calc(5px + 2em)', 2),
    ]

    deepStrictEqual(actual, [
      '10px',
      '10px',
      'calc((5px + 2em) * 2)',
    ])
  })

  // 新增测试用例以提高测试覆盖率
  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 数字与数字相乘
      calc.multiply(0, 5),
      calc.multiply(3, 0),
      calc.multiply(-2, 3),
      calc.multiply(-2, -3),
      calc.multiply(1.5, 2.5),
      
      // 字符串与数字相乘
      calc.multiply('0px', 5),
      calc.multiply('3px', 0),
      calc.multiply('-2em', 3),
      calc.multiply('-2pt', -3),
      calc.multiply('1.5rem', 2.5),
      
      // 复杂表达式
      calc.multiply('calc(2px + 3em)', 2),
      calc.multiply('min(2px, 3em)', 2),
      calc.multiply('max(2px, 3em)', 2),
      calc.multiply('clamp(1px, 2em, 3rem)', 2),
      calc.multiply('calc(min(2px, 3em) + max(2pt, 3em))', 2),
    ]

    deepStrictEqual(actual, [
      0,
      0,
      '-6px',
      '6px',
      '3.75px',
      
      0,
      0,
      '-6em',
      '6pt',
      '3.75rem',
      
      'calc((2px + 3em) * 2)',
      'calc(min(2px, 3em) * 2)',
      'calc(max(2px, 3em) * 2)',
      'calc(clamp(1px, 2em, 3rem) * 2)',
      'calc((min(2px, 3em) + max(2pt, 3em)) * 2)',
    ])
  })

  it('处理特殊值', () => {
    const actual = [
      // 零值处理
      calc.multiply(0, 0),
      
      // 负数处理
      calc.multiply(-5, -5),
      
      // 小数处理
      calc.multiply(3.14, 2.71),
      
      // 大数处理
      calc.multiply(1e6, 2e6),

      // 带变量处理
      calc.multiply('var(--a)', 2),
      calc.multiply('var(--a, 10px)', 2),
    ]

    deepStrictEqual(actual, [
      0,
      
      '25px',
      
      '8.5094px',
    
      '2000000000000px',

      'calc(var(--a) * 2)',
      'calc(var(--a, 10px) * 2)',
    ])
  })
})