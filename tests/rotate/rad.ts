import type { Point2Tuple } from '@vope/types'
import { rotateRad } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('rotateRad()', function () {
  it('绕原点旋转变换坐标', () => {
    const testInputs: [Point2Tuple, number][] = [
      [[1, 0], Math.PI / 2],      // 90 degrees
      [[1, 0], Math.PI],          // 180 degrees
      [[1, 0], Math.PI * 3 / 2],  // 270 degrees
      [[1, 0], Math.PI * 2],      // 360 degrees

      [[0, 1], Math.PI / 2],      // 90 degrees
      [[0, 1], Math.PI],          // 180 degrees
      [[0, 1], Math.PI * 3 / 2],  // 270 degrees
      [[0, 1], Math.PI * 2],      // 360 degrees

      [[1, 1], Math.PI / 2],      // 90 degrees
      [[1, 1], Math.PI],          // 180 degrees
      [[1, 1], Math.PI * 3 / 2],  // 270 degrees
      [[1, 1], Math.PI * 2]       // 360 degrees
    ]
    
    const expected: Point2Tuple[] = [
      [0, -1],
      [-1, 0],
      [0, 1],
      [1, 0],

      [1, 0],
      [0, -1],
      [-1, 0],
      [0, 1],

      [1, -1],
      [-1, -1],
      [-1, 1],
      [1, 1]
    ]

    const actual = testInputs.map(([point, rad]) => {
      const [x, y] = rotateRad(point, rad)
      return JSON.stringify([Math.f16round(x), Math.f16round(y)])
    })
    
    deepStrictEqual(actual, expected.map((value) => JSON.stringify(value)))
  })

  it('绕指定点旋转变换坐标', () => {
    const testInputs: [Point2Tuple, number, Point2Tuple][] = [
      [[2, 0], Math.PI / 2, [1, 0]],      // 90 degrees
      [[2, 0], Math.PI, [1, 0]],          // 180 degrees
      [[2, 0], Math.PI * 3 / 2, [1, 0]],  // 270 degrees

      [[0, 2], Math.PI / 2, [0, 1]],      // 90 degrees
      [[0, 2], Math.PI, [0, 1]],          // 180 degrees
      [[0, 2], Math.PI * 3 / 2, [0, 1]]   // 270 degrees
    ]
    
    const expected: Point2Tuple[] = [
      [1, -1],
      [0, 0],
      [1, 1],

      [1, 1],
      [0, 0],
      [-1, 1]
    ]

    const actual = testInputs.map(([point, rad, center]) => {
      const [x, y] = rotateRad(point, rad, center)
      return JSON.stringify([Math.f16round(x), Math.f16round(y)])
    })
    
    deepStrictEqual(actual, expected.map((value) => JSON.stringify(value)))
  })
})