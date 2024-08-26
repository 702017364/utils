import { Assign } from '@vope/types'
import { isFunction, isObject } from 'lodash-es'

type NativeValue = BooleanConstructor | NumberConstructor | DateConstructor | BigIntConstructor | RegExpConstructor | StringConstructor

interface AccessorValue<T = any> { 
  cube(text: string): T
  flat?(value: T): string
}

type SimplifyValue = ((text: string) => any)

type Value = NativeValue | SimplifyValue | AccessorValue

/**
 * 转换套件类型
 */
type Values = Record<string, Value>

export {
  Values as URLParamsValues
}

type SimplifyBranch<T, Branch extends boolean> = Branch extends true
  ? T extends object
    ? Assign<T, { toString?(this: T): string }>
    : T
  : T

type Cube<T, Branch extends boolean> = [T] extends [DateConstructor]
  ? Date
  : [T] extends [NativeValue]
    ? T extends ((value: string) => infer A)
      ? A
      : string
    : [T] extends [(text: string) => infer S]
      ? SimplifyBranch<S, Branch>
      : [T] extends [AccessorValue<infer B>]
        ? B
        : string

type Cubes<T extends Values, Branch extends boolean = false> = {
  [P in keyof T]: Cube<T[P], Branch>
}

/**
 * 将URL查询参数转换成(复杂)对象
 * @param text URL查询参数字符串
 * @param serializes 转换套件
 */
export const cubeURLParams = <T extends Values>(text: string, serializes: T) => { 
  const params = new URLSearchParams(text)
  const result = {} as Record<string, any>
  for (const [key, value] of params) { 
    const serialize = serializes[key]
    switch (serialize) { 
      case Boolean:
        result[key] = value === 'true'
        break
      case Number:
        result[key] = Number(value)
        break
      case Date:
        result[key] = new Date(value)
        break
      case BigInt:
        result[key] = BigInt(value)
        break
      case RegExp:
        result[key] = new RegExp(value)
        break
      default:
        if (isFunction(serialize)) {
          result[key] = serialize(value)
        } else if (isObject(serialize) && isFunction(serialize.cube)) {
          result[key] = serialize.cube(value)
        } else { 
          result[key] = value
        }
    }
  }
  return result as Cubes<T>
}

const re_flat = /\+/g

const flatEncode = (text: string) =>
  text.replace(re_flat, () => '%2B')

const flatValue = (value: any) => { 
  switch (typeof value) { 
    case 'boolean':
    case 'bigint':
    case 'number':
    case 'symbol':
    case 'function':
      return (<boolean | bigint | number | symbol | Function>value).toString()
    case 'string':
      return flatEncode(value)
    case 'undefined':
      return ''
    default:
      if (value === null) { 
        return ''
      }
      if (value instanceof Date) {
        return value.toJSON()
      } else if (value instanceof RegExp) {
        return flatEncode(value.source)
      } else { 
        return flatEncode((<object>value).toString())
      }
  }
}

/**
 * 符合套件的(复杂)数据类型
 */
export type URLParamsFlats<T extends Values> = Cubes<T, true>

/**
 * 将(复杂)对象转换成URL查询参数
 * @param data 符合套件格式的(复杂)对象
 * @param serializes 转换套件
 */
export const flatURLParams = <T extends Values>(data: URLParamsFlats<T>, serializes: T) => { 
  const params = new URLSearchParams()
  for (const key in data) { 
    const value = data[key]
    const serialize = serializes[key]
    let result: string
    switch (serialize) { 
      case Boolean:
        result = typeof value === 'boolean' ? `${value}` : ''
        break
      case Number:
        result = typeof value === 'number' ? `${value}` : ''
        break
      case Date:
        result = value instanceof Date ? value.toJSON() : ''
        break
      case BigInt:
        result = typeof value === 'bigint' ? `${value}` : ''
        break
      case RegExp:
        result = value instanceof RegExp ? flatEncode(value.source) : ''
        break
      case String:
        result = typeof value === 'string' ? flatEncode(value) : ''
        break
      default:
        if (isFunction(serialize)) {
          result = flatValue(value)
        } else if (isObject(serialize) && isFunction(serialize.flat)) {
          result = serialize.flat(value)
        } else { 
          result = flatValue(value)
        }
    }
    params.append(key, result)
  }
  return params.toString()
}
