import type { PartialRecord } from '@vope/types'
import { isNumber } from 'lodash-es'

const { parseFloat } = Number

type Ls = `${string}(${string})` | `${number}${string}` | `-${number}${string}`

export namespace Calc {
  export type Value = Ls | number

  export interface Clamp { 
    min?: Value
    max?: Value
  }
}

const re_numerical = /^(-?(?:\.\d+|\d+(?:\.\d+)?)(?:e\d+)?)([a-zA-Z]+|%)$/
const re_zero = /^0[a-zA-Z]+$/
const re_method_start = /[a-z]/i
const re_method_next = /^\w*\(/

const formatter = (value: Calc.Value) => { 
  if (isNumber(value)) { 
    return value && `${value}px` as const
  }
  const matchs = value.match(re_numerical) || (
    isCalc(value)
      ? value.slice(5, -1).match(re_numerical)
      : null
  )
  if (matchs) { 
    return matchs[1] === '0'
      ? 0
      : matchs[1] + matchs[2] as `${number}${string}`
  }
  return value
}

/**
 * 判断一个值是否为 calc 表达式
 */
export const isCalc = (value: Ls): value is `calc(${string})` => 
  value.slice(0, 5) === 'calc(' && value.slice(-1) === ')'

interface IValue { 
  value: string | number
  unit?: string 
}

class Memory { 
  data: PartialRecord<number, IValue> = {}

  memory: PartialRecord<string, number> = {}

  add(index: number, value: string): void
  add(index: number, value: number, unit: string): void
  add(index: number, value: number | string, unit?: string) { 
    const { data, memory } = this
    if (!isNumber(value)) {
      data[index] = { value }
    } else { 
      const point = memory[unit!]
      if (point === void 0) {
        data[index] = { value, unit }
        memory[unit!] = index
      } else { 
        const tmp = data[point]!
        tmp.value = (tmp.value as number) + value
      }
    }
  }
}

class Manager {
  private memory = new Memory() 

  push(value: Calc.Value, index: number) { 
    const { memory } = this
    if (isNumber(value)) return memory.add(index, value, 'px')
    const matchs = value.match(re_numerical)
    if (matchs) return memory.add(index, parseFloat(matchs[1]), matchs[2])
    if (!isCalc(value)) return memory.add(index, value)
    const tmp = value.slice(5, -1).match(re_numerical)
    tmp
      ? memory.add(index, parseFloat(tmp[1]), tmp[2])
      : memory.add(index, value.slice(4))
  }

  at(index: number) { 
    return this.memory.data[index]
  }
}

/**
 * CSS 长度值加减混合运算
 */
const calc = (...list: Calc.Value[]) => {
  const size = list.length
  if (size === 0) return 0
  if(size === 1) return formatter(list[0])
  const manager = new Manager()
  list.forEach((value, index) => manager.push(value, index))
  let count = 0
  const value = list.reduce((caches, _, index) => {
    const data = manager.at(index)
    if (!data || data.value === 0) return caches
    const { value, unit } = data
    let tmp: string
    if (isNumber(value)) {
      tmp = value + unit!
    } else { 
      tmp = value
    }
    if (!caches) return tmp
    count++
    return tmp[0] === '-'
      ? `${caches} - ${tmp.slice(1)}`
      : `${caches} + ${tmp}`
  }, '')
  return !value
    ? 0
    : count === 0
      ? re_zero.test(value)
        ? 0
        : value as Ls
      : `calc(${value})` as const
}

let exp_max_method_name: string | null = null

const isMethod = (value: Ls) => { 
  if (!re_method_start.test(value)) { 
    exp_max_method_name = null
    return false
  }
  const matchs = value.slice(1).match(re_method_next)
  if (!matchs || value.slice(-1) !== ')') { 
    exp_max_method_name = null
    return false
  }
  const size = matchs[0].length
  let count = 0
  for (let i = size + 1; i < value.length - 1; i++) { 
    const c = value[i]
    if (c === '(') { 
      count++
    } else if (c === ')' && count-- === 0) { 
      exp_max_method_name = null
      return false
    }
  }
  if (count === 0) {
    exp_max_method_name = value.slice(0, size)
    return true
  } else { 
    exp_max_method_name = null
    return false
  }
}

/**
 * 获取表达式方法名
 * @description 如果表达式不是一个方法调用则返回 null
 */
calc.getExpMN = (value: Ls) => { 
  isMethod(value)
  return exp_max_method_name
}

/**
 * CSS 长度值乘法运算
 */
calc.multiply = (value: Calc.Value, multiple: number) => { 
  if (value === 0 || multiple === 0) return 0
  if (isNumber(value)) return `${value * multiple}px` as const
  if (multiple === 1) return value
  const tmp = formatter(value)
  if (!tmp) return 0
  const matchs = tmp.match(re_numerical)
  return matchs
    ? parseFloat(matchs[1]) * multiple + matchs[2] as `${number}${string}`
    : isCalc(tmp)
      ? `calc(${tmp.slice(4)} * ${multiple})` as const
      : isMethod(tmp)
        ? `calc(${tmp} * ${multiple})` as const
        : `calc((${value}) * ${multiple})` as const
}

/**
 * CSS 长度值除法运算
 */
calc.divide = (value: Calc.Value, divisor: number) => { 
  if (divisor === 0) throw new Error('The divisor cannot be 0')
  if (value === 0) return 0
  if (divisor === 1) return formatter(value)
  const tmp = formatter(value)
  if (!tmp) return 0
  const matchs = tmp.match(re_numerical)
  return matchs
    ? parseFloat(matchs[1]) / divisor + matchs[2] as `${number}${string}`
    : isCalc(tmp)
      ? `calc(${tmp.slice(4)} / ${divisor})` as const
      : isMethod(tmp)
        ? `calc(${tmp} / ${divisor})` as const
        : `calc((${value}) / ${divisor})` as const
}

/**
 * CSS 长度值格式化
 */
calc.formatter = formatter

const zero = '0px'
const u = void 0

/**
 * CSS 长度值取中间值运算
 */
calc.clamp = (value: Calc.Value, { min, max }: Calc.Clamp) => { 
  const val = formatter(value) || zero
  if (min !== u && max !== u) {
    min = formatter(min) || zero
    max = formatter(max) || zero
    return min === max
      ? max
      : `clamp(${min}, ${val}, ${max})` as const
  } if (max !== u) {
    max = formatter(max) || zero
    return max === zero
      ? val
      : `max(${max}, ${val})` as const
  } else if (min !== u) {
    min = formatter(min) || zero
    return min === val
      ? val
      : `min(${min}, ${val})` as const
  } else { 
    return val === zero
      ? 0
      : val
  }
}

export default calc