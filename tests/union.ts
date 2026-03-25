import { Union } from '@vope/utils'
import { deepStrictEqual } from 'assert'

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
    option: Array.isArray(data.rules) ? data.rules : [data.rules],
  })

  it('添加单个元素', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'ID Label',
        prop: 'id',
        rules: [],
      })

    const actualProps = Object.keys(union.data)
    const expectedProps = ['id']
    
    deepStrictEqual(actualProps, expectedProps)
  })

  it('添加多个元素', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'ID Label',
        prop: 'id',
        rules: [],
      })
      .add({
        label: 'Sex Label',
        prop: 'sex',
        rules: [{ required: true }],
      })

    const actualProps = Object.keys(union.data)
    const expectedProps = ['id', 'sex']
    
    deepStrictEqual(actualProps, expectedProps)
  })

  it('获取数据属性', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'ID Label',
        prop: 'id',
        rules: [],
      })

    const actualLabel = union.data.id.label
    const expectedLabel = 'ID Label'
    
    deepStrictEqual(actualLabel, expectedLabel)
  })

  it('获取选项属性', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'Sex Label',
        prop: 'sex',
        rules: [{ required: true }],
      })

    const actualRequired = union.options.sex[0].required
    const expectedRequired = true
    
    deepStrictEqual(actualRequired, expectedRequired)
  })

  it('获取原始数据', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'Address Label',
        prop: 'address1',
        placeholder: 'Please input address',
        rules: [],
      })

    const rawProp = union.getRaw('address1').prop
    const rawPlaceholder = union.getRaw('address1').placeholder
    const expectedProp = 'address1'
    const expectedPlaceholder = 'Please input address'

    const actualValues = [rawProp, rawPlaceholder]
    const expectedValues = [expectedProp, expectedPlaceholder]
    
    deepStrictEqual(actualValues, expectedValues)
  })

  it('从其他Union克隆单个元素', function () {
    const sourceUnion = new Union<'prop', 'address1' | 'address2' | 'address3' | 'address4', VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'Address 1',
        prop: 'address1',
        rules: [],
      })

    const targetUnion = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .clone(sourceUnion, 'address1')
      .add({
        label: 'ID Label',
        prop: 'id',
        rules: [],
      })

    const actualProps = Object.keys(targetUnion.data)
    const expectedProps = ['address1', 'id']

    deepStrictEqual(actualProps, expectedProps)
  })

  it('从其他Union克隆多个元素', function () {
    const sourceUnion = new Union<'prop', 'address1' | 'address2' | 'address3', VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'Address 1',
        prop: 'address1',
        rules: [],
      })
      .add({
        label: 'Address 2',
        prop: 'address2',
        rules: [],
      })

    const targetUnion = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .clone(sourceUnion, ['address1', 'address2'])
      .add({
        label: 'ID Label',
        prop: 'id',
        rules: [],
      })

    const actualProps = Object.keys(targetUnion.data)
    const expectedProps = ['address1', 'address2', 'id']

    deepStrictEqual(actualProps, expectedProps)
  })

  it('链式调用返回正确类型', function () {
    const union = new Union<'prop', keyof Test, VRule, IData, Rule[]>('prop', formatter)
      .add({
        label: 'ID',
        prop: 'id',
        rules: [],
      })
      

    const isUnionInstance = union instanceof Union
    const hasProperty = !!union.data.id
    
    const actualValues = [isUnionInstance, hasProperty]
    const expectedValues = [true, true]
    
    deepStrictEqual(actualValues, expectedValues)
  })
})