import { Equal } from '@type-challenges/utils'
import { UnionToTuple } from '@vope/types'
import { isString } from 'lodash-es'
import { isKey } from '../is/key'

type NativeMap = {
  string: string
  boolean: boolean
  number: number
  bigint: bigint
  date: Date
  regexp: RegExp
  null: null
}

type NativeValue = keyof NativeMap

type NativeCubes = {
  [P in NativeValue]: (text: string) => NativeMap[P]
}

const cubes: NativeCubes = {
  string: (text) => text,
  boolean: (text) => text === 'true',
  number: (text) => Number(text),
  bigint: (text) => BigInt(text),
  date: (text) => new Date(text),
  regexp: (text) => new RegExp(text),
  null: () => null,
}

type NativeFlats = {
  [P in NativeValue]: (data: NativeMap[P]) => string
}

const flats: NativeFlats = {
  string: (data) => flatEncode(data),
  boolean: (data) => `${data}`,
  number: (data) => `${data}`,
  bigint: (data) => `${data}`,
  date: (data) => data.toJSON(),
  regexp: (data) => flatEncode(data.source),
  null: () => 'null'
}

interface AccessorValue<T = any> { 
  cube(text: string): T
  flat(value: T): string
}

type NativeUnion = UnionToTuple<{
  [P in NativeValue]: [NativeMap[P], P]
}[NativeValue]>

type Signal<T, U extends any[] = NativeUnion> = U extends [infer A1, ...infer A2]
  ? A1 extends [infer V, infer K]
    ? Equal<T, V> extends true
      ? K
      : Signal<T, A2>
    : Signal<T, A2>
  : never

/**
 * 转换套件类型
 */
export type Serializes<T extends object> = {
  [P in keyof T & string]: Signal<T[P]> | AccessorValue<T[P]>
}

type Cube<T> = [T] extends [NativeValue]
  ? NativeMap[T]
  : [T] extends [AccessorValue<infer B>]
    ? B
    : never

type Cubes<T extends object, S extends Serializes<T>> = {
  [P in Extract<keyof T, keyof S> & string]: Cube<S[P]>
}

/**
 * 将URL查询参数转换成(复杂)对象
 * @param text URL查询参数字符串
 * @param serializes 转换套件
 */
export const cubeURLParams = <T extends object, S extends Serializes<T>>(text: string, serializes: S) => { 
  const params = new URLSearchParams(text)
  const result = {} as Record<string, any>
  for (const [key, value] of params) { 
    const serialize = serializes[<Extract<keyof T, string>>key]
    if (!serialize) continue
    if (isString(serialize) && isKey(serialize, cubes)) {
      result[key] = cubes[serialize](value)
    } else { 
      result[key] = (<AccessorValue><unknown>serialize).cube(value)
    }
  }
  return <Cubes<T, S>>result
}

const re_flat = /\+/g

const flatEncode = (text: string) =>
  text.replace(re_flat, () => '%2B')

/**
 * 将(复杂)对象转换成URL查询参数
 * @param data 数据
 * @param serializes 转换套件
 */
export const flatURLParams = <T extends object, S extends Serializes<T>>(data: T, serializes: S) => { 
  const params = new URLSearchParams()
  for (const key in data) { 
    const value = data[key]
    const serialize = serializes[key]
    if (!serialize) continue
    params.append(
      key,
      isString(serialize) && isKey(serialize, flats)
        ? flats[serialize](<any>value)
        : (<AccessorValue><unknown>serialize).flat(value)
    )
  }
  return params.toString()
}
