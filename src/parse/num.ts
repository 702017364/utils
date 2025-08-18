import { isNumber } from 'lodash-es'

const { MAX_SAFE_INTEGER, NaN } = Number

const pow = Math.floor(Math.log10(MAX_SAFE_INTEGER))

const re_num = /^([-+]?)0*(\d+)(?:(n)|(?:\.(\d+))?(?:[Ee]([-+]?)(\d+))?)$/

/**
 * 解析一个字符串并返回一个数字
 * @description 1、number最多支持16位小数
 * @description 2、最终值为bigint则会把小数部分舍去
 * @description 3、支持科学计数法形式的字符串
 * @description 4、无法正确解析的值则会返回NaN
 */
export const parseNum = (num: number | bigint | string) => { 
  if (isNumber(num) || typeof num === 'bigint') return num
  const match = num.match(re_num)
  if (!match) return NaN
  const [, valueSymbol, integer, bigint, decimal, powSymbol, powValue] = match
  if (bigint === 'n') return BigInt(valueSymbol + integer)
  const powSize = integer.length - 1 + (
    powValue
      ? powSymbol === '-'
        ? -powValue
        : +powValue
      : 0
  )
  if (powSize < pow || (powSize === pow && +integer.slice(0, -1) < MAX_SAFE_INTEGER / 10)) return +num
  try {
    const bigValue = BigInt(integer.slice(0, powSize + 1).padEnd(powSize + 1, '0'))
    let smallValue: bigint
    if (decimal && powValue && powSymbol !== '-') {
      const powNum = +powValue
      const effectDecimal = decimal.slice(0, Math.min(pow, powNum))
      const tinyValue = decimal.length > pow && powNum > pow
        ? BigInt(+decimal.slice(pow, powNum)) * BigInt(10 ** Math.max(powNum - decimal.length, 0))
        : BigInt(0)
      smallValue = BigInt(effectDecimal) * BigInt(10 ** (powNum - effectDecimal.length)) + tinyValue
    } else { 
      smallValue = BigInt(0)
    }
    const value = bigValue + smallValue
    return valueSymbol === '-'
      ? value * BigInt(-1)
      : value
  } catch { 
    return NaN
  }
}