import { Revise } from '@vope/types'

type IMap<K extends string, VV extends string, T extends { [key in K]: string }> = {
  [key in VV]?: T
}

/**
 * 数据联合(用于需要对加入的数据进行智能提示)
 */
export default class Union<
  K extends string,
  VV extends string,
  T extends { [key in K]: string },
  L extends VV | never = never,
> { 
  #map: IMap<K, VV, T> = {}

  get value() { 
    return <Required<IMap<K, L, T>>>this.#map
  }

  constructor(private key: K, private formater?: (data: T) => T) { }

  add<V extends Exclude<VV, L>>(data: Revise<T, K, V>) { 
    const { formater } = this
    this.#map[data[this.key] as unknown as V] = formater
      ? formater(data as T)
      : data as T
    return <Union<K, VV, T, L | V>>this
  }
}