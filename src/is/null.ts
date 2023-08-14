/**
 * 检测是否无值(undefined/null)
 */
const isNull = (value: any): value is undefined | null => value === void 0
  || value === null

export default isNull