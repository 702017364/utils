import { inputRegex } from '@vope/utils'
import { deepStrictEqual } from 'assert'

const flags = [, 'g', false as const]
const polyfills = [true, false]

interface Item { 
  input: string
  expected: string
}

describe('inputRegex()', function () {
  const each = (items: Item[]) => { 
    const actuals: string[] = []
    const expecteds: string[] = []
    for (const { input, expected: value } of items) {
      let actual: string[] = []
      let expected: string[] = []
      for (const polyfill of polyfills) {
        for (const flag of flags) {
          const source = flag === false
            ? inputRegex(input, flag, polyfill)
            : inputRegex(input, flag, polyfill).source
          actual.push(source)
          expected.push(value)
        }
      }
      actuals.push(actual.join('|'))
      expecteds.push(expected.join('|'))
    }
    deepStrictEqual(actuals, expecteds)
  }

  it('首字符', function () { 
    each([
      { input: 'a', expected: '\\x61' },
      { input: 'aa', expected: '\\x61a' },
      { input: 'A', expected: '\\x41' },
      { input: '0', expected: '\\x30' },
      { input: '9', expected: '\\x39' },
      { input: '中', expected: '中' },
    ])
  })

  it('歧义字符', function () { 
    each([
      {
        input: `,-=<>#&!%:;@~'\`" `,
        expected: `\\x2c\\x2d\\x3d\\x3c\\x3e\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x60\\x22\\x20`,
      },
    ])
  })

  it('转义字符', function () { 
    each([
      {
        input: '$\\.*+^?()[\]{}|/',
        expected: '\\$\\\\\\.\\*\\+\\^\\?\\(\\)\\[\\]\\{\\}\\|\\/',
      },
    ])
  })

  it('空白符', function () { 
    each([
      {
        input: '\u000c\u000a\u000d\u0009\u000b',
        expected: '\\f\\n\\r\\t\\v',
      },
    ])
  })
})