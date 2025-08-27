import type { Revise } from '@vope/types'

interface Result<Data, Option> { 
  data: Data
  option: Option
}

type Raws<Primary extends string, Status extends string, Origin extends { [key in Primary]: string }> = {
  [P in Status]: Revise<Origin, Primary, P>
}

type GetStatus<T> = T extends Union<any, any, any, any, any, infer S>
  ? S
  : never

/**
 * 数据联合(用于需要对加入的数据进行智能提示)
 */
export class Union<
  Primary extends string,
  Member extends string,
  Origin extends { [key in Primary]: string },
  Data extends unknown,
  Option extends unknown,
  Status extends Member | never = never,
> { 
  #data = <Record<string, Data>>{}
  #options = <Record<string, Option>>{}
  #raws = <Raws<Primary, Status, Origin>>{}

  get data() { 
    return <Required<Record<Status, Data>>>this.#data
  }

  get options() { 
    return <Required<Record<Status, Option>>>this.#options
  }

  constructor(protected key: Primary, private formatter: (data: Origin) => Result<Data, Option>) { }

  add<P extends Exclude<Member, Status>>(data: Revise<Origin, Primary, P>) { 
    const key = data[this.key]
    const result = this.formatter(data as Origin);
    (<Record<string, {}>>this.#raws)[key] = data
    this.#data[key] = result.data
    this.#options[key] = result.option
    type Super = Union<Primary, Member, Origin, Data, Option, Status | P>
    return <Super & Omit<this, keyof Super>>this
  }

  /**
   * 获取原始数据
   */
  getRaw<P extends Status>(key: P) { 
    return this.#raws[key]
  }

  /**
   * 从已有的联合中拷贝数据
   */
  clone<T extends Union<Primary, string, Origin, Data, Option>, const P extends Exclude<GetStatus<T> & Member, Status>>(target: T, key: P | P[]) { 
    const { data, options } = target
    const keys = Array.isArray(key)
      ? key
      : [key]
    keys.forEach((key) => {
      if (key in data) {
        this.#raws[key] = target.getRaw(key)
        this.#data[key] = data[key]
        this.#options[key] = options[key]
      }
    })
    type Super = Union<Primary, Member, Origin, Data, Option, Status | P>
    return <Super & Omit<this, keyof Super>>this
  }
}