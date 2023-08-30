import rotateRad, { _Point } from './rad'

/**
 * 返回点被旋转指定角度后新的位置
 * @param from 旋转点
 * @param angle 旋转角度
 * @param visit 旋转原点
 */
const rotateAngle = (from: _Point, angle: number, visit?: _Point) =>
  rotateRad(from, angle / 180 * Math.PI, visit)

export default rotateAngle