import { connectURLParams, cubeURLParams, type Serializes } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('connectURLParams()', function () {
  it('URL参数拼接', () => { 
    // 测试不带序列化器的情况
    const basicInputs: [string, object][] = [
      ['http://abc', {}],
      ['http://abc', { a: 'value' }],
      ['http://abc', { a: 'a', b: 2, c: false }],
      ['http://example.com', { name: 'test', age: 25 }],
      ['https://api.example.com/v1', { key: 'secret', format: 'json' }]
    ]
    
    const basicActual = basicInputs.map(([url, params]) => connectURLParams(url, params))
    
    deepStrictEqual(basicActual, [
      'http://abc',
      'http://abc?a=value',
      'http://abc?a=a&b=2&c=false',
      'http://example.com?name=test&age=25',
      'https://api.example.com/v1?key=secret&format=json'
    ])
  })

  it('带自定义序列化器的参数拼接', () => {
    // 测试带序列化器的情况
    const serializerInputs: [string, object, Serializes<object>][] = [
      ['http://abc', { a: 'test' }, { a: 'string' }],
      ['http://abc', { b: true, c: 42 }, { b: 'boolean', c: 'number' }],
      ['http://example.com', { active: false, count: 0 }, { active: 'boolean', count: 'number' }]
    ]
    
    const serializerActual = serializerInputs.map(([url, params, serializers]) => 
      connectURLParams(url, params, serializers))
    
    deepStrictEqual(serializerActual, [
      'http://abc?a=test',
      'http://abc?b=true&c=42',
      'http://example.com?active=false&count=0'
    ])
  })

  it('已包含参数的URL处理', () => {
    // 测试URL已包含参数的情况
    const existingParamInputs: [string, object][] = [
      ['http://abc?existing=1', { newParam: 'value' }],
      ['https://example.com?query=test', { page: 2, limit: 10 }],
      ['http://api.com/v1?version=2', { token: 'abc', format: 'json' }]
    ]
    
    const existingParamActual = existingParamInputs.map(([url, params]) => 
      connectURLParams(url, params))
    
    deepStrictEqual(existingParamActual, [
      'http://abc?existing=1&newParam=value',
      'https://example.com?query=test&page=2&limit=10',
      'http://api.com/v1?version=2&token=abc&format=json'
    ])
  })

  it('复杂对象参数处理', () => {
    const params = {
      id: 123,
      name: 'John Doe',
      roles: ['admin', 'user'],
      pet: {
        name: 'Dog',
        age: 5,
      },
    }

    const toCode = (value: string) => { 
      return String.fromCharCode(
        Number.parseInt(value, 2)
      )
    }

    const serializers: Serializes<typeof params> = {
      id: 'number',
      name: {
        flat(value) {
          let tmp = 0n
          for (let i = 0; i < value.length; i++) { 
            tmp += BigInt(value.charCodeAt(i)) << (8n * BigInt(i))
          }
          return tmp.toString(16)
        },
        cube(text) {
          const colspan = 8
          const binary = BigInt(`0x${text}`).toString(2)
          const size = binary.length
          let count = size % colspan
          const list: string[] = []
          count && list.push(toCode(binary.slice(0, count)))
          while (count < size) { 
            list.push(toCode(
              binary.slice(count, count += colspan)
            ))
          }
          return list.reverse().join('')
        },
      },
      roles: {
        flat(value) {
          return value.join(',')
        },
        cube(text) {
          return text.split(',')
        },
      },
      pet: {
        flat(value) {
          return `${value.name}_${value.age}`
        },
        cube(text) {
          const [name, age] = text.split('_')
          return { name, age: +age }
        },
      },
    }

    const result = 'http://api.com/users?id=123&name=656f44206e686f4a&roles=admin%2Cuser&pet=Dog_5'

    const searchs = new URL(result).search.slice(1)
    
    deepStrictEqual([
      connectURLParams('http://api.com/users', params, serializers),
      cubeURLParams(searchs, serializers),
    ], [
      result,
      params,
    ])
  })
})