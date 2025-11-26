import { deconPowersSum } from '@vope/utils'
import { deepStrictEqual, throws } from 'assert'

describe('deconPowersSum()', function () {
  it('解构2的正整数幂之和', () => {
    const inputs = [1, 2, 3, 4, 5, 7, 15, 16, 31, 127, 255]
    
    const actual = inputs.map(input => deconPowersSum(input))
    deepStrictEqual(actual, [
      [0],
      [1],
      [1, 0],
      [2],
      [2, 0],
      [2, 1, 0],
      [3, 2, 1, 0],
      [4],
      [4, 3, 2, 1, 0],
      [6, 5, 4, 3, 2, 1, 0],
      [7, 6, 5, 4, 3, 2, 1, 0]
    ])
  })

  it('升序排列结果', () => {
    const inputs = [3, 7, 15, 255]

    const actual = inputs.map(input => deconPowersSum(input, 'asc'))
    deepStrictEqual(actual, [
      [0, 1],
      [0, 1, 2],
      [0, 1, 2, 3],
      [0, 1, 2, 3, 4, 5, 6, 7]
    ])
  })

  it('处理边界情况和异常输入', () => {
    // 小于1的输入应该抛出错误
    throws(() => deconPowersSum(0), {
      message: '多个2的正整数幂(两两不相等)之和必定大于等于1'
    })
    
    throws(() => deconPowersSum(-1), {
      message: '多个2的正整数幂(两两不相等)之和必定大于等于1'
    })

    // 非整数输入应该抛出错误
    throws(() => deconPowersSum(1.5), {
      message: '参数必须是整数'
    })
    
    throws(() => deconPowersSum(3.14), {
      message: '参数必须是整数'
    })
  })
})