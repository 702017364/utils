import { Subscriber } from '@vope/utils'
import { strictEqual } from 'assert'

describe('Subscriber', function () { 
  it('多次注册', function () { 
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    let str = ''
    subscriber
      .$on('test', (value) => str += value)
      .$on('test', (value) => str += value)
      .$emit('test', 'a')
    strictEqual(str, 'aa')
  })

  it('多次触发', function () { 
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    let str = ''
    subscriber
      .$on('test', (value) => str += value)
      .$emit('test', 'a')
      .$emit('test', 'b')
    strictEqual(str, 'ab')
  })

  it('多次注册且多次触发', function () { 
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    let str = ''
    subscriber
      .$on('test', (value) => str += value)
      .$on('test', (value) => str += value)
      .$emit('test', 'a')
      .$emit('test', 'b')
    strictEqual(str, 'aabb')
  })

  it('注册n >> 触发n >> 注销1 >> 触发n >> 注销n >> 触发n', function () { 
    const subscriber = new Subscriber<{
      name(value: string): void
      age(value: number): void
      sex(value: 0 | 1): void
    }>()
    const list: string[] = []

    subscriber
      .$on('name', (value) => list.push('姓名：' + value))
      .$on('age', (value) => list.push('年龄：' + value + '岁'))
      .$on('sex', (value) => list.push('性别：' + (value === 1 ? '男' : '女')))

    subscriber
      .$emit('name', '张三')
      .$emit('age', 20)
      .$emit('sex', 1)
    
    subscriber.$off('age')
    
    list.push('|')

    subscriber
      .$emit('name', '李四')
      .$emit('age', 34)
      .$emit('sex', 0)
    
    subscriber
      .$off('name')
      .$off('age')
      .$off('sex')
    
    subscriber
      .$emit('name', '王五')
      .$emit('age', 40)
      .$emit('sex', 1)
    
    const str = list.join(',')
    
    strictEqual(str, '姓名：张三,年龄：20岁,性别：男,|,姓名：李四,性别：女')
  })
})