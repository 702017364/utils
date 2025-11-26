import { isKey } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('isKey()', () => {
  const testData = new class Test { 
    a = 1
    b = 2
    c = 'test'
  }
  
  const testObject = {
    x: 10,
    y: 20,
    z: 'value'
  }

  it('检测对象属性', () => {
    const actual = [
      // 存在的属性
      isKey('a', testData),
      isKey('b', testData),
      isKey('c', testData),
      
      // 不存在的属性
      isKey('d', testData),
      isKey('x', testData),
      
      // 存在的属性（对象字面量）
      isKey('x', testObject),
      isKey('y', testObject),
      isKey('z', testObject),
      
      // 不存在的属性（对象字面量）
      isKey('a', testObject),
      isKey('w', testObject),
      
      // 空对象
      isKey('any', {}),
      
      // 原型链属性
      isKey('toString', testData),
      isKey('valueOf', testObject)
    ]

    const expected = [
      true,
      true,
      true,
      
      false,
      false,
      
      true,
      true,
      true,
      
      false,
      false,
      
      false,
      
      true,
      true
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理各种边界情况', () => {
    const complexObject = {
      '': 'empty string key',
      '0': 'numeric string key',
      'special-chars_123': 'special characters key',
      [Symbol('test')]: 'symbol key'
    }
    
    const actual = [
      // 空字符串键
      isKey('', complexObject),
      
      // 数字字符串键
      isKey('0', complexObject),
      
      // 特殊字符键
      isKey('special-chars_123', complexObject),
      
      // 不存在的特殊键
      isKey('non-existent', complexObject),
      
      // Symbol 键（不会在 in 操作符中找到）
      isKey('Symbol(test)', complexObject)
    ]

    const expected = [
      true,
      true,
      true,
      false,
      false
    ]

    deepStrictEqual(actual, expected)
  })
})