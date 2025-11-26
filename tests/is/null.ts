import { isNull } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('isNull()', () => {
  it('检测无值情况', () => {
    const actual = [
      // null值
      isNull(null),
      
      // undefined值
      isNull(undefined),
      
      // 空字符串
      isNull(""),
      
      // 数字
      isNull(0),
      isNull(-0),
      isNull(NaN),
      
      // 布尔值
      isNull(false),
      isNull(true),
      
      // 对象和数组
      isNull({}),
      isNull([]),
      
      // 其他值
      isNull("null"),
      isNull("undefined"),
      isNull("0")
    ]

    const expected = [
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
      false
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理各种边界情况', () => {
    const actual = [
      // 显式赋值为undefined
      isNull(void 0),
      
      // 通过函数返回的undefined
      isNull((function() { return undefined })()),
      
      // 空参数
      isNull((function(a) { return a })(undefined)),
      
      // 声明但未赋值的变量
      isNull((function() { let a; return a })()),
      
      // 特殊对象
      isNull(Object.create(null)),
      
      // 空白字符
      isNull(" "),
      
      // 空数组
      isNull([null][0])
    ]

    const expected = [
      true,
      true,
      true,
      true,
      false,
      false,
      true
    ]

    deepStrictEqual(actual, expected)
  })
})