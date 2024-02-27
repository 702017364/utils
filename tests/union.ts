import { Union } from '@vope/utils'
import { strictEqual } from 'assert'

describe('class Union', function () { 
  interface Test { 
    id: string
    age: number
    sex: 0 | 1
    address1: string
    address2: string
    address3: string
  }

  interface Rule { 
    trigger?: string
    required?: boolean
    message?: string
  }

  interface VRule { 
    label?: string
    prop: string
    trigger?: string
    placeholder?: string
    behavior?: string
    rules: Rule | Rule[]
  }

  type IData = Pick<VRule, 'label' | 'prop' | 'placeholder'>

  interface Result { 
    data: IData
    option: Rule[]
  }

  const formatter = (data: VRule): Result => ({
    data: {
      label: data.label,
      prop: data.prop,
      placeholder: data.placeholder,
    },
    option: Array.isArray(data.rules) ? data.rules: [data.rules],
  })

  const target = new Union<'prop', 'address1' | 'address2' | 'address3' | 'test', VRule, IData, Rule[]>('prop', formatter)
    .add({
      label: 'address1',
      prop: 'address1',
      rules: [],
    })
    .add({
      label: 'address2',
      prop: 'address2',
      rules: [],
    })
    .add({
      label: 'test',
      prop: 'test',
      rules: [],
    })

  const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
    .add({
      label: 'id',
      prop: 'id',
      rules: [],
    })
    .add({
      label: 'sex',
      prop: 'sex',
      rules: [],
    })
    .clone(target, ['address1', 'address2'])
  
  const { data, options } = union

  data.id.label
  data.sex.label
  data.address1.label
  data.address2.label

  const id: 'id' = union.getRaw('id').prop

  const address2: 'address2' = union.getRaw('address2').prop
  
  const age: Exclude<keyof Test, keyof typeof options> = 'age'

  it('Output label by id', function () { 
    strictEqual('id', union.data.id.label)
  })

  it('Clone', function () { 
    strictEqual('address1', union.data.address1.prop)
  })
})