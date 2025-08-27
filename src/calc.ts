import type { PartialRecord } from '@vope/types'
import { isNumber } from 'lodash-es'

const { parseFloat } = Number

type Ls = `${string}(${string})` | `${number}${string}` | `-${number}${string}`

type Lv = Ls | number

export namespace Calc {
  export type Value = Lv

  export interface Clamp { 
    min?: Lv
    max?: Lv
  }
}

const formatter = (value: Lv) => isNumber(value)
  ? value && `${value}px` as const
  : value

interface Calc { 
  (...list: Lv[]): 0 | Ls

  formatter: typeof formatter
}

export const isCalc = (value: Ls): value is `calc(${string})` => 
  value.slice(0, 5) === 'calc(' && value.slice(-1) === ')'

const re_numerical = /^(-?(?:\.\d+|\d+(?:\.\d+)?))([a-zA-Z]+|%)$/
const re_zero = /^0[a-zA-Z]+$/

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

  push(value: Lv, index: number) { 
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

const calc = (...list: Lv[]) => {
  const size = list.length
  if (size === 0) return 0
  if(size === 1) return formatter(list[0])
  const manager = new Manager()
  list.forEach((value, index) => manager.push(value, index))
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

    return tmp[0] === '-'
      ? `${caches} - ${tmp.slice(1)}`
      : `${caches} + ${tmp}`
  }, '')
  return !value || re_zero.test(value)
    ? 0
    : `calc(${value})` as const
}

calc.formatter = formatter

const zero = '0px'
const u = undefined

calc.clamp = (value: Lv, { min, max }: Calc.Clamp): Ls | 0 => { 
  const val = calc.formatter(value)
  if (min !== u && max !== u) {
    return `clamp(${calc.formatter(min) || zero}, ${val || zero}, ${calc.formatter(max) || zero})`
  } else if (max !== u) {
    return `max(${calc.formatter(max) || zero}, ${val || zero})`
  } else if (min !== u) {
    return `min(${calc.formatter(min) || zero}, ${val || zero})`
  } else { 
    return val
  }
}

export default calc