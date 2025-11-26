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

  // 添加更多测试用例以提高测试覆盖率
  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 有效的 calc 表达式
      isCalc('calc(100%)'),
      isCalc('calc(10px + 20px)'),
      isCalc('calc(10px - 5em)'),
      isCalc('calc(10px * 2)'),
      isCalc('calc(10px / 2)'),
      isCalc('calc(((10px + 5em) * 2) / 3)'),
      isCalc('calc(min(10px, 20px) + max(5em, 10em))'),
      
      // 无效的表达式
      isCalc('cal(10px)'),
      isCalc('calculate(10px)'),
      isCalc('10px'),
      isCalc('min(10px, 20px)'),
      isCalc('max(10px, 20px)'),
      isCalc('clamp(10px, 20px, 30px)'),
    ]

    deepStrictEqual(actual, [
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      
      false,
      false,
      false,
      false,
      false,
      false,
    ])
  })
})