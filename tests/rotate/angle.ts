import { rotateAngle } from '@vope/utils'
import { deepEqual } from 'assert'

describe('rotateAngle()', function () { 
  it('(1, 1)', function () { 
    const [x, y] = rotateAngle([1, 1], 90)
    // 由于js的精度问题，所以需要调用Math.fround
    deepEqual([1, -1], [Math.fround(x), Math.fround(y)])
  })
})