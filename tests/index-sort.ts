import { indexSort } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('indexSort()', () => {
  it('长度小于2的数组', () => {
    const emptyArray: { id: number; name: string }[] = []
    const singleElementArray = [{ id: 5, name: 'A' }]

    const actualEmpty = indexSort(emptyArray, 'id')
    const actualSingle = indexSort(singleElementArray, 'id')

    deepStrictEqual(actualEmpty, [])
    deepStrictEqual(actualSingle, [{ id: 5, name: 'A' }])
  })

  it('最小值为0的有序和无序数组', () => {
    // 有序数组
    const orderedArray = [
      { id: 0, name: 'A' },
      { id: 1, name: 'B' },
      { id: 2, name: 'C' }
    ]

    // 无序数组
    const unorderedArray = [
      { id: 2, name: 'C' },
      { id: 0, name: 'A' },
      { id: 1, name: 'B' }
    ]

    const actualOrdered = indexSort(orderedArray, 'id')
    const actualUnordered = indexSort(unorderedArray, 'id')

    const expected = [
      { id: 0, name: 'A' },
      { id: 1, name: 'B' },
      { id: 2, name: 'C' }
    ]

    deepStrictEqual(actualOrdered, expected)
    deepStrictEqual(actualUnordered, expected)
  })

  it('最小值为大于0的有序和无序数组', () => {
    // 有序数组
    const orderedArray = [
      { pos: 5, value: 'A' },
      { pos: 6, value: 'B' },
      { pos: 7, value: 'C' }
    ]

    // 无序数组
    const unorderedArray = [
      { pos: 7, value: 'C' },
      { pos: 5, value: 'A' },
      { pos: 6, value: 'B' }
    ]

    const actualOrdered = indexSort(orderedArray, 'pos')
    const actualUnordered = indexSort(unorderedArray, 'pos')

    const expected = [
      { pos: 5, value: 'A' },
      { pos: 6, value: 'B' },
      { pos: 7, value: 'C' }
    ]

    deepStrictEqual(actualOrdered, expected)
    deepStrictEqual(actualUnordered, expected)
  })

  it('最小值为小于0的有序和无序数组', () => {
    // 有序数组
    const orderedArray = [
      { idx: -2, name: 'A' },
      { idx: -1, name: 'B' },
      { idx: 0, name: 'C' }
    ]

    // 无序数组
    const unorderedArray = [
      { idx: 0, name: 'C' },
      { idx: -2, name: 'A' },
      { idx: -1, name: 'B' }
    ]

    const actualOrdered = indexSort(orderedArray, 'idx')
    const actualUnordered = indexSort(unorderedArray, 'idx')

    const expected = [
      { idx: -2, name: 'A' },
      { idx: -1, name: 'B' },
      { idx: 0, name: 'C' }
    ]

    deepStrictEqual(actualOrdered, expected)
    deepStrictEqual(actualUnordered, expected)
  })

  it('值为增序步进不为1的数组', () => {
    const stepArray = [
      { step: 0, name: 'A' },
      { step: 2, name: 'B' },
      { step: 4, name: 'C' }
    ]

    const actual = indexSort(stepArray, 'step')
    const expected = [
      { step: 0, name: 'A' },
      { step: 2, name: 'B' },
      { step: 4, name: 'C' }
    ]

    deepStrictEqual(actual, expected)
  })

  it('值为非整数数组', () => {
    const floatArray = [
      { val: 1.5, name: 'B' },
      { val: 0.5, name: 'A' },
      { val: 2.5, name: 'C' }
    ]

    const actual = indexSort(floatArray, 'val')
    const expected = [
      { val: 0.5, name: 'A' },
      { val: 1.5, name: 'B' },
      { val: 2.5, name: 'C' }
    ]

    deepStrictEqual(actual, expected)
  })

  it('值出现重复的数组', () => {
    const duplicateArray = [
      { id: 3, name: 'C' },
      { id: 1, name: 'A' },
      { id: 3, name: 'D' },
      { id: 2, name: 'B' }
    ]

    const actual = indexSort(duplicateArray, 'id')
    const expected = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
      { id: 3, name: 'D' }
    ]

    deepStrictEqual(actual, expected)
  })

  it('所有元素具有相同值的数组', () => {
    const sameValueArray = [
      { id: 5, name: 'A' },
      { id: 5, name: 'B' },
      { id: 5, name: 'C' }
    ]

    const actual = indexSort(sameValueArray, 'id')
    const expected = [
      { id: 5, name: 'A' },
      { id: 5, name: 'B' },
      { id: 5, name: 'C' }
    ]

    deepStrictEqual(actual, expected)
  })

  it('包含Infinity值的数组', () => {
    const infinityArray = [
      { val: 3, name: 'B' },
      { val: Infinity, name: 'C' },
      { val: 1, name: 'A' }
    ]

    const actual = indexSort(infinityArray, 'val')
    const expected = [
      { val: 1, name: 'A' },
      { val: 3, name: 'B' },
      { val: Infinity, name: 'C' }
    ]

    deepStrictEqual(actual, expected)
  })

  it('包含负无穷值的数组', () => {
    const negativeInfinityArray = [
      { val: 3, name: 'B' },
      { val: -Infinity, name: 'A' },
      { val: 1, name: 'C' }
    ]

    const actual = indexSort(negativeInfinityArray, 'val')
    const expected = [
      { val: -Infinity, name: 'A' },
      { val: 1, name: 'C' },
      { val: 3, name: 'B' }
    ]

    deepStrictEqual(actual, expected)
  })
})