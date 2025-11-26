import { wait } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('wait()', function () {
  it('异步执行顺序', async function () {
    const results: number[] = []
    
    const promise1 = wait(10).then(() => results.push(1))
    const promise2 = wait(20).then(() => results.push(2))
    const promise3 = wait(5).then(() => results.push(3))
    
    await Promise.all([promise1, promise2, promise3])
    
    // 验证执行顺序（按延迟时间排序）
    const expected = [3, 1, 2]
    
    deepStrictEqual(results, expected)
  })
})