import { Union } from '@vope/utils'
import { strictEqual } from 'assert'

describe('class Union', function () { 
  interface Test { 
    id: string
    age: number
    sex: 0 | 1
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

  const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', (data) => ({
    data: {
      label: data.label,
      prop: data.prop,
      placeholder: data.placeholder,
    },
    option: Array.isArray(data.rules) ? data.rules: [data.rules],
  }))
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
  
  const { data, options } = union
  data.id.label
  data.sex.label
  
  const age: Exclude<keyof Test, keyof typeof options> = 'age'

  it('Label', function () { 
    strictEqual('id', union.data.id.label)
  })
})