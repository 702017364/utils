import { classnames } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('classnames()', function () {
  it('处理各种输入组合', function () {
    const testCases = [
      // 空参数
      classnames(),
      
      // 字符串参数
      classnames('a', 'b'),
      
      // 数组参数
      classnames('a', [null, 'b']),
      
      // 对象参数
      classnames('a', {
        b: true,
        c: false
      }),
      
      // 布尔值参数
      classnames('a', true),
      
      // 复杂组合
      classnames('a', ['b', undefined, 'c'], { d: true, e: false }, 'f'),
      
      // 空值过滤
      classnames(null, 'a', undefined, 'b', false),
      
      // 空数组和空对象
      classnames('a', [], {}),
      
      // 只有 falsy 值
      classnames(null, undefined, false),
    ]

    deepStrictEqual(testCases, [
      '',
      'a b',
      'a b',
      'a b',
      'a',
      'a b c d f',
      'a b',
      'a',
      '',
    ])
  })
})