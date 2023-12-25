import { getEncoding } from '@vope/utils'
import { strictEqual } from 'assert'
import iconv from 'iconv-lite'

describe('getEncoding()', function () { 
  const text = '*1*我是中国人*1*'

  const equal = (type: string, addBOM?: boolean) => { 
    const buffer = iconv.encode(text, type, { addBOM })
    const { encoding } = getEncoding(buffer)
    strictEqual(type, encoding)
  }

  it('GBK', function () { 
    equal('gbk')
  })

  it('UTF-16LE', function () { 
    equal('utf-16le', true)
  })

  it('UTF-16BE', function () { 
    equal('utf-16be', true)
  })

  it('UTF-8', function () { 
    equal('utf-8')
  })

  it('UTF-8 BOM', function () { 
    equal('utf-8', true)
  })
})