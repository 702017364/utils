import { clamp } from '@vope/utils'
import { strictEqual } from 'assert'

describe('clamp()', function () { 
  it('将值限制在指定范围内', function () { 
    strictEqual(clamp(0, -1, 1), 0)
    strictEqual(clamp(-2, -1, 1), -1)
    strictEqual(clamp(2, -1, 1), 1)
  })

  it('处理边界情况', function () { 
    // 当最小值等于最大值等于输入值时
    strictEqual(clamp(0, 0, 0), 0)
    // 当最小值等于最大值但不等于输入值时
    strictEqual(clamp(5, 3, 3), 3)
    // 当输入值等于最小值时
    strictEqual(clamp(5, 5, 10), 5)
    // 当输入值等于最大值时
    strictEqual(clamp(10, 5, 10), 10)
  })

  it('处理大数值', function () { 
    strictEqual(clamp(2 ** 41, 2 ** 40, 2 ** 42), 2 ** 41)
    strictEqual(clamp(2 ** 43, 2 ** 40, 2 ** 42), 2 ** 42)
    strictEqual(clamp(2 ** 39, 2 ** 40, 2 ** 42), 2 ** 40)
  })

  it('正确处理负数', function () { 
    strictEqual(clamp(-10, -5, 5), -5)
    strictEqual(clamp(10, -5, 5), 5)
    strictEqual(clamp(0, -5, 5), 0)
    // 全为负数的情况
    strictEqual(clamp(-3, -10, -5), -5)
    strictEqual(clamp(-15, -10, -5), -10)
  })

  it('处理小数', function () { 
    strictEqual(clamp(1.5, 1.0, 2.0), 1.5)
    strictEqual(clamp(0.5, 1.0, 2.0), 1.0)
    strictEqual(clamp(2.5, 1.0, 2.0), 2.0)
    // 更精确的小数测试
    strictEqual(clamp(1.23456789, 1.23456788, 1.23456790), 1.23456789)
  })

  it('处理特殊数值', function () { 
    // Infinity 测试
    strictEqual(clamp(Infinity, -1, 1), 1)
    strictEqual(clamp(-Infinity, -1, 1), -1)
    
    // NaN 测试 - 虽然结果可能不是预期的，但这是 JavaScript 的行为
    // 这里主要是确保函数能正常处理而不抛出异常
    clamp(NaN, -1, 1)
  })

  it('正确处理参数顺序', function () { 
    // 正常顺序: min < max
    strictEqual(clamp(5, 3, 7), 5)
    // 异常顺序: min > max，这种情况下行为应该是确定的
    strictEqual(clamp(5, 7, 3), 5)
  })
})