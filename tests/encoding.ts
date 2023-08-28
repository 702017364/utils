import { getEncoding } from '@vope/utils'
import { strictEqual } from 'assert'
import iconv from 'iconv-lite'

describe('getEncoding()', function () { 
  const label = '*1*我是中国人*1*'

  const equal = (type: string, addBOM?: boolean) => { 
    const buffer = iconv.encode(label, type, { addBOM })
    const { encoding } = getEncoding(buffer)
    strictEqual(type, encoding)
  }

  it('gbk', function () { 
    equal('gbk')
  })

  it('utf-16le', function () { 
    equal('utf-16le', true)
  })

  it('utf-16be', function () { 
    equal('utf-16be', true)
  })

  it('utf-8', function () { 
    equal('utf-8')
  })

  it('utf-8 bom', function () { 
    equal('utf-8', true)
  })
})