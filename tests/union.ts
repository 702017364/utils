import { Revises } from '@vope/types'
import { Union } from '@vope/utils'
import { strictEqual } from 'assert'

describe('class Union', function () { 
  interface Test { 
    id: string
    age: number
    sex: 0 | 1
  }

  interface Column { 
    label: string
    name: string
  }
  
  it('Get label', function () { 
    const rules = new Union<'name', keyof Test, Column>('name')
      .add({ name: 'id', label: 'id' })
      .add({ name: 'age', label: 'age' })
      .value
    
    strictEqual('id', rules.id.label)
  })

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

  type IRule = Revises<Omit<VRule, 'trigger' | 'behavior'>, {
    rules: Rule[]
  }>

  class Rules<K extends string> extends Union<'prop', K, VRule, IRule> { 
    constructor() { 
      super('prop', ({ label, prop, trigger, placeholder, behavior, rules }) => ({
        label,
        prop,
        get placeholder() {
          return placeholder || (
            behavior
              ? behavior + (label || '')
              : label
          )
        },
        rules: (Array.isArray(rules) ? rules : [rules]).map((rule) => { 
          rule.trigger || trigger && (rule.trigger = trigger)
          return rule
        }),
      }))
    }
  }

  const { id } = new Rules<keyof Test>()
    .add({
      prop: 'id',
      rules: [],
    })
    .value
})