import { getEncoding } from '@vope/utils'
import { deepStrictEqual } from 'assert'
import iconv from 'iconv-lite'

describe('getEncoding()', function () {
  const text = '*1*我是中国人*1*'

  it('识别各种编码格式', function () {
    const testCases = [
      {
        buffer: iconv.encode(text, 'gbk'),
        expected: 'gbk'
      },
      {
        buffer: iconv.encode(text, 'utf-16le', { addBOM: true }),
        expected: 'utf-16le'
      },
      {
        buffer: iconv.encode(text, 'utf-16be', { addBOM: true }),
        expected: 'utf-16be'
      },
      {
        buffer: iconv.encode(text, 'utf-8'),
        expected: 'utf-8'
      },
      {
        buffer: iconv.encode(text, 'utf-8', { addBOM: true }),
        expected: 'utf-8'
      }
    ]

    const actuals = testCases.map(({ buffer }) => getEncoding(buffer).encoding)
    const expected = testCases.map(({ expected }) => expected)
    
    deepStrictEqual(actuals, expected)
  })

  it('正确识别BOM和偏移量', function () {
    const testCases = [
      {
        buffer: iconv.encode(text, 'utf-8', { addBOM: true }),
        expected: { encoding: 'utf-8', offset: 3 }
      },
      {
        buffer: iconv.encode(text, 'utf-16le', { addBOM: true }),
        expected: { encoding: 'utf-16le', offset: 2 }
      },
      {
        buffer: iconv.encode(text, 'utf-16be', { addBOM: true }),
        expected: { encoding: 'utf-16be', offset: 2 }
      },
      {
        buffer: iconv.encode(text, 'gbk'),
        expected: { encoding: 'gbk', offset: 0 }
      }
    ]

    const actuals = testCases.map(({ buffer }) => getEncoding(buffer))
    const expected = testCases.map(({ expected }) => expected)
    
    deepStrictEqual(actuals, expected)
  })
})