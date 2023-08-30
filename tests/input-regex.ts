import { inputRegex } from '@vope/utils'
import { strictEqual } from 'assert'

describe('inputRegex()', function () { 
  it('With return string', function () { 
    strictEqual('\\$\\(\\)\\*\\+\\.\\[\\?\\\\\\^\\{\\|\\-', inputRegex('$()*+.[?\\^{|-', false))
  })

  it('With return RegExp', function () { 
    strictEqual('\\$\\(\\)\\*\\+\\.\\[\\?\\\\\\^\\{\\|', inputRegex('$()*+.[?\\^{|').source)
  })
})