/**
 * 检测key是否为对象的属性
 */
export const isKey = <T extends object>(key: string, data: T): key is Extract<keyof T, string> =>
  key in data