import { asyncLock } from '@vope/utils'
import { strictEqual, deepStrictEqual } from 'assert'

describe('asyncLock()', function () {
  it('锁定并发调用', async function () {
    let count = 0
    
    const lock = asyncLock(async (value: number) => {
      count += value
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 10))
      return count
    })
    
    // 并发调用
    const promises = [
      lock.callback(1),
      lock.callback(2),
      lock.callback(3)
    ]
    
    const results = await Promise.all(promises)
    
    // 由于锁机制，应该只执行一次
    strictEqual(count, 1)
    deepStrictEqual(results, [1, 1, 1])
  })

  it('在执行后释放锁', async function () {
    let count = 0
    
    const lock = asyncLock(async (value: number) => {
      count += value
      return count
    })
    
    await lock.callback(1)
    const result = await lock.callback(2)
    
    // 应该分别执行两次
    strictEqual(count, 3)
    strictEqual(result, 3)
  })

  it('与验证器一起使用', async function () {
    let count = 0
    
    const lock = asyncLock(async (value: number) => {
      count += value
      return count > 2 ? 'locked' : 'unlocked'
    }, {
      validate: 'locked'
    })
    
    // 第一次调用，返回"unlocked"，不会永久锁定
    const result1 = await lock.callback(1)
    strictEqual(result1, 'unlocked')
    
    // 第二次调用，返回"locked"，会永久锁定
    const result2 = await lock.callback(3)
    strictEqual(result2, 'locked')
    
    // 后续调用应该被忽略
    const result3 = await lock.callback(10)
    strictEqual(result3, 'locked')
    
    strictEqual(count, 4)
  })

  it('与函数验证器一起使用', async function () {
    let count = 0
    
    const lock = asyncLock(async (value: number) => {
      count += value
      return count
    }, {
      validate: (result: number) => result >= 3
    })
    
    // 第一次调用，返回1，小于3，不会锁定
    const result1 = await lock.callback(1)
    strictEqual(result1, 1)
    
    // 第二次调用，返回3，等于3，会锁定
    const result2 = await lock.callback(2)
    strictEqual(result2, 3)
    
    // 后续调用应该被忽略
    const result3 = await lock.callback(10)
    strictEqual(result3, 3)
    
    strictEqual(count, 3)
  })

  it('spin属性', async function () {
    const lock = asyncLock(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'done'
    }, {})
    
    strictEqual(lock.spin, false)
    
    const promise = lock.callback()
    strictEqual(lock.spin, true)
    
    await promise
    strictEqual(lock.spin, false)
  })

  it('与基于访问器的spin一起使用', async function () {
    const sp = { value: false }
    
    const lock = asyncLock(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'done'
    }, { sp })
    
    strictEqual(lock.spin, false)
    strictEqual(sp.value, false)
    
    const promise = lock.callback()
    strictEqual(lock.spin, true)
    strictEqual(sp.value, true)
    
    await promise
    strictEqual(lock.spin, false)
    strictEqual(sp.value, false)
  })

  it('与基于bean的spin一起使用', async function () {
    const sp = {
      _value: false,
      get() { return this._value },
      set(value: boolean) { this._value = value }
    }
    
    const lock = asyncLock(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return 'done'
    }, { sp })
    
    strictEqual(lock.spin, false)
    strictEqual(sp.get(), false)
    
    const promise = lock.callback()
    strictEqual(lock.spin, true)
    strictEqual(sp.get(), true)
    
    await promise
    strictEqual(lock.spin, false)
    strictEqual(sp.get(), false)
  })

  it('重置锁状态', async function () {
    let count = 0
    
    const lock = asyncLock(async (value: number) => {
      count += value
      return count >= 2 ? 'locked' : 'unlocked'
    }, {
      validate: 'locked'
    })
    
    // 锁定
    await lock.callback(2)
    strictEqual(count, 2)
    
    // 后续调用被忽略
    const result1 = await lock.callback(10)
    strictEqual(result1, 'locked')
    strictEqual(count, 2)
    
    // 重置后可以再次执行
    lock.unlock()
    const result2 = await lock.callback(1)
    strictEqual(result2, 'locked')
    strictEqual(count, 3)
  })
})