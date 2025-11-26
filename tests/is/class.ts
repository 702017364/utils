import { isClass } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('isClass()', () => {
  it('检测类和函数类型', () => {
    const actual = [
      // 类声明
      isClass(class { }),
      isClass(class Test { }),
      
      // 普通函数
      isClass(function () { }),
      isClass(function Test() { }),
      
      // 箭头函数
      isClass(() => { }),
      
      // 内置构造函数
      isClass(Array),
      isClass(Date),
      
      // 非函数值
      isClass(null),
      isClass(undefined),
      isClass('string'),
      isClass(123),
      isClass({}),
      isClass([])
    ]

    const expected = [
      true,
      true,
      
      false,
      true,
      
      false,
      
      true,
      true,
      
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
    // 带构造函数逻辑的函数
    const funcWithThis = function() { 
      // @ts-ignore
      this.value = 1
    }
    
    const actual = [
      // 带原型的方法
      isClass(class { 
        method() { }
      }),
      
      // 空类
      isClass(class Empty { }),
      
      // 带属性的函数
      (() => {
        const fn: any = function() { }
        fn.prototype.someProp = 'value'
        return isClass(fn)
      })(),
      
      // 带this的函数
      isClass(funcWithThis)
    ]

    const expected = [
      true,
      true,
      true,
      false
    ]

    deepStrictEqual(actual, expected)
  })
})