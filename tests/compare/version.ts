import { compareVersion } from '@vope/utils'
import { strictEqual } from 'assert'

describe('compareVersion()', function () { 
  const froms = [
    '1.0.0',
    '1.5',
    '2.0.1',
    '1.4.1',
  ]

  const tos = [
    '1.0.0',
    '1.5.0',
    '1.0.1',
    '1.5.1',
  ]
  
  const tips = [
    0,
    0,
    -1,
    1
  ] as const

  const dic ={ 
    0: '=',
    1: '<',
    '-1': '>'
  }

  tips.forEach((tip, index) => { 
    it(`${froms[index]} ${dic[tip]} ${tos[index]}`, function () { 
      strictEqual(tip, compareVersion(froms[index], tos[index]))
    })
  })
})