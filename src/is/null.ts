/**
 * 检测是否无值(undefined/null)
 */
export const isNull = (value: any): value is undefined | null => value === void 0
  || value === null