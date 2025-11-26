import { parseNum } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('parseNum()', function () {
  it('解析基本数值类型', () => {
    const actual = [
      // 数字类型
      parseNum(6),
      parseNum(0),
      parseNum(-5),
      
      // BigInt 类型
      parseNum(10n),
      parseNum(0n),
      parseNum(-20n),
      
      // 字符串数字
      parseNum('6'),
      parseNum('-6'),
      parseNum('0'),
      
      // 带小数点的数字
      parseNum('-6.2'),
      parseNum('3.14'),
      parseNum('0.0'),
      
      // 科学计数法
      parseNum('6e2'),
      parseNum('6E2'),
      parseNum('6.2e2'),
      parseNum('-6.2e2'),
      parseNum('1e-3'),
      parseNum('2E+5')
    ]

    const expected = [
      6,
      0,
      -5,
      
      10n,
      0n,
      -20n,
      
      6,
      -6,
      0,
      
      -6.2,
      3.14,
      0,
      
      600,
      600,
      620,
      -620,
      0.001,
      200000
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理边界情况和特殊值', () => {
    const actual = [
      // NaN 值
      parseNum(Number.NaN),
      
      // BigInt 后缀
      parseNum('6n'),
      parseNum('-10n'),
      
      // 最大安全整数
      parseNum(`${Number.MAX_SAFE_INTEGER - 1}`),
      parseNum(`${Number.MAX_SAFE_INTEGER}`),
      parseNum(`${Number.MIN_SAFE_INTEGER + 1}`),
      parseNum(`${Number.MIN_SAFE_INTEGER}`),
      
      // 超出安全范围的数字
      parseNum('19007199254740991'),
      parseNum('-19007199254740991'),
      
      // 带小数的超大数字
      parseNum('12345690071992547409.91'),
      parseNum('12345690071992547409.91e-2'),
      parseNum('12345690071992547409.91e+2'),
      
      // 无效格式
      parseNum(''),
      parseNum('abc'),
      parseNum('123abc'),
      parseNum('12.34.56'),
      parseNum('12e'),
      parseNum('e10')
    ]

    const expected = [
      Number.NaN,
      
      6n,
      -10n,
      
      Number.MAX_SAFE_INTEGER - 1,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER + 1,
      Number.MIN_SAFE_INTEGER,
      
      19007199254740991n,
      -19007199254740991n,
      
      12345690071992547409n,
      123456900719925474n,
      1234569007199254740991n,
      
      Number.NaN,
      Number.NaN,
      Number.NaN,
      Number.NaN,
      Number.NaN,
      Number.NaN
    ]

    // 对于 NaN 值需要特殊处理，因为 NaN !== NaN
    actual.forEach((value, index) => {
      if (Number.isNaN(expected[index])) {
        // 检查结果是否为 NaN
        if (!Number.isNaN(value)) {
          throw new Error(`Expected NaN but got ${value} at index ${index}`)
        }
      } else {
        // 检查其他值是否相等
        if (value !== expected[index]) {
          throw new Error(`Expected ${expected[index]} but got ${value} at index ${index}`)
        }
      }
    })
  })

  it('处理复杂科学计数法和边界情况', () => {
    const actual = [
      // 复杂科学计数法
      parseNum('190071992547409.91e-2'),
      parseNum('190071992547409.91e2'),
      parseNum('12345690071992547409.912e+2'),
      parseNum('12345690071992547409.91e+3'),
      parseNum('12345690071992547409.91234567891011121314e+15'),
      parseNum('12345690071992547409.91234567891011121314e+16'),
      parseNum('12345690071992547409.91234567891011121314e+18')
    ]

    const expected = [
      1900719925474.0991,
      19007199254740991n,
      1234569007199254740991n,
      12345690071992547409910n,
      12345690071992547409912345678910111n,
      123456900719925474099123456789101112n,
      12345690071992547409912345678910111213n
    ]

    deepStrictEqual(actual, expected)
  })
})