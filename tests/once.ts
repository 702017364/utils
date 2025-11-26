import { once } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('once()', function () {
  it('多次调用只执行一次', function () {
    let count = 0
    const increment = () => ++count
    const onceIncrement = once(increment)
    
    const results = [
      onceIncrement(),
      onceIncrement(),
      onceIncrement()
    ]
    
    deepStrictEqual(results, [1, 1, 1])
  })

  it('带参数的函数调用', function () {
    const sum = (a: number, b: number) => a + b
    const onceSum = once(sum)
    
    const results = [
      onceSum(1, 2),
      onceSum(3, 4),
      onceSum(5, 6)
    ]
    
    deepStrictEqual(results, [3, 3, 3])
  })

  it('this绑定上下文', function () {
    const obj1 = { value: 10 }
    const obj2 = { value: 20 }
    
    const getValue = function (this: { value: number } | undefined) { 
      return this && this.value
    }
    
    const boundOnce = once(getValue, obj1)
    const unboundOnce = once(getValue)
    
    const results = [
      boundOnce.call(obj2),
      boundOnce.call(obj2),
      unboundOnce.call(obj1),
      unboundOnce.call(obj2)
    ]
    
    deepStrictEqual(results, [10, 10, undefined, undefined])
  })
})