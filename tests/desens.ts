import { desensDecrypt, desensEncrypt, desensReplace } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('desens', function () { 
  const plaintext = '18577012023|340798180012301234'
  const radixs = [16, 10]
  let data: ReturnType<typeof desensEncrypt>
  
  it('desensEncrypt()', function () { 
    const ranges: [number, number][] = [
      [3, 6],
      [18, 25],
    ]
    let count = 0
    data = desensEncrypt(plaintext, (text) => { 
      return ranges.map((range) => { 
        const value = text.slice(range[0], range[1] + 1)
        const ciphertext = (Number.parseInt(value) << 2).toString(radixs[count++ % radixs.length])
        return { range, ciphertext }
      })
    })

    deepStrictEqual(data.ciphertext, '18578542023|340798720049201234')
  })

  it('desensDecrypt()', function () { 
    let count = 0
    const testCases = [
      desensDecrypt(data.ciphertext, data.rules, (part) => { 
        const value = Number.parseInt(part, radixs[count++ % radixs.length]) >> 2
        return value.toString()
      }),
      
      // 单个规则解密测试
      desensDecrypt('abc***def', { range: [3, 5], modify: 3 }, () => 'XYZ'),
      
      // 多个规则解密测试
      desensDecrypt(
        '185***2023|340798******1234', 
        [
          { range: [3, 5], modify: 3 },
          { range: [17, 22], modify: 6 }
        ],
        (part) => {
          if (part === '***') return '770'
          if (part === '******') return '18001230'
          return part
        }
      ),
      
      // 空规则测试
      desensDecrypt('test', [], (part) => part),
      
      // 单字符替换测试
      desensDecrypt('*bcd', { range: [0, 0], modify: 1 }, () => 'a'),
    ]

    const expected = [
      plaintext,
      'abcXYZdef',
      '1857702023|340798180012301234',
      'test',
      'abcd'
    ]

    deepStrictEqual(testCases, expected)
  })

  it('desensReplace()', function () { 
    const result = desensReplace(data.ciphertext, data.rules, '*')
    deepStrictEqual(result, '185****2023|340798********1234')
  })
})