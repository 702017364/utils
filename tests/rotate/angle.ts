import type { Point2Tuple } from '@vope/types'
import { rotateAngle } from '@vope/utils'
import { deepStrictEqual } from 'assert'

describe('rotateAngle()', function () {
  it('绕原点旋转变换坐标', () => {
    const testInputs: [Point2Tuple, number][] = [
      [[1, 0], 90],
      [[1, 0], 180],
      [[1, 0], 270],
      [[1, 0], 360],

      [[0, 1], 90],
      [[0, 1], 180],
      [[0, 1], 270],
      [[0, 1], 360],

      [[1, 1], 90],
      [[1, 1], 180],
      [[1, 1], 270],
      [[1, 1], 360]
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

    const actual = testInputs.map(([point, angle]) => {
      const [x, y] = rotateAngle(point, angle)
      return JSON.stringify([Math.f16round(x), Math.f16round(y)])
    })
    
    deepStrictEqual(actual, expected.map((value) => JSON.stringify(value)))
  })

  it('绕指定点旋转变换坐标', () => {
    const testInputs: [Point2Tuple, number, Point2Tuple][] = [
      [[2, 0], 90, [1, 0]],
      [[2, 0], 180, [1, 0]],
      [[2, 0], 270, [1, 0]],

      [[0, 2], 90, [0, 1]],
      [[0, 2], 180, [0, 1]],
      [[0, 2], 270, [0, 1]]
    ]
    
    const expected: Point2Tuple[] = [
      [1, -1],
      [0, 0],
      [1, 1],

      [1, 1],
      [0, 0],
      [-1, 1]
    ]

    const actual = testInputs.map(([point, angle, center]) => {
      const [x, y] = rotateAngle(point, angle, center)
      return JSON.stringify([Math.f16round(x), Math.f16round(y)])
    })
    
    deepStrictEqual(actual, expected.map((value) => JSON.stringify(value)))
  })
})