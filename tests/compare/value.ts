import { compareValue } from '@vope/utils'
import { strictEqual } from 'assert'

describe('compareValue()', () => {
  it('false and false is true', () => {
    strictEqual(true, compareValue(false, false))
  })

  it('null and null is true', () => {
    strictEqual(true, compareValue(null, null))
  })

  it('[] and [] is true', () => {
    strictEqual(true, compareValue([], []))
  })

  it('{ a: [1] } and { a: [1] } is true', () => {
    strictEqual(true, compareValue({ a: [1] }, { a: [1] }))
  })

  it('[1] and ["1"] is false', () => {
    strictEqual(false, compareValue([1], ['1']))
  })

  it('{ a: [1] } and { a: [1], b: 2 } is false', () => {
    strictEqual(false, compareValue({ a: [1] }, { a: [1], b: 2 }))
  })
})