import { disableEnumerable } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('disableEnumerable', function () {
  it('普通对象属性设置为不可枚举', function () {
    const obj = { a: 1, b: 2 }
    disableEnumerable(obj, 'a')
    
    const actual = Object.keys(obj)
    const expected = ['b']
    
    deepStrictEqual(actual, expected)
  })

  it('嵌套对象属性设置为不可枚举', function () {
    const obj = { 
      a: 1, 
      nested: { 
        x: 10, 
        y: 20 
      } 
    }
    disableEnumerable(obj, 'nested')
    
    const actual = Object.keys(obj)
    const expected = ['a']
    
    deepStrictEqual(actual, expected)
  })

  it('数组元素设置为不可枚举', function () {
    const arr = [1, 2, 3]
    disableEnumerable(arr, 1)
    
    const actual = Object.keys(arr).map(Number)
    const expected = [0, 2]
    
    deepStrictEqual(actual, expected)
  })

  it('Symbol属性设置为不可枚举', function () {
    const sym = Symbol('test')
    const obj: Record<string | symbol, any> = { a: 1 }
    Object.defineProperty(obj, sym, {
      value: 'symbol-value',
      enumerable: true,
      writable: true,
      configurable: true
    })
    
    disableEnumerable(obj, sym as keyof typeof obj)
    
    const actual = Object.getOwnPropertySymbols(obj)
    const actualDescriptors = actual.map(s => Object.getOwnPropertyDescriptor(obj, s))
    const expectedDescriptors = [{
      value: 'symbol-value',
      enumerable: false,
      writable: true,
      configurable: true
    }]
    
    deepStrictEqual(actualDescriptors, expectedDescriptors)
  })

  it('已经存在的属性描述符保持其他属性不变', function () {
    const obj: Record<string, any> = {}
    Object.defineProperty(obj, 'nonEnum', {
      value: 'test-value',
      enumerable: true,
      writable: false,
      configurable: true
    })
    
    disableEnumerable(obj, 'nonEnum')
    
    const descriptor = Object.getOwnPropertyDescriptor(obj, 'nonEnum')
    const actual = {
      value: descriptor?.value,
      enumerable: descriptor?.enumerable,
      writable: descriptor?.writable,
      configurable: descriptor?.configurable
    }
    const expected = {
      value: 'test-value',
      enumerable: false,
      writable: false,
      configurable: true
    }
    
    deepStrictEqual(actual, expected)
  })
})