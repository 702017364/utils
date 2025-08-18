import { Cron, isDigitsValue } from '@vope/utils'
import { deepStrictEqual, strictEqual } from 'assert'
import { isNumber } from 'lodash-es'

describe('class Cron', function () { 
  const equal = (cron: Cron, list: (string | [string, string])[]) => { 
    const actuals: string[] = []
    const expecteds: string[] = []

    list.forEach((data) => { 
      const [text, expected] = Array.isArray(data) ? data : [data]
      actuals.push(expected ?? text)
      const parse = cron.parse(text)
      expecteds.push(
        parse
          ? parse.text()
          : ''
      )
    })

    return deepStrictEqual(actuals, expecteds)
  }

  it('Default', () => { 
    equal(
      new Cron(),
      [
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
        ['0 0 0 ? * sat,Mon-thU,0', '0 0 0 ? * 6,1-4,0'],
        '0 0 0 1 1 ? 2008/4',
        '0 * * L * ?',

        ['60 0 0 * * *', ''],
        ['0 0 0 L-3-L-1 * ?', ''],
      ]
    )
  })

  it('enableSlot = false', () => { 
    const day = new Cron({
      enableSlot: false,
    }).parse('0 0 0 5 * *')?.day

    let result: unknown
    if (isDigitsValue(day)) { 
      const { values } = day
      if (Array.isArray(values) && values.length === 1) { 
        const tmp = values[0]
        if (isNumber(tmp)) { 
          result = tmp
        }
      }
    }

    strictEqual(result, 5)
  })

  it('enableSecond = false', () => { 
    equal(
      new Cron({
        enableSecond: false,
      }),
      [
        '0 0 5 * *',
        ['0 0 0 5 * *', ''],
      ]
    )
  })

  it('enableYear = false', () => { 
    equal(
      new Cron({
        enableYear: false,
      }),
      [
        ['0 0 0 5 * * 2000', ''],
      ]
    )
  })

  it('enableInvalid = false', () => { 
    equal(
      new Cron({
        enableInvalid: false,
      }),
      [
        ['0 0 0 ? * 5', ''],
        ['0 0 0 5 * ?', ''],
      ]
    )
  })

  it('enableDayLast = false', () => { 
    equal(
      new Cron({
        enableDayLast: false,
      }),
      [
        ['0 0 0 L * ?', ''],
        ['0 0 0 L-1 * ?', ''],
      ]
    )
  })

  it('enableWeekLast = false', () => { 
    equal(
      new Cron({
        enableWeekLast: false,
      }),
      [
        ['0 0 0 ? * 0L', ''],
      ]
    )
  })

  it('enableWeekSupport7 = false', () => { 
    equal(
      new Cron({
        enableWeekSupport7: false,
      }),
      [
        ['0 0 0 ? * 7', ''],
      ]
    )
  })

  it('enableWeekSupportDic = false', () => { 
    equal(
      new Cron({
        enableWeekSupportDic: false,
      }),
      [
        ['0 0 0 ? * SUN', ''],
      ]
    )
  })

  it('enableDicEnumSupportMixin = false', () => { 
    equal(
      new Cron({
        enableDicEnumSupportMixin: false,
      }),
      [
        ['0 0 0 ? * Sun', ''],
      ]
    )
  })

  it('enablePrefixZero = true', () => { 
    equal(
      new Cron({
        enablePrefixZero: true,
      }),
      [
        ['0 0 0 ? * 01', '0 0 0 ? * 1'],
      ]
    )
  })

  it('set', () => { 
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

    deepStrictEqual(actuals, [
      '5 20,40 0/3 2,15,L-1 1,7,8 ? 2020-2030',
      '5 20,40 0/3 ? 1,7,8 1,3 2020-2030',
    ])
  })
})