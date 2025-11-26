import { deepWeakEqual } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('deepWeakEqual()', () => {
  it('基本类型比较', () => {
    const testCases = [
      // 相同的基本类型值
      { from: false, to: false, expected: true },
      { from: null, to: null, expected: true },
      { from: undefined, to: undefined, expected: true },
      { from: 0, to: 0, expected: true },
      { from: '', to: '', expected: true },
      
      // 不同的基本类型值
      { from: false, to: true, expected: false },
      { from: null, to: undefined, expected: false },
      { from: 0, to: 1, expected: false },
      { from: '', to: 'a', expected: false },
    ]

    testCases.forEach(({ from, to, expected }) => {
      deepStrictEqual(deepWeakEqual(from, to), expected)
    })
  })

  it('数组比较', () => {
    const testCases = [
      // 相同数组
      { from: [], to: [], expected: true },
      { from: [1, 2, 3], to: [1, 2, 3], expected: true },
      { from: ['a', 'b'], to: ['a', 'b'], expected: true },
      
      // 不同数组
      { from: [1], to: ['1'], expected: false },
      { from: [1, 2], to: [1, 2, 3], expected: false },
      { from: [1, 3], to: [1, 2], expected: false },
    ]

    testCases.forEach(({ from, to, expected }) => {
      deepStrictEqual(deepWeakEqual(from, to), expected)
    })
  })

  it('对象比较', () => {
    const testCases = [
      // 相同对象
      { from: {}, to: {}, expected: true },
      { from: { a: 1 }, to: { a: 1 }, expected: true },
      { from: { a: [1] }, to: { a: [1] }, expected: true },
      { from: { a: 1, b: 'test' }, to: { a: 1, b: 'test' }, expected: true },
      
      // 不同对象
      { from: { a: [1] }, to: { a: [1], b: 2 }, expected: false },
      { from: { a: 1 }, to: { a: 2 }, expected: false },
      { from: { a: 1 }, to: { b: 1 }, expected: false },
    ]

    testCases.forEach(({ from, to, expected }) => {
      deepStrictEqual(deepWeakEqual(from, to), expected)
    })
  })

  it('排除属性比较', () => {
    class Test { 
      id = Math.random()
      label = 'label'
      value: number

      constructor(value: number) { 
        this.value = value
      }
    }

    const testCases = [
      // 不排除任何属性
      { from: new Test(1), to: new Test(1), exclude: undefined, expected: false },
      
      // 排除id属性
      { from: new Test(1), to: new Test(1), exclude: ['id'], expected: true },
      { from: new Test(1), to: new Test(2), exclude: ['id'], expected: false },
    ]

    testCases.forEach(({ from, to, exclude, expected }) => {
      deepStrictEqual(deepWeakEqual(from, to, exclude as (keyof Test)[]), expected)
    })
  })

  it('嵌套对象和数组比较', () => {
    const testCases = [
      // 相同的复杂嵌套结构
      { 
        from: { 
          a: [1, 2], 
          b: { c: 'test', d: [3, 4] } 
        }, 
        to: { 
          a: [1, 2], 
          b: { c: 'test', d: [3, 4] } 
        }, 
        expected: true 
      },
      
      // 不同的复杂嵌套结构
      { 
        from: { 
          a: [1, 2], 
          b: { c: 'test', d: [3, 4] } 
        }, 
        to: { 
          a: [1, 2], 
          b: { c: 'test', d: [3, 5] } 
        }, 
        expected: false 
      },
      
      // 结构不同的对象
      { 
        from: { 
          a: [1, 2], 
          b: { c: 'test' } 
        }, 
        to: { 
          a: [1, 2], 
          b: { c: 'test', d: [3, 4] } 
        }, 
        expected: false 
      },
    ]

    testCases.forEach(({ from, to, expected }) => {
      deepStrictEqual(deepWeakEqual(from, to), expected)
    })
  })
})