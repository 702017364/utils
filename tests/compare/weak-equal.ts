import { deepWeakEqual } from '@vope/utils'
import { strictEqual } from 'assert'

describe('deepWeakEqual()', () => {
  it('false and false is true', () => {
    strictEqual(true, deepWeakEqual(false, false))
  })

  it('null and null is true', () => {
    strictEqual(true, deepWeakEqual(null, null))
  })

  it('[] and [] is true', () => {
    strictEqual(true, deepWeakEqual([], []))
  })

  it('{ a: [1] } and { a: [1] } is true', () => {
    strictEqual(true, deepWeakEqual({ a: [1] }, { a: [1] }))
  })

  it('[1] and ["1"] is false', () => {
    strictEqual(false, deepWeakEqual([1], ['1']))
  })

  it('{ a: [1] } and { a: [1], b: 2 } is false', () => {
    strictEqual(false, deepWeakEqual({ a: [1] }, { a: [1], b: 2 }))
  })

  class Test { 
    id = Math.random()
    label = 'label'
    value: number

    constructor(value: number) { 
      this.value = value
    }
  }

  it('not exclude', () => { 
    strictEqual(false, deepWeakEqual(new Test(1), new Test(1)))
  })

  it('exclude', () => { 
    strictEqual(true, deepWeakEqual(new Test(1), new Test(1), ['id']))
  })
})