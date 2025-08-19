import { Equal, Expect, NotEqual } from '@type-challenges/utils'
import { Dic, DicRollup } from '@vope/utils'
import { deepStrictEqual, strictEqual } from 'assert'

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

  it('includes', () => { 
    deepStrictEqual([
      dic.includes(0),
      dic.includes(5),
    ], [true, false])
  })

  it('label', () => { 
    debugger
    deepStrictEqual([
      dic.label(1),
      dic.label(1, 'test')
    ], ['1', '11'])
  })

  it('get', () => { 
    strictEqual(dic.get(0, 'name'), 'zero')
  })

  it('map', () => {
    deepStrictEqual(
      dic.map((data) => data.value + 1),
      [1, 2, 3, 4, 5]
    )
  })

  it('map', () => {
    strictEqual(
      dic.reduce((text, data) => text + data.label, ''),
      '01234'
    )
  })

  it('copy', () => { 
    const tmp = dic.copy([1, 3, 4], {
      customLabel: {
        test1: (data) => data.name,
      },
    })

    deepStrictEqual(
      tmp.map((data) => tmp.label(data.value, 'test1')),
      ['one', 'three', 'four']
    )
  })

  it('copyAnti', () => { 
    const tmp = dic.copyAnti([1, 3, 4])

    deepStrictEqual(
      tmp.map((data) => tmp.label(data.value, 'test')),
      ['00', '22']
    )
  })
})