import { isNull } from '@vope/utils'
import { strictEqual } from 'assert'

describe('isNull()', () => {
  it('null is true', () => {
    strictEqual(true, isNull(null))
  })

  it('undefined is true', () => {
    strictEqual(true, isNull(undefined))
  })

  it('false is false', () => {
    strictEqual(false, isNull(false))
  })

  it('"" is false', () => {
    strictEqual(false, isNull(""))
  })
})