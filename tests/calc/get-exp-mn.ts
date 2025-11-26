import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.getExpMN()', () => {
  it('默认情况', () => {
    const actual = [
      calc.getExpMN('5px'),
      calc.getExpMN('calc(5px + 2em)'),
      calc.getExpMN('min(10px, 2em)'),
      calc.getExpMN('max(1rem, 16px)'),
      calc.getExpMN('clamp(20px, 1vw, 2em)'),
    ]

    deepStrictEqual(actual, [
      null,
      'calc',
      'min',
      'max',
      'clamp',
    ])
  })

  // 添加更多测试用例以提高测试覆盖率
  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 嵌套表达式
      calc.getExpMN('calc(min(10px, 2em) + max(5pt, 1rem))'),
      calc.getExpMN('calc(clamp(10px, 1em, 2rem) * 2)'),
      
      // 多层嵌套
      calc.getExpMN('calc(min(max(10px, 2em), clamp(5pt, 1rem, 3vw)) + 5px)'),
      calc.getExpMN('max(min(max(10px, 2em), clamp(5pt, 1rem, 3vw)) + 5px, 10vw)'),
    ]

    deepStrictEqual(actual, [
      'calc',
      'calc',
      
      'calc',
      'max',
    ])
  })
})