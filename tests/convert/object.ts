import { hash8object } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('hash8object()', () => {
  interface Item { 
    key: Object
    value: number
  }

  it('将对象数组转换为以指定属性为键的Map', () => {
    const uuid = Symbol()
    
    const actual = [
      // 基本用法
      hash8object<'key', Item>([
        { key: String, value: 1 },
        { key: Object, value: 2 },
        { key: 1, value: 3 },
        { key: uuid, value: 4 },
        { key: String, value: 5 },
      ], 'key'),
      
      // 字符串构造函数和对象构造函数键
      hash8object<'key', { key: Object, value: string }>([
        { key: String, value: 'stringConstructor' },
        { key: Object, value: 'objectConstructor' }
      ], 'key'),
      
      // 数字键
      hash8object<'key', { key: number, value: string }>([
        { key: 1, value: 'one' },
        { key: 2, value: 'two' }
      ], 'key'),
      
      // 符号键
      hash8object<'key', { key: symbol, value: string }>([
        { key: uuid, value: 'symbolValue' }
      ], 'key'),
      
      // 重复键（后面的覆盖前面的）
      hash8object<'key', Item>([
        { key: String, value: 1 },
        { key: String, value: 2 }
      ], 'key'),
      
      // 空数组
      hash8object<'key', Item>([], 'key')
    ]

    const expected = [
      new Map<any, Item>([
        [String, { key: String, value: 5 }],
        [Object, { key: Object, value: 2 }],
        [1, { key: 1, value: 3 }],
        [uuid, { key: uuid, value: 4 }],
      ]),
      
      new Map<Object, {key: Object, value: string}>([
        [String, { key: String, value: 'stringConstructor' }],
        [Object, { key: Object, value: 'objectConstructor' }]
      ]),
      
      new Map<number, {key: number, value: string}>([
        [1, { key: 1, value: 'one' }],
        [2, { key: 2, value: 'two' }]
      ]),
      
      new Map<symbol, {key: symbol, value: string}>([
        [uuid, { key: uuid, value: 'symbolValue' }]
      ]),
      
      new Map<Object, Item>([
        [String, { key: String, value: 2 }]
      ]),
      
      new Map<any, Item>()
    ]

    // 逐一比较 Map 内容
    actual.forEach((map, index) => {
      deepStrictEqual(map, expected[index])
    })
  })

  it('处理各种键类型和边界情况', () => {
    const symbol1 = Symbol('test1')
    const symbol2 = Symbol('test2')
    
    const actual = [
      // 混合键类型
      hash8object<'key', Item>([
        { key: String, value: 1 },
        { key: 42, value: 2 },
        { key: symbol1, value: 3 }
      ], 'key'),
      
      // 多个符号键
      hash8object<'key', Item>([
        { key: symbol1, value: 1 },
        { key: symbol2, value: 2 }
      ], 'key')
    ]

    const expected = [
      new Map<any, Item>([
        [String, { key: String, value: 1 }],
        [42, { key: 42, value: 2 }],
        [symbol1, { key: symbol1, value: 3 }]
      ]),
      
      new Map<any, Item>([
        [symbol1, { key: symbol1, value: 1 }],
        [symbol2, { key: symbol2, value: 2 }]
      ])
    ]

    // 逐一比较 Map 内容
    actual.forEach((map, index) => {
      deepStrictEqual(map, expected[index])
    })
  })
})