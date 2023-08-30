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

  const rules = new Union<'name', keyof Test, Column>('name')
    .add({ name: 'id', label: 'id' })
    .add({ name: 'age', label: 'age' })
    .value

  it('get label', function () { 
    strictEqual('id', rules.id.label)
  })
})