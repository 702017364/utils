import { Point2Tuple } from '@vope/types'

/**
 * 返回点被旋转指定弧度后新的位置
 * @param from 旋转点
 * @param rad 旋转弧度
 * @param visit 旋转原点
 */
export const rotateRad = (from: Point2Tuple, rad: number, visit: Point2Tuple = [0, 0]): Point2Tuple => { 
  const x = from[0] - visit[0]
  const y = from[1] - visit[1]
  return [
    x * Math.cos(rad) + y * Math.sin(rad) + visit[0],
    y * Math.cos(rad) - x * Math.sin(rad) + visit[1],
  ] 
}