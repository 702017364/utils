import { FlexTable } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('FlexTable', function () {
  it('基本属性和初始化', function () {
    const tables = [
      new FlexTable<number>(),
      new FlexTable<string>()
    ]
    
    const expectedRowspan = [1, 1]
    const expectedLength = [0, 0]
    
    const actualRowspan = tables.map(table => table.rowspan)
    const actualLength = tables.map(table => table.length)
    
    deepStrictEqual(actualRowspan, expectedRowspan)
    deepStrictEqual(actualLength, expectedLength)
  })

  it('添加数据和创建新行', function () {
    const table = new FlexTable<string>()
    
    // 执行操作序列
    const operations = [
      () => table.push('a').push('b'),
      () => table.newline().push('c').push('d').push('e'),
      () => table.newline().push('f'),
      () => table.push('g')
    ]
    
    operations.forEach(op => op())
    
    const expectedRowspan = 3
    const expectedLength = 7
    
    deepStrictEqual(table.rowspan, expectedRowspan)
    deepStrictEqual(table.length, expectedLength)
  })

  it('替换和修改数据', function () {
    const table = new FlexTable<number>()
    
    // 构建测试数据
    table.push(1).push(2).newline().push(3).push(4).push(5)
    
    // 执行替换操作
    const replaceOperations = [
      () => table.replace(0, 1, 20),
      () => table.replace(1, 0, 30),
      () => table.replace(1, 2, 50)
    ]
    
    replaceOperations.forEach(op => op())
    
    // 收集结果
    const results: number[] = []
    table.each((value) => { 
      results.push(value)
    })
    
    const expectedResults = [1, 20, 30, 4, 50]
    
    deepStrictEqual(results, expectedResults)
  })

  it('删除和插入数据', function () {
    const table = new FlexTable<string>()
    
    // 构建测试数据
    table.push('a').push('b').push('c').newline().push('d').push('e')
    
    // 执行splice操作
    const spliceOperations = [
      () => table.splice(0, 1, 1, 'B'), // 在位置(0,1)删除1个元素，插入'B'
      () => table.splice(1, 0, 0, 'D'), // 在位置(1,0)删除0个元素，插入'D'
      () => table.splice(0, 2, 0),      // 在位置(0,2)删除0个元素，不插入
      () => table.splice(1, 1, 1, 'E', 'F') // 在位置(1,1)删除1个元素，插入'E','F'
    ]
    
    spliceOperations.forEach(op => op())
    
    // 收集结果
    const results: string[] = []
    table.each((value) => { 
      results.push(value)
    })
    
    const expectedResults = ['a', 'B', 'c', 'D', 'E', 'F', 'e']
    
    deepStrictEqual(results, expectedResults)
  })

  it('弹出数据', function () {
    const table = new FlexTable<number>()
    
    // 构建测试数据
    table.push(1).push(2).newline().push(3).push(4).push(5)
    
    // 依次弹出数据
    const popped: (number | null)[] = []
    for (let i = 0; i < 7; i++) {
      popped.push(table.pop())
    }
    
    const expectedPopped = [5, 4, 3, 2, 1, null, null]
    const expectedLength = 0
    const expectedRowspan = 0
    
    deepStrictEqual(popped, expectedPopped)
    deepStrictEqual(table.length, expectedLength)
    deepStrictEqual(table.rowspan, expectedRowspan)
  })

  it('遍历数据', function () {
    const table = new FlexTable<string>()
    
    // 构建测试数据
    table.push('a').push('b').newline().push('c').push('d')
    
    // 正序遍历
    const eachResults: {value: string, row: number, col: number}[] = []
    table.each((value, row, col) => {
      eachResults.push({ value, row, col })
    })
    
    // 反序遍历
    const reverseEachResults: {value: string, row: number, col: number}[] = []
    table.reverseEach((value, row, col) => {
      reverseEachResults.push({ value, row, col })
    })
    
    const expectedEachResults = [
      { value: 'a', row: 0, col: 0 },
      { value: 'b', row: 0, col: 1 },
      { value: 'c', row: 1, col: 0 },
      { value: 'd', row: 1, col: 1 }
    ]
    
    const expectedReverseEachResults = [
      { value: 'd', row: 1, col: 1 },
      { value: 'c', row: 1, col: 0 },
      { value: 'b', row: 0, col: 1 },
      { value: 'a', row: 0, col: 0 }
    ]
    
    deepStrictEqual(eachResults, expectedEachResults)
    deepStrictEqual(reverseEachResults, expectedReverseEachResults)
  })

  it('清空数据', function () {
    const table = new FlexTable<number>()
    
    // 添加数据
    table.push(1).push(2).newline().push(3)
    
    const beforeClear = {
      length: table.length,
      rowspan: table.rowspan
    }
    
    // 清空数据
    table.clear()
    
    // 验证可以重新添加数据
    table.newline().push(10)
    
    const afterReAdd = {
      length: table.length,
      rowspan: table.rowspan
    }
    
    const expectedBeforeClear = {
      length: 3,
      rowspan: 2
    }
    
    const expectedAfterReAdd = {
      length: 1,
      rowspan: 1
    }
    
    deepStrictEqual(beforeClear, expectedBeforeClear)
    deepStrictEqual(afterReAdd, expectedAfterReAdd)
  })
})