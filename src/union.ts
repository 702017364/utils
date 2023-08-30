import { Revise } from '@vope/types'

type IMap<K extends string, VV extends string, T extends { [key in K]: string }> = {
  [key in VV]?: T
}

/**
 * 数据联合(用于需要对加入的数据进行智能提示)
 * @description 如果设置了formatter，则可以通过设置泛型R来变化Union.value的类型
 */
export default class Union<
  K extends string,
  VV extends string,
  T extends { [key in K]: string },
  R extends T = T,
  L extends VV | never = never,
> { 
  #map: IMap<K, VV, T> = {}

  get value() { 
    return <Required<IMap<K, L, R>>>this.#map
  }

  constructor(private key: K, private formatter?: (data: T) => R) { }

  add<V extends Exclude<VV, L>>(data: Revise<T, K, V>) { 
    const { formatter } = this
    this.#map[data[this.key] as unknown as V] = formatter
      ? formatter(data as T)
      : data as T
    return <Union<K, VV, T, R, L | V>>this
  }
}