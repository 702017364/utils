import { hash8strings } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8strings()', () => {
  it('将数组转换为以元素为键、索引为值的对象', () => {
    const uuid = Symbol()
    
    const actual = [
      // 基本用法
      hash8strings([
        'a',
        1,
        uuid,
        'a',
      ]),
      
      // 字符串数组
      hash8strings(['first', 'second', 'third']),
      
      // 数字数组
      hash8strings([10, 20, 30]),
      
      // 符号数组
      hash8strings([uuid]),
      
      // 重复元素（后面的索引覆盖前面的）
      hash8strings(['duplicate', 'unique', 'duplicate']),
      
      // 空数组
      hash8strings([]),
      
      // 混合类型数组
      hash8strings(['string', 42, uuid])
    ]

    const expected = [
      {
        a: 3,
        1: 1,
        [uuid]: 2,
      },
      
      {
        first: 0,
        second: 1,
        third: 2
      },
      
      {
        10: 0,
        20: 1,
        30: 2
      },
      
      {
        [uuid]: 0
      },
      
      {
        duplicate: 2,
        unique: 1
      },
      
      {},
      
      {
        string: 0,
        42: 1,
        [uuid]: 2
      }
    ]

    deepStrictEqual(actual, expected)
  })

  it('处理各种元素类型和边界情况', () => {
    const symbol1 = Symbol('test1')
    const symbol2 = Symbol('test2')
    
    const actual = [
      // 多个符号元素
      hash8strings([symbol1, symbol2]),
      
      // 相同值的不同类型元素
      hash8strings([1, '1'])
    ]

    const expected = [
      {
        [symbol1]: 0,
        [symbol2]: 1
      },
      
      {
        '1': 1
      }
    ]

    deepStrictEqual(actual, expected)
  })
})