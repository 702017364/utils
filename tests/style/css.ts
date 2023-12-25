import { css } from '@vope/utils'
import { strictEqual } from 'assert'

describe('css()', function () { 
  it('Base type', function () { 
    strictEqual(css(false, null, undefined, 'test'), 'test')
  })

  it('CSSProperties', function () { 
    strictEqual(css({
      padding: 0,
      margin: 0
    }), 'padding: 0;margin: 0')
  })

  it('Array type', function () { 
    strictEqual(css('a', ['b', 'c'], {
      zIndex: 1,
    }), 'a;b;c;z-index: 1')
  })
})