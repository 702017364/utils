import { css } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('css()', function () { 
  it('处理基础类型参数', function () { 
    const inputs = [
      [false as const, null, undefined, 'test'],
      ['', 'hello', 'world'],
      [null, false as const, undefined],
      ['single']
    ]
    
    const expected = [
      'test',
      'hello;world',
      '',
      'single'
    ]

    const actual = inputs.map(args => css(...args))

    deepStrictEqual(actual, expected)
  })

  it('处理CSS属性对象', function () { 
    const inputs = [
      [{ padding: 0, margin: 0 }],
      [{ backgroundColor: 'red', color: 'white' }],
      [{ zIndex: 10, display: 'flex' }],
      [{ '--custom-property': 'value' }]
    ]
    
    const expected = [
      'padding: 0;margin: 0',
      'background-color: red;color: white',
      'z-index: 10;display: flex',
      '--custom-property: value'
    ]

    const actual = inputs.map(args => css(...args))

    deepStrictEqual(actual, expected)
  })

  it('处理数组类型参数', function () { 
    const inputs = [
      ['a', ['b', 'c'], { zIndex: 1 }],
      [['item1', ['nested1', 'nested2']], 'item2'],
      ['style1', ['style2', ['style3']], { display: 'block' }]
    ]
    
    const expected = [
      'a;b;c;z-index: 1',
      'item1;nested1;nested2;item2',
      'style1;style2;style3;display: block'
    ]

    const actual = inputs.map(args => css(...args))

    deepStrictEqual(actual, expected)
  })

  it('处理混合类型参数', function () { 
    const inputs = [
      [false as const, 'display-flex', null, { display: 'flex' }, ['align-center', 'justify-center']],
      ['button', { backgroundColor: 'blue' }, null, ['hover', { color: 'white' }]],
      [undefined, ['container', { maxWidth: '1200px' }], false as const]
    ]
    
    const expected = [
      'display-flex;display: flex;align-center;justify-center',
      'button;background-color: blue;hover;color: white',
      'container;max-width: 1200px'
    ]

    const actual = inputs.map(args => css(...args))

    deepStrictEqual(actual, expected)
  })
})