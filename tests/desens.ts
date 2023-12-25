import { desensDecrypt, desensEncrypt, desensReplace } from '@vope/utils'
import { strictEqual } from 'assert'

describe('desens', function () { 
  const plaintext = '18577012023|340798180012301234'
  let data: ReturnType<typeof desensEncrypt>
  
  it('desensEncrypt()', function () { 
    const ranges: [number, number][] = [
      [3, 6],
      [18, 25],
    ]
    data = desensEncrypt(plaintext, (text) => { 
      return ranges.map((range) => { 
        const value = text.slice(range[0], range[1] + 1)
        let ciphertext = ''
        for (let i = 0; i < value.length; i += 2) {
          ciphertext += String.fromCharCode((value.charCodeAt(i) << 8) + value.charCodeAt(i + 1))
        }
        return { range, ciphertext }
      })
    })

    strictEqual(data.ciphertext, '185㜷〱2023|340798ㄸ〰ㄲ㌰1234')
  })

  it('desensDecrypt()', function () { 
    const result = desensDecrypt(data.ciphertext, data.rules, (part) => { 
      let plaintext = ''
      for (let i = 0; i < part.length; i++) { 
        const code = part.charCodeAt(i)
        const cache = code >> 8
        plaintext += String.fromCharCode(cache, code - (cache << 8))
      }
      return plaintext
    })
    strictEqual(result, plaintext)
  })

  it('desensReplace()', function () { 
    const result = desensReplace(data.ciphertext, data.rules, '*')
    strictEqual(result, '185****2023|340798********1234')
  })
})