import { clamp } from '@vope/utils'
import { strictEqual } from 'assert'

describe('clamp()', function () { 
  const longs = [0, -1, 1] as const
  it(longs.join(','), function () { 
    strictEqual(0, clamp(...longs))
  })

  const doubles = [2 ** 41, 2 ** 40, 2 ** 42] as const
  it(doubles.join(','), function () { 
    strictEqual(2 ** 41, clamp(...doubles))
  })

  const swap = [2 ** 41, 2 ** 42, 2 ** 40] as const
  it(swap.join(','), function () { 
    strictEqual(2 ** 41, clamp(...swap))
  })
})