import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.divide()', () => {
  it('default', () => {
    const actual = [
      calc.divide(10, 2),
      calc.divide('10px', 2),
      calc.divide('calc(10px + 4em)', 2),
    ]

    deepStrictEqual(actual, [
      '5px',
      '5px',
      'calc((10px + 4em) / 2)',
    ])
  })

  // 新增测试用例以提高测试覆盖率
  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 数字与数字相除
      calc.divide(0, 5),
      calc.divide(10, 1),
      calc.divide(-6, 3),
      calc.divide(-6, -3),
      calc.divide(7.5, 2.5),
      
      // 字符串与数字相除
      calc.divide('0px', 5),
      calc.divide('10px', 1),
      calc.divide('-6em', 3),
      calc.divide('-6pt', -3),
      calc.divide('7.5rem', 2.5),
      
      // 复杂表达式
      calc.divide('calc(4px + 6em)', 2),
      calc.divide('min(4px, 6em)', 2),
      calc.divide('max(4px, 6em)', 2),
      calc.divide('clamp(2px, 4em, 6rem)', 2),
      calc.divide('calc(min(4px, 6em) + max(4pt, 6em))', 2),
    ]

    deepStrictEqual(actual, [
      0,
      '10px',
      '-2px',
      '2px',
      '3px',
      
      0,
      '10px',
      '-2em',
      '2pt',
      '3rem',
      
      'calc((4px + 6em) / 2)',
      'calc(min(4px, 6em) / 2)',
      'calc(max(4px, 6em) / 2)',
      'calc(clamp(2px, 4em, 6rem) / 2)',
      'calc((min(4px, 6em) + max(4pt, 6em)) / 2)',
    ])
  })

  it('处理特殊值', () => {
    const actual = [
      // 零值处理
      calc.divide(0, 1),
      
      // 负数处理
      calc.divide(-25, -5),
      
      // 小数处理
      calc.divide(9.42, 3.14),
      
      // 大数处理
      calc.divide(2e6, 1e6),

      // 带变量处理
      calc.divide('var(--a)', 2),
      calc.divide('var(--a, 10px)', 2),
    ]

    deepStrictEqual(actual, [
      0,
      
      '5px',
      
      '3px',
    
      '2px',

      'calc(var(--a) / 2)',
      'calc(var(--a, 10px) / 2)',
    ])
  })
})