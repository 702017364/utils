import type { Equal, Expect, NotEqual } from '@type-challenges/utils'
import { type Dic, DicRollup } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('class DicRollup', () => { 
  type Value = 0 | 1 | 2 | 3 | 4

  interface IDic extends Dic<Value> { 
    name: string
  }

  const list: IDic[] = [
    {
      label: '0',
      value: 0,
      name: 'zero',
    },
    {
      label: '1',
      value: 1,
      name: 'one',
    },
    {
      label: '2',
      value: 2,
      name: 'two',
    },
    {
      label: '3',
      value: 3,
      name: 'three',
    },
    {
      label: '4',
      value: 4,
      name: 'four',
    },
  ]

  const dic = new DicRollup<Value, IDic, 'test'>(list, {
    customLabel: {
      test: (data) => data.label + data.value,
    },
  })

  type cases = [
    Expect<Equal<DicRollup.Type<typeof dic>, Value>>,
    Expect<NotEqual<DicRollup.Type<typeof dic>, number>>,
    Expect<Equal<DicRollup.Dic<typeof dic>, IDic>>,
    Expect<Equal<DicRollup.Mode<typeof dic>, 'test'>>,
    Expect<NotEqual<DicRollup.Mode<typeof dic>, string>>,
  ]

  it('处理各种字典操作', () => {
    // includes 测试
    const includesTest = [
      dic.includes(0),
      dic.includes(5),
    ]
    
    // label 测试
    const labelTest = [
      dic.label(1),
      dic.label(1, 'test')
    ]
    
    // get 测试
    const getTest = dic.get(0, 'name')
    
    // map 测试
    const mapTest = dic.map((data) => data.value + 1)
    
    // reduce 测试
    const reduceTest = dic.reduce((text, data) => text + data.label, '')
    
    // copy 测试
    const tmp = dic.copy([1, 3, 4], {
      customLabel: {
        test1: (data) => data.name,
      },
    })
    const copyTest = tmp.map((data) => tmp.label(data.value, 'test1'))
    
    // copyAnti 测试
    const tmp1 = dic.copyAnti([1, 3, 4])
    const copyAntiTest = tmp1.map((data) => tmp1.label(data.value, 'test'))

    const actual = [
      ...includesTest,
      ...labelTest,
      getTest,
      mapTest,
      reduceTest,
      copyTest,
      copyAntiTest
    ]

    const expected = [
      true,
      false,
      '1',
      '11',
      'zero',
      [1, 2, 3, 4, 5],
      '01234',
      ['one', 'three', 'four'],
      ['00', '22']
    ]

    deepStrictEqual(actual, expected)
  })
})