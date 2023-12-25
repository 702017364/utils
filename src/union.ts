import { Revise } from '@vope/types'

interface Result<Data, Option> { 
  data: Data
  option: Option
}

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

  get data() { 
    return <Required<Record<Status, Data>>>this.#data
  }

  get options() { 
    return <Required<Record<Status, Option>>>this.#options
  }

  constructor(private key: Primary, private formatter: (data: Origin) => Result<Data, Option>) { }

  add<V extends Exclude<Member, Status>>(data: Revise<Origin, Primary, V>) { 
    const key = data[this.key]
    const result = this.formatter(data as Origin)
    this.#data[key] = result.data
    this.#options[key] = result.option
    type Super = Union<Primary, Member, Origin, Data, Option, Status | V>
    return <Super & Omit<this, keyof Super>>this
  }
}