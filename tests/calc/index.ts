import { calc } from '@vope/utils'
import { deepEqual } from 'assert'

describe('calc', () => {
  it('default', () => { 
    deepEqual('calc(4px + 5pt + 6em + (1px * 2) + max(20px, 2em))', calc(4, 0, '5pt', '6em', 'calc(1px * 2)', 'max(20px, 2em)'))
  })
})