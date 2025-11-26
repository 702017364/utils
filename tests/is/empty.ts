import { isEmpty } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('isEmpty()', () => {
  it('检测空值', () => {
    const actual = [
      // 空字符串
      isEmpty(""),
      
      // null值
      isEmpty(null),
      
      // undefined值
      isEmpty(undefined),
      
      // 非空字符串
      isEmpty(" "),
      isEmpty("test"),
      
      // 数字
      isEmpty(0),
      isEmpty(-1),
      isEmpty(1),
      
      // 布尔值
      isEmpty(false),
      isEmpty(true),
      
      // 对象和数组
      isEmpty({}),
      isEmpty([]),
      
      // 其他值
      isEmpty("0"),
      isEmpty("null"),
      isEmpty("undefined")
    ]

    const expected = [
      true,
      true,
      true,
      
      false,
      false,
      
      false,
      false,
      false,
      
      false,
      false,
      
      false,
      false,
      
      false,
      false,
      false
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理各种边界情况', () => {
    const actual = [
      // 不同的空字符串形式
      isEmpty(''),
      
      // 特殊字符
      isEmpty('\0'),
      
      // 空格字符
      isEmpty(' '),
      
      // 制表符和换行符
      isEmpty('\t'),
      isEmpty('\n'),
      
      // 多个空白字符
      isEmpty('   ')
    ]

    const expected = [
      true,
      
      false,
      
      false,
      
      false,
      false,
      
      false
    ]

    deepStrictEqual(actual, expected)
  })
})