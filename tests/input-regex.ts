import { inputRegex } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('inputRegex()', function () {
  it('转义特殊字符', function () {
    const testCases = [
      {
        input: '$()*+.[?\\^{|-',
        flags: false,
        expected: '\\$\\(\\)\\*\\+\\.\\[\\?\\\\\\^\\{\\|\\-'
      },
      {
        input: '$()*+.[?\\^{|',
        flags: undefined,
        expected: '\\$\\(\\)\\*\\+\\.\\[\\?\\\\\\^\\{\\|'
      },
      {
        input: '$()*+.[?\\^{|',
        flags: 'g',
        expected: '\\$\\(\\)\\*\\+\\.\\[\\?\\\\\\^\\{\\|'
      }
    ]

    const stringResults = testCases
      .filter(({ flags }) => flags === false)
      .map(({ input }) => inputRegex(input, false))
    
    const regexResults = testCases
      .filter(({ flags }) => flags !== false)
      .map(({ input, flags }) => inputRegex(input, flags as string).source)

    const expectedStringResults = testCases
      .filter(({ flags }) => flags === false)
      .map(({ expected }) => expected)
      
    const expectedRegexResults = testCases
      .filter(({ flags }) => flags !== false)
      .map(({ expected }) => expected)

    deepStrictEqual(stringResults, expectedStringResults)
    deepStrictEqual(regexResults, expectedRegexResults)
  })

  it('处理各种正则表达式标志', function () {
    const testCases = [
      {
        input: 'test',
        flags: 'g',
        expected: { source: 'test', flags: 'g' }
      },
      {
        input: 'test',
        flags: 'gi',
        expected: { source: 'test', flags: 'gi' }
      },
      {
        input: 'test',
        flags: 'gm',
        expected: { source: 'test', flags: 'gm' }
      }
    ]

    const actuals = testCases.map(({ input, flags }) => {
      const regex = inputRegex(input, flags)
      return { source: regex.source, flags: regex.flags }
    })
    
    const expected = testCases.map(({ expected }) => expected)

    deepStrictEqual(actuals, expected)
  })
})