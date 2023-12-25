import { isNull } from './null'

/**
 * 检测是否为空(undefined/null/'')
 */
export const isEmpty = (value: any): value is undefined | null | '' => isNull(value)
  || value === ''