import { Cron } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('class Cron', function () {
  it('默认配置解析表达式', function () {
    const cron = new Cron()
    
    const testCases = [
      '0,5,10 * * * * ?',
      '*/5 * * * * ?',
      '0 0,30 10-16 ? * 1-5',
      '0 30 2 1-15/2 * *',
      '0 * * * 1-5 6-7',
      '0 0 0 3,L-3 * ?',
      '0 0 0 L-3,3 * ?',
      '0 0 0 2,4-6,10,20-22 * ?',
      '0 0 0 4-6,10,20-22,30 * ?',
      '0 0 0 ? * 0L',
      '0 0 0 ? 2,5-8 3,0L',
      '0 0 0 1 1 ? 2008/4',
      '0 * * L * ?',
    ]

    const actuals = testCases.map(text => cron.parse(text)?.text() || '')
    const expected = testCases
    
    deepStrictEqual(actuals, expected)
  })

  it('无效表达式返回空', function () {
    const cron = new Cron()
    
    const invalidCases = [
      '60 0 0 * * *',
      '0 0 0 L-3-L-1 * ?',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['', '']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用秒字段配置', function () {
    const cron = new Cron({
      enableSecond: false,
    })
    
    const validCases = [
      '0 0 5 * *',
    ]
    
    const invalidCases = [
      '0 0 0 5 * *',
    ]

    const validActuals = validCases.map(text => cron.parse(text)?.text() || '')
    const validExpected = validCases
    
    const invalidActuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const invalidExpected = ['']
    
    deepStrictEqual(validActuals, validExpected)
    deepStrictEqual(invalidActuals, invalidExpected)
  })

  it('禁用年字段配置', function () {
    const cron = new Cron({
      enableYear: false,
    })
    
    const invalidCases = [
      '0 0 0 5 * * 2000',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用无效日期配置', function () {
    const cron = new Cron({
      enableInvalid: false,
    })
    
    const invalidCases = [
      '0 0 0 ? * 5',
      '0 0 0 5 * ?',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['', '']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用日期最后一天配置', function () {
    const cron = new Cron({
      enableDayLast: false,
    })
    
    const invalidCases = [
      '0 0 0 L * ?',
      '0 0 0 L-1 * ?',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['', '']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用星期最后一天配置', function () {
    const cron = new Cron({
      enableWeekLast: false,
    })
    
    const invalidCases = [
      '0 0 0 ? * 0L',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用星期数字7配置', function () {
    const cron = new Cron({
      enableWeekSupport7: false,
    })
    
    const invalidCases = [
      '0 0 0 ? * 7',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['']
    
    deepStrictEqual(actuals, expected)
  })

  it('禁用星期字典配置', function () {
    const cron = new Cron({
      enableWeekSupportDic: false,
    })
    
    const invalidCases = [
      '0 0 0 ? * SUN',
    ]

    const actuals = invalidCases.map(text => cron.parse(text)?.text() || '')
    const expected = ['']
    
    deepStrictEqual(actuals, expected)
  })

  it('启用前导零配置', function () {
    const cron = new Cron({
      enablePrefixZero: true,
    })
    
    const testCases = [
      ['0 0 0 ? * 01', '0 0 0 ? * 1'],
    ]

    const actuals = testCases.map(([input]) => cron.parse(input)?.text() || '')
    const expected = testCases.map(([, output]) => output)
    
    deepStrictEqual(actuals, expected)
  })

  it('设置字段值', function () {
    const parse = new Cron().parse('0 0 0 ? * 0')!
    parse.setSecond(5)
    parse.setMinute([20, 40])
    parse.setHour(0, 3)
    parse.setDay([2, 15, 'L-1'])
    parse.setMonth([1, 7, 8])
    parse.setYear([[2020, 2030]])

    const actuals = [
      parse.text()
    ]

    parse.setWeek([1, 3])
    actuals.push(parse.text())

    const expected = [
      '5 20,40 0/3 2,15,L-1 1,7,8 ? 2020-2030',
      '5 20,40 0/3 ? 1,7,8 1,3 2020-2030',
    ]
    
    deepStrictEqual(actuals, expected)
  })
})