import { isString } from 'lodash-es'
import { isNull } from '../is/null'
import { Properties, PropertiesHyphen } from 'csstype'

export interface CSSProperties extends Properties<string | number>, PropertiesHyphen<string | number> { 
  [v: `--${string}`]: string | number | undefined
}

export type StyleValue = false | null | undefined | string | CSSProperties | Array<StyleValue>

const hump = /[A-Z]/g

/**
 * Css合并
 */
export const css = (...args: StyleValue[]) => { 
  const list: string[] = []
  for (let i = 0; i < args.length; i++) { 
    const data = args[i]
    if (!data) continue
    if (isString(data)) {
      list.push(data)
    } else if (Array.isArray(data)) {
      const result = css(...data)
      result && list.push(result)
    } else { 
      for (const key in data) { 
        const value = data[<keyof typeof data>key]
        isNull(value) || list.push(`${key.replace(hump, ($0) => '-' + $0.toLocaleLowerCase())}: ${value}`)
      }
    }
  }
  return list.join(';')
}