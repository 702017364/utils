export type _Point = [number, number]

/**
 * 返回点被旋转指定弧度后新的位置
 * @param from 旋转点
 * @param rad 旋转弧度
 * @param visit 旋转原点
 */
const rotateRad = (from: _Point, rad: number, visit: _Point = [0, 0]): _Point => { 
  const x = from[0] - visit[0]
  const y = from[1] - visit[1]
  return [
    x * Math.cos(rad) + y * Math.sin(rad) + visit[0],
    y * Math.cos(rad) - x * Math.sin(rad) + visit[1],
  ] 
}

export default rotateRad