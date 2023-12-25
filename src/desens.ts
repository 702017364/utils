import { isString } from 'lodash-es'

interface Rule { 
  /** 加密的开始(包含)和结束(包含)位置(位置信息基于明文) */
  range: [number, number]
}

interface DecryptRule extends Rule { 
  /** 密文长度 */
  modify: number
}

interface EncryptRule extends Rule { 
  /** 密文 */
  ciphertext: string
}

/**
 * 脱敏加密(对明文进行多个片段加密)
 * @param plaintext 明文
 * @param encrypt 加密方法 
 * @returns 解密要素
 */
export const desensEncrypt = (plaintext: string, encrypt: (plaintext: string) => EncryptRule[]) => { 
  const rules: DecryptRule[] = []
  let point = -1
  let ciphertext = encrypt(plaintext).reduce((cache, { range, ciphertext }) => { 
    cache += plaintext.slice(point + 1, range[0]) + ciphertext
    point = range[1]
    rules.push({
      range,
      modify: ciphertext.length,
    })
    return cache
  }, '')
  if (point !== -1) { 
    ciphertext += plaintext.slice(point + 1)
  }
  return {
    ciphertext,
    rules,
  }
}

/**
 * 脱敏解密(对密文进行多个片段解密)
 * @param plaintext 密文
 * @param rules 解密要素
 * @param decrypt 解密方法
 */
export const desensDecrypt = (ciphertext: string, rules: DecryptRule | DecryptRule[], decrypt: (ciphertext: string) => string) => { 
  Array.isArray(rules) || (rules = [rules])
  let offset = 0
  let from = 0
  return rules.reduce((cache, { range: [start, stop], modify }) => { 
    cache += ciphertext.slice(from, start + offset) + decrypt(ciphertext.slice(start + offset, start + offset + modify))
    from = start + offset + modify
    offset += modify - (stop + 1 - start)
    return cache
  }, '') + ciphertext.slice(from)
}

type Replacer = string | { 
  [Symbol.replace](text: string, size: number): string
}

/**
 * 脱敏平替
 * @param plaintext 密文
 * @param rules 解密要素
 * @param replacer 替换者
 */
export const desensReplace = (ciphertext: string, rules: DecryptRule | DecryptRule[], replacer: Replacer = '*') => { 
  Array.isArray(rules) || (rules = [rules])
  let offset = 0
  let from = 0
  return rules.reduce((cache, { range: [start, stop], modify }) => { 
    const part = ciphertext.slice(start + offset, start + offset + modify)
    const size = stop + 1 - start
    const replaceValue = isString(replacer)
      ? replacer.repeat(size)
      : replacer[Symbol.replace](part, size)
    cache += ciphertext.slice(from, start + offset) + replaceValue
    from = start + offset + modify
    offset += modify - (size)
    return cache
  }, '') + ciphertext.slice(from)
}