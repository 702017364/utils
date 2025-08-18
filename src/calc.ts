import { isNumber } from 'lodash-es'

type Ls = `${string}(${string})` | `${number}${string}`

type Lv = Ls | number

export namespace Calc {
  export type Value = Lv
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

const calc = ((...list: Lv[]) => { 
  const size = list.length
  if (size === 0) return 0
  if (size === 1) return formatter(list[1])
  const value = list.reduce((caches, value) => {
    let tmp = formatter(value)
    if (tmp === 0) return caches
    if (isCalc(tmp)) {
      tmp = tmp.slice(4) as `${string}(${string})`
    }
    return caches
      ? `${caches} + ${tmp}`
      : tmp
  }, '')
  return value === ''
    ? 0
    : `calc(${value})` as const
}) satisfies Omit<Partial<Calc>, keyof Calc> as Calc

calc.formatter = formatter

export { 
  calc,
}