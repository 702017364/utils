import { calc } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('calc.clamp()', () => { 
  it('default', () => { 
    const actual = [
      calc.clamp(5, {}),
      calc.clamp(5, { min: '2em' }),
      calc.clamp(50, { max: '10%' }),
      calc.clamp('10em', { min: 100, max: '50%' }),
    ]

    deepStrictEqual(actual, [
      '5px',
      'min(2em, 5px)',
      'max(10%, 50px)',
      'clamp(100px, 10em, 50%)',
    ])
  })

  // 新增测试用例以提高测试覆盖率
  it('处理各种输入类型和边界情况', () => {
    const actual = [
      // 基本数值类型
      calc.clamp(0, {}),
      calc.clamp(-10, {}),
      calc.clamp(3.14, {}),
      
      // 只有最小值
      calc.clamp(5, { min: 10 }),
      calc.clamp(15, { min: 10 }),
      calc.clamp('5px', { min: '10px' }),
      calc.clamp('15px', { min: '10px' }),
      
      // 只有最大值
      calc.clamp(20, { max: 10 }),
      calc.clamp(5, { max: 10 }),
      calc.clamp('20px', { max: '10px' }),
      calc.clamp('5px', { max: '10px' }),
      
      // 同时有最小值和最大值
      calc.clamp(5, { min: 1, max: 10 }),
      calc.clamp(0, { min: 1, max: 10 }),
      calc.clamp(15, { min: 1, max: 10 }),
      calc.clamp('5px', { min: '1px', max: '10px' }),
      calc.clamp('0px', { min: '1px', max: '10px' }),
      calc.clamp('15px', { min: '1px', max: '10px' }),
      
      // 边界情况：min等于max
      calc.clamp(5, { min: 10, max: 10 }),
      calc.clamp('5px', { min: '10px', max: '10px' }),
      
      // 使用不同单位
      calc.clamp('2em', { min: '10px', max: '50%' }),
      calc.clamp('100%', { min: '1em', max: '50px' }),
    ]

    deepStrictEqual(actual, [
      0,
      '-10px',
      '3.14px',
      
      'min(10px, 5px)',
      'min(10px, 15px)',
      'min(10px, 5px)',
      'min(10px, 15px)',
      
      'max(10px, 20px)',
      'max(10px, 5px)',
      'max(10px, 20px)',
      'max(10px, 5px)',
      
      'clamp(1px, 5px, 10px)',
      'clamp(1px, 0px, 10px)',
      'clamp(1px, 15px, 10px)',
      'clamp(1px, 5px, 10px)',
      'clamp(1px, 0px, 10px)',
      'clamp(1px, 15px, 10px)',
      
      '10px',
      '10px',
      
      'clamp(10px, 2em, 50%)',
      'clamp(1em, 100%, 50px)',
    ])
  })

  it('处理特殊值', () => {
    const actual = [
      // 零值处理
      calc.clamp(0, { min: -5, max: 5 }),
      calc.clamp('0px', { min: '-5px', max: '5px' }),
      
      // 负数处理
      calc.clamp(-5, { min: -10, max: -1 }),
      calc.clamp('-5px', { min: '-10px', max: '-1px' }),
      
      // 小数处理
      calc.clamp(3.14, { min: 3, max: 4 }),
      calc.clamp('3.14px', { min: '3px', max: '4px' }),
    ]

    deepStrictEqual(actual, [
      'clamp(-5px, 0px, 5px)',
      'clamp(-5px, 0px, 5px)',
      
      'clamp(-10px, -5px, -1px)',
      'clamp(-10px, -5px, -1px)',
      
      'clamp(3px, 3.14px, 4px)',
      'clamp(3px, 3.14px, 4px)',
    ])
  })
})