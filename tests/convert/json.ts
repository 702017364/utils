import { hash8json } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8json()', () => {
  interface Item { 
    key: keyof any
    value: number
  }

  it('将对象数组转换为以指定属性为键的对象', () => {
    const uuid = Symbol()
    
    const actual = [
      // 基本用法
      hash8json<'key', Item>([
        { key: 'a', value: 1 },
        { key: uuid, value: 2 },
        { key: 1, value: 3 },
        { key: '1', value: 4 },
      ], 'key'),
      
      // 字符串键
      hash8json<'key', { key: string, value: number }>([
        { key: 'first', value: 1 },
        { key: 'second', value: 2 }
      ], 'key'),
      
      // 数字键
      hash8json<'key', { key: number, value: string }>([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' }
      ], 'key'),
      
      // 符号键
      hash8json<'key', { key: symbol, value: string }>([
        { key: uuid, value: 'symbolValue' }
      ], 'key'),
      
      // 重复键（后面的覆盖前面的）
      hash8json<'key', Item>([
        { key: 'duplicate', value: 1 },
        { key: 'duplicate', value: 2 }
      ], 'key'),
      
      // 空数组
      hash8json<'key', Item>([], 'key')
    ]

    const expected = [
      {
        a: { key: 'a', value: 1 },
        [uuid]: { key: uuid, value: 2 },
        1: { key: '1', value: 4 },
      },
      
      {
        first: { key: 'first', value: 1 },
        second: { key: 'second', value: 2 }
      },
      
      {
        1: { key: 1, value: 'one' },
        2: { key: 2, value: 'two' }
      },
      
      {
        [uuid]: { key: uuid, value: 'symbolValue' }
      },
      
      {
        duplicate: { key: 'duplicate', value: 2 }
      },
      
      {}
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理各种键类型和边界情况', () => {
    const symbol1 = Symbol('test1')
    const symbol2 = Symbol('test2')
    
    const actual = [
      // 混合键类型
      hash8json<'key', Item>([
        { key: 'stringKey', value: 1 },
        { key: 42, value: 2 },
        { key: symbol1, value: 3 }
      ], 'key'),
      
      // 多个符号键
      hash8json<'key', Item>([
        { key: symbol1, value: 1 },
        { key: symbol2, value: 2 }
      ], 'key'),
      
      // 相同值的不同类型键
      hash8json<'key', Item>([
        { key: 1, value: 10 },
        { key: '1', value: 20 }
      ], 'key')
    ]

    const expected = [
      {
        stringKey: { key: 'stringKey', value: 1 },
        42: { key: 42, value: 2 },
        [symbol1]: { key: symbol1, value: 3 }
      },
      
      {
        [symbol1]: { key: symbol1, value: 1 },
        [symbol2]: { key: symbol2, value: 2 }
      },
      
      {
        1: { key: '1', value: 20 }
      }
    ]

    deepStrictEqual(actual, expected)
  })
})