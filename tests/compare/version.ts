import { compareVersion } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('compareVersion()', function () {
  it('相同版本号比较', function () {
    const actual = [
      compareVersion('1.0.0', '1.0.0'),
      compareVersion('2.1.3', '2.1.3'),
      compareVersion('0.0.0', '0.0.0'),
      compareVersion('1.2.3.4', '1.2.3.4'),
    ]

    deepStrictEqual(actual, [
      0,
      0,
      0,
      0,
    ])
  })

  it('第一个版本号大于第二个版本号', function () {
    const actual = [
      compareVersion('2.0.0', '1.0.0'),
      compareVersion('1.2.0', '1.1.5'),
      compareVersion('1.2.1', '1.2.0'),
      compareVersion('1.10.0', '1.2.0'),
      compareVersion('1.0.1', '1.0.0'),
      compareVersion('10.20.31', '10.20.30'),
      compareVersion('100.200.301', '100.200.300'),
      compareVersion('2.1.1', '1.9.9'),
    ]

    deepStrictEqual(actual, [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
    ])
  })

  it('第一个版本号小于第二个版本号', function () {
    const actual = [
      compareVersion('1.0.0', '2.0.0'),
      compareVersion('1.1.5', '1.2.0'),
      compareVersion('1.2.0', '1.2.1'),
      compareVersion('1.2.0', '1.10.0'),
      compareVersion('1.0.0', '1.0.1'),
      compareVersion('10.20.30', '10.20.31'),
      compareVersion('100.200.299', '100.200.300'),
      compareVersion('1.9.9', '2.1.1'),
    ]

    deepStrictEqual(actual, [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
    ])
  })

  it('不同长度版本号比较', function () {
    const actual = [
      compareVersion('1.0', '1.0.0'),
      compareVersion('1.0.0', '1.0'),
      compareVersion('1.0', '1.0.1'),
      compareVersion('1.0.1', '1.0'),
      compareVersion('1', '1.0.1'),
      compareVersion('1.0.1', '1'),
    ]

    deepStrictEqual(actual, [
      0,
      0,
      1,
      -1,
      1,
      -1,
    ])
  })

  it('单部分版本号比较', function () {
    const actual = [
      compareVersion('1', '1'),
      compareVersion('1', '2'),
      compareVersion('2', '1'),
    ]

    deepStrictEqual(actual, [
      0,
      1,
      -1,
    ])
  })

  it('带前导零的版本号比较', function () {
    const actual = [
      compareVersion('1.01.001', '1.1.1'),
      compareVersion('1.1.1', '1.01.001'),
    ]

    deepStrictEqual(actual, [
      0,
      0,
    ])
  })

  it('大数值版本号比较', function () {
    const actual = [
      compareVersion('10.20.30', '10.20.30'),
      compareVersion('10.20.30', '10.20.31'),
      compareVersion('10.20.31', '10.20.30'),
      compareVersion('100.200.300', '100.200.300'),
    ]

    deepStrictEqual(actual, [
      0,
      1,
      -1,
      0,
    ])
  })

  it('空字符串版本号比较', function () {
    const actual = [
      compareVersion('', ''),
      compareVersion('', '1.0.0'),
      compareVersion('1.0.0', ''),
    ]

    deepStrictEqual(actual, [
      0,
      1,
      -1,
    ])
  })

  it('全零版本号比较', function () {
    const actual = [
      compareVersion('0.0.0', '0.0.0'),
      compareVersion('0.0.0', '0.0.1'),
      compareVersion('0.0.1', '0.0.0'),
    ]

    deepStrictEqual(actual, [
      0,
      1,
      -1,
    ])
  })

  it('包含零的部分的版本号比较', function () {
    const actual = [
      compareVersion('1.0.1', '1.0.0'),
      compareVersion('1.0.0', '1.0.1'),
    ]

    deepStrictEqual(actual, [
      -1,
      1,
    ])
  })
})