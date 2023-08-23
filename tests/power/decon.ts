import { deconPowersSum } from '@vope/utils'
import { strictEqual } from 'assert'

describe('deconPowersSum()', function () { 
  const getSum = (list: number[]) => { 
    return list.reduce((cache, power) => cache + Math.pow(2, power), 0)
  }

  const list: number[][] = [
    [0],
    [4, 3],
    [21, 15, 7],
  ]

  list.forEach((data) => { 
    const sum = getSum(data)
    const text = data.join(',')
    it(`${sum} => ${text}`, function () { 
      strictEqual(text, deconPowersSum(sum).join(','))
    })
  })

  it('Asc sort', function () { 
    const list = [3, 21, 50]
    const sum = getSum(list)
    const text = list.join(',')
    strictEqual(text, deconPowersSum(sum, 'asc').join(','))
  })
})