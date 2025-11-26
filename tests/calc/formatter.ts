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

  // 新增测试用例以提高测试覆盖率
  it('处理各种输入类型', () => {
    const actual = [
      // 处理数字
      calc.formatter(0),
      calc.formatter(10),
      calc.formatter(-5),
      calc.formatter(3.14),
      
      // 处理字符串
      calc.formatter('10px'),
      calc.formatter('2em'),
      calc.formatter('50%'),
      
      // 处理已带有单位的数值
      calc.formatter('0px'),
      calc.formatter('0em'),
      calc.formatter('0%'),

      // 处理方法
      calc.formatter('calc(0px)'),
      calc.formatter('calc(5px)'),
      calc.formatter('calc(-5px)'),
      calc.formatter('calc(-5px + 2em)'),
      calc.formatter('min(-5px + 2em)'),
    ]

    deepStrictEqual(actual, [
      0,
      '10px',
      '-5px',
      '3.14px',

      '10px',
      '2em',
      '50%',

      0,
      0,
      0,

      0,
      '5px',
      '-5px',
      'calc(-5px + 2em)',
      'min(-5px + 2em)',
    ])
  })
})