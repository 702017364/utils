import { Subscriber } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('Subscriber', function () {
  it('基本订阅和触发功能', function () {
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    
    let results: string[] = []
    subscriber
      .$on('test', (value) => results.push(`first:${value}`))
      .$on('test', (value) => results.push(`second:${value}`))
    
    subscriber.$emit('test', 'a')
    subscriber.$emit('test', 'b')
    
    const expected = [
      'first:a',
      'second:a',
      'first:b',
      'second:b'
    ]
    
    deepStrictEqual(results, expected)
  })

  it('一次性订阅功能', function () {
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    
    let results: string[] = []
    subscriber
      .$on('test', (value) => results.push(`permanent:${value}`))
      .$once('test', (value) => results.push(`once:${value}`))
    
    subscriber.$emit('test', 'a')
    subscriber.$emit('test', 'b')
    
    const expected = [
      'permanent:a',
      'once:a',
      'permanent:b'
    ]
    
    deepStrictEqual(results, expected)
  })

  it('取消订阅功能', function () {
    const subscriber = new Subscriber<{
      test(value: string): void
    }>()
    
    let results: string[] = []
    const permanentListener = (value: string) => results.push(`permanent:${value}`)
    const removableListener = (value: string) => results.push(`removable:${value}`)
    
    subscriber
      .$on('test', permanentListener)
      .$on('test', removableListener)
    
    subscriber.$emit('test', 'a')
    subscriber.$off('test', removableListener)
    subscriber.$emit('test', 'b')
    subscriber.$off('test')
    subscriber.$emit('test', 'c')
    
    const expected = [
      'permanent:a',
      'removable:a',
      'permanent:b'
    ]
    
    deepStrictEqual(results, expected)
  })

  it('复杂订阅场景', function () {
    const subscriber = new Subscriber<{
      name(value: string): void
      age(value: number): void
      sex(value: 0 | 1): void
    }>()
    
    const results: string[] = []
    subscriber
      .$on('name', (value) => results.push('姓名：' + value))
      .$on('age', (value) => results.push('年龄：' + value + '岁'))
      .$on('sex', (value) => results.push('性别：' + (value === 1 ? '男' : '女')))
      .$once('name', (value) => results.push('临时姓名：' + value))

    subscriber
      .$emit('name', '张三')
      .$emit('age', 20)
      .$emit('sex', 1)
    
    subscriber.$off('age')
    
    results.push('|')

    subscriber
      .$emit('name', '李四')
      .$emit('age', 34)
      .$emit('sex', 0)
    
    const expected = [
      '姓名：张三',
      '临时姓名：张三',
      '年龄：20岁',
      '性别：男',
      '|',
      '姓名：李四',
      '性别：女'
    ]
    
    deepStrictEqual(results, expected)
  })
})