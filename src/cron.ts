import { Revise } from '@vope/types'
import { isNumber, isString } from 'lodash-es'
import { hash8json } from './convert/json'

const {
  parseInt,
  isInteger,
  MAX_SAFE_INTEGER,
} = Number as unknown as Revise<typeof Number, 'isInteger', ((value: unknown) => value is number)>

interface Item { 
  key: string
  value: number
}

class Dic { 
  private keys: Record<string, Item>

  private values: Record<number, Item>

  constructor(private dics: Item[]) { 
    this.keys = hash8json(dics, 'key')
    this.values = hash8json(dics, 'value')
  }

  item(key: string) { 
    return this.keys[key]?.value
  }

  at(value: number) { 
    return this.values[value]?.key
  }

  reduce<U>(callbackfn: (previousValue: U, currentValue: Item, currentIndex: number) => U, initialValue: U) { 
    return this.dics.reduce<U>(callbackfn, initialValue)
  }
}

export const weekDic = new Dic([
  {
    key: 'SUN',
    value: 0,
  },
  {
    key: 'MON',
    value: 1,
  },
  {
    key: 'TUE',
    value: 2,
  },
  {
    key: 'WED',
    value: 3,
  },
  {
    key: 'THU',
    value: 4,
  },
  {
    key: 'FRI',
    value: 5,
  },
  {
    key: 'SAT',
    value: 6,
  },
])

interface Options { 
  /**
   * 是否支持具名匹配
   * @default true
   */
  enableSlot?: boolean

  /**
   * 是否支持秒
   * @default true
   */
  enableSecond?: boolean

  /**
   * 是否支持年
   * @default true
   */
  enableYear?: boolean

  /**
   * 值是否匹配最大值
   * @default true
   */
  enableMax?: boolean

  /**
   * 增幅是否匹配最大值(如果enableMax等于false则该值也始终为false)
   * @default true
   */
  enableIncrementMax?: boolean

  /**
   * 日/周是否支持无效设置
   * @default true
   */
  enableInvalid?: boolean

  /**
   * 日期是否支持倒数值
   * @default true
   */
  enableDayLast?: boolean

  /**
   * 周是否支持倒数值
   * @default true
   */
  enableWeekLast?: boolean

  /**
   * 周是否支持7
   * @default true
   */
  enableWeekSupport7?: boolean

  /**
   * 周是否支持字典
   * @default true
   */
  enableWeekSupportDic?: boolean

  /**
   * 周字典是否支持大小写混写
   * @default true
   */
  enableDicEnumSupportMixin?: boolean

  /**
   * 数值是否支持前缀0
   */
  enablePrefixZero?: boolean
}

type ConfigType = 's' | 'm' | 'h' | 'D' | 'M' | 'w' | 'Y' 

interface Config { 
  type: ConfigType
  max: number
  split: number
  fromZero?: boolean
  invalid?: boolean
  last?: boolean
  dic?: Dic
  partial?: boolean
}

const place_value = 0

export const default_max_second = 59
export const default_min_second = 0
export const default_max_minute = default_max_second
export const default_min_minute = default_min_second
export const default_max_hour = 23
export const default_min_hour = 0
export const default_max_day = 31
export const default_min_day = 1
export const default_max_month = 12
export const default_min_month = 1
export const default_max_week = 6
export const default_min_week = 0

const re_single_number_text = '\\d'

export const createCronRegexText = (options: Options = {}) => {
  const {
    enableSlot = true,
    enableSecond = true,
    enableYear = true,
    enableMax = true,
    enableInvalid = true,
    enableDayLast = true,
    enableWeekLast = true,
    enableWeekSupport7 = true,
    enableWeekSupportDic = true,
    enableDicEnumSupportMixin = true,
    enablePrefixZero,
  } = options
  const enableMaxSplit = enableMax && (options.enableIncrementMax ?? true)

  const singleNumberMatch = (end: number, fromZero?: boolean) => {
    const start = fromZero ? 0 : 1
    if (end === start) {
      return `${end}`
    } else if (end < 3 + start) {
      let text = ''
      for (let i = start; i <= end; i++) {
        text += i
      }
      return `[${text}]`
    } else if (start === 0 && end === 9) {
      return re_single_number_text
    } else {
      return `[${start}-${end}]`
    }
  }

  const numberMatch = (max: number, fromZero?: boolean) => {
    if (max === place_value) return `[1-9]${re_single_number_text}*`
    if (max < 10) return singleNumberMatch(max, fromZero)
    const mod = max % 10
    const quot = (max - mod) / 10
    let text = ''
    if (fromZero) {
      text = re_single_number_text
    } else {
      text = singleNumberMatch(9)
    }
    text += '|'
    if (mod === 9) {
      text += singleNumberMatch(quot) + re_single_number_text
    } else {
      if (quot > 1) {
        text += singleNumberMatch(quot - 1) + re_single_number_text + '|'
      }
      text += `${quot}${singleNumberMatch(mod, true)}`
    }
    return `(?:${text})`
  }

  const numberMatchByPrefix = (max: number, fromZero?: boolean) => {
    const text = numberMatch(max, fromZero)
    return enablePrefixZero
      ? '0*' + text
      : text
  }

  const mixin = (text: string) => { 
    let tmp = ''
    for (const char of text) { 
      const code = char.charCodeAt(0)
      if (code > 64 && code < 91) {
        tmp += `[${char.toLocaleLowerCase()}${char}]`
      } else if (code > 96 && code < 123) {
        tmp += `[${char}${char.toLocaleUpperCase()}]`
      } else { 
        tmp += char
      }
    }
    return tmp
  }

  const generate = ({ 
    type,
    max,
    split,
    dic,
    invalid,
    last,
    fromZero,
  }: Config) => {
    const list: string[] = []
    invalid && list.push('\\?')
    const template = [numberMatchByPrefix(max, fromZero)]
    let lastTemplate: string | undefined
    if (last) { 
      if (type === 'D') {
        lastTemplate = `L(?:-${numberMatchByPrefix(max - 1)})?`
      } else if (type === 'w') {
        lastTemplate = `${numberMatchByPrefix(max, true)}L`
      }
    }
    if (type === 'w' && dic) {
      template.push(
        dic.reduce<string>((tmp, { key }) => { 
          const text = enableDicEnumSupportMixin
            ? mixin(key)
            : key
          return tmp
            ? tmp + '|' + text
            : text
        }, '')
      )
    }
    let tmp = template.length > 1
      ? `(?:${template.join('|')})`
      : template[0]
    
    if (lastTemplate) {
      tmp = `(?:\\*|(?:${lastTemplate}|${tmp}(?:-${tmp})?)(?:,(?:${lastTemplate}|${tmp}(?:-${tmp})?))*)`
    } else { 
      tmp = `(?:\\*|${tmp}(?:-${tmp})?(?:,${tmp}(?:-${tmp})?)*)`
    }
    
    list.push(`${tmp}(?:\\/${numberMatchByPrefix(split)})?`)
    return list.join('|')
  }

  let regex = ''

  const join = (config: Config, isLast?: boolean) => {
    const space = '\\s+'
    let code = generate(config)
    if (enableSlot) {
      code = `(?<${config.type}>${code})`
    } else { 
      code = `(${code})`
    }
    if (!isLast) { 
      code += space
    }
    if (config.partial) {
      if (isLast) {
        regex = regex.slice(0, space.length * -1) + `(?:${space}${code})?`
        return
      } else { 
        code = `(?:${code})?`
      }
    }
    regex += code
  }

  enableSecond && join({
    type: 's',
    max: enableMax ? default_max_second : place_value,
    split: enableMaxSplit ? default_max_second : place_value,
    fromZero: !default_min_second,
  })

  join({
    type: 'm',
    max: enableMax ? default_max_minute : place_value,
    split: enableMaxSplit ? default_max_minute : place_value,
    fromZero: !default_min_minute,
  })

  join({
    type: 'h',
    max: enableMax ? default_max_hour : place_value,
    split: enableMaxSplit ? default_max_hour : place_value,
    fromZero: !default_min_hour,
  })

  join({
    type: 'D',
    max: enableMax ? default_max_day : place_value,
    split: enableMaxSplit ? default_max_day : place_value,
    invalid: enableInvalid,
    last: enableDayLast,
    fromZero: !default_min_day,
  })

  join({
    type: 'M',
    max: enableMax ? default_max_month : place_value,
    split: enableMaxSplit ? default_max_month : place_value,
    fromZero: !default_min_month,
  })

  join((() => {
    const max = enableWeekSupport7
      ? 7
      : default_max_week
    
    const config: Config = {
      type: 'w',
      max: enableMax ? max : place_value,
      split: enableMaxSplit ? 7 : place_value,
      fromZero: !default_min_week,
      invalid: enableInvalid,
      last: enableWeekLast,
    }

    if (enableWeekSupportDic) { 
      config.dic = weekDic
    }

    return config
  })(), !enableYear)

  enableYear && join({
    type: 'Y',
    max: place_value,
    split: place_value,
    fromZero: true,
    partial: true,
  }, true)

  return {
    regex,
    enableSlot,
    enableSecond,
    enableYear,
    enableDayLast,
    enableWeekLast,
    enableInvalid,
  }
}

interface BasicValue { 
  text(): string
}

export class InvalidValue implements BasicValue { 
  constructor(private isEnableInvalid: boolean) { }

  text() {
    return this.isEnableInvalid
      ? '?'
      : '*'
  }
}

export const isInvalidValue = (value: unknown) => 
  value instanceof InvalidValue

abstract class LastValue implements BasicValue { 
  constructor(public value: number) { }

  abstract text(): string
}

export class DayLastValue extends LastValue { 
  text() {
    const { value } = this
    return 'L' + (value ? `-${value}` : '')
  }
}

export const isDayLastValue = (value: unknown) => 
  value instanceof DayLastValue

export class WeekLastValue extends LastValue { 
  text() {
    return `${this.value}L`
  }
}

export const isWeekLastValue = (value: unknown) =>
  value instanceof WeekLastValue

export class WildcardValue implements BasicValue { 
  text() { 
    return '*'
  }
}

export const isWildcardValue = (value: unknown) =>
  value instanceof WildcardValue

export class RangeValue implements BasicValue { 
  constructor(public start: number, public stop: number) { }

  text() { 
    return `${this.start}-${this.stop}`
  }
}

export const isRangeValue = (value: unknown) =>
  value instanceof RangeValue

type IGroup = number | DayLastValue | WeekLastValue | RangeValue

type IValues = WildcardValue | IGroup[]

export class DigitsValue implements BasicValue { 
  constructor(public values: IValues, public increment?: number) { }

  text() { 
    const { values, increment } = this
    let tmp: string
    if (Array.isArray(values)) {
      tmp = (values as IGroup[]).reduce((caches, data) => { 
        let tmp: string
        if (isNumber(data)) {
          tmp = `${data}`
        } else {
          tmp = data.text()
        }
        return caches
          ? caches + ',' + tmp
          : tmp
      }, '')
    } else { 
      tmp = values.text()
    }
    return increment
      ? `${tmp}/${increment}`
      : tmp
  }
}

export const isDigitsValue = (value: unknown) => 
  value instanceof DigitsValue

const re_num = /\d/

const parseDigit = (text: string) => { 
  if (re_num.test(text[0])) {
    return parseInt(text)
  } else { 
    return weekDic.item(text.toLocaleUpperCase())
  }
}

const parseDigits = (text: string) => { 
  return text.split(',').map<IGroup>((text) => { 
    const [a, b] = text.split('-')
    if (a === 'L' && b === void 0) { 
      return new DayLastValue(0)
    } else if (b === void 0) {
      if (a.slice(-1) === 'L') {
        return new WeekLastValue(parseInt(a.slice(0, -1)))
      } else { 
        return parseDigit(a)
      }
    } else { 
      if (a === 'L') {
        return new DayLastValue(parseInt(b))
      } else { 
        return new RangeValue(parseDigit(a), parseDigit(b))
      }
    }
  })
}

const validate = (value: number | [number, number], min: number, max: number) => { 
  if (isInteger(value)) {
    return value >= min && value <= max
  } else if (Array.isArray(value)) { 
    if (value.length !== 2) return false
    const [a, b] = value
    return isInteger(a)
      && isInteger(b)
      && a <= b
      && a >= min
      && b <= max
  }
  return false
}

const validateIncrement = (value: number | undefined, min: number, max: number) => { 
  return isInteger(value)
    && value > 0
    && value >= min
    && value <= max
}

type Digits<T extends string = never> = '*' | number | T | (number | T | [number, number])[]

type BasicDigits = Digits

type DayDigits = Digits<'L' | `L-${number}`>

type WeekDigits = Digits<`${number}L`>

const formaterDigits = (value: BasicDigits, min: number, max: number) => { 
  let values: IValues | undefined
  if (value === '*') {
    values = new WildcardValue()
  } else if (Array.isArray(value)) {
    const tmp: IGroup[] = []
    value.some((data) => { 
      if (validate(data, min, max)) {
        tmp.push(
          isNumber(data)
            ? data
            : new RangeValue(data[0], data[1])
        )
        return false
      } else { 
        return true
      }
    }) || (values = tmp)
  } else if (validate(value, min, max)){ 
    values = [value]
  }
  return values
}

const formaterLastDigits = (value: DayDigits | WeekDigits, min: number, max: number, prototype: typeof LastValue) => { 
  let values: IValues | undefined
  if (value === '*') {
    values = new WildcardValue()
  } else { 
    const tmp: IGroup[] = []
    const list = Array.isArray(value) ? value : [value]
    list.some((data) => { 
      if (isString(data)) {
        const result = parseDigits(data)
        if (result.length === 1 && result[0] instanceof prototype && validate(result[0].value, min, max - 1)) {
          tmp.push(result[0])
          return false
        }
      } else if (validate(data, min, max)) {
        tmp.push(
          isNumber(data)
            ? data
            : new RangeValue(data[0], data[1])
        )
        return false
      }
      return true
    }) || (values = tmp)
  }
  return values
}

class Parse { 
  second?: DigitsValue
  minute: DigitsValue
  hour: DigitsValue
  day: InvalidValue | DigitsValue
  month: DigitsValue
  week: InvalidValue | DigitsValue
  year?: DigitsValue

  constructor(
    second: string | undefined,
    minute: string,
    hour: string,
    day: string,
    month: string,
    week: string,
    year: string | undefined,
    public cron: Cron
  ) { 
    if (second) { 
      this.second = this.parse(second) as DigitsValue
    }
    this.minute = this.parse(minute) as DigitsValue
    this.hour = this.parse(hour) as DigitsValue
    this.day = this.parse(day) as InvalidValue | DigitsValue
    this.month = this.parse(month) as DigitsValue
    this.week = this.parse(week) as InvalidValue | DigitsValue
    if (year) { 
      this.year = this.parse(year) as DigitsValue
    }
  }

  parse(text: string): InvalidValue | DigitsValue { 
    if (text === '?') return new InvalidValue(this.cron.isEnableInvalid)
    const [slices, increment] = text.split('/')
    return new DigitsValue(
      slices === '*'
        ? new WildcardValue()
        : parseDigits(slices),
      increment
        ? parseInt(increment)
        : void 0
    )
  }

  setSecond(value: BasicDigits, increment?: number): boolean { 
    if (!this.cron.isEnableSecond) return false
    const values = formaterDigits(value, default_min_second, default_max_second)
    if (!values) return false
    const second = new DigitsValue(values)
    if (validateIncrement(increment, default_min_second, default_max_second)) { 
      second.increment = increment
    }
    this.second = second
    return true
  }

  setMinute(value: BasicDigits, increment?: number): boolean { 
    const values = formaterDigits(value, default_min_minute, default_max_minute)
    if (!values) return false
    const minute = new DigitsValue(values)
    if (validateIncrement(increment, default_min_minute, default_max_minute)) { 
      minute.increment = increment
    }
    this.minute = minute
    return true
  }

  setHour(value: BasicDigits, increment?: number): boolean { 
    const values = formaterDigits(value, default_min_hour, default_max_hour)
    if (!values) return false
    const hour = new DigitsValue(values)
    if (validateIncrement(increment, default_min_hour, default_max_hour)) { 
      hour.increment = increment
    }
    this.hour = hour
    return true
  }

  setDayInvalid() { 
    this.day = new InvalidValue(this.cron.isEnableInvalid)
    if (this.week instanceof InvalidValue) { 
      this.week = new DigitsValue(new WildcardValue())
    }
  }

  setDay(value: '?'): boolean
  setDay(value: DayDigits, increment?: number): boolean
  setDay(value: '?' | DayDigits, increment?: number): boolean {
    let values: IValues
    if (value === '?') {
      this.setDayInvalid()
      return true
    } else { 
      const tmp = formaterLastDigits(value, default_min_day, default_max_day, DayLastValue)
      if (!tmp) return false
      values = tmp
    }
    const tmp = new DigitsValue(values)
    if (validateIncrement(increment, default_min_day, default_max_day)) { 
      tmp.increment = increment
    }
    this.day = tmp
    const { week } = this
    if (isDigitsValue(week) && (week.increment !== void 0 || !isWildcardValue(week.values))) { 
      if (this.cron.isEnableInvalid) {
        this.week = new InvalidValue(true)
      } else { 
        week.values = new WildcardValue()
        week.increment = void 0
      }
    }
    return true
  }

  setMonth(value: BasicDigits, increment?: number): boolean { 
    const values = formaterDigits(value, default_min_month, default_max_month)
    if (!values) return false
    const month = new DigitsValue(values)
    if (validateIncrement(increment, default_min_month, default_max_month)) { 
      month.increment = increment
    }
    this.month = month
    return true
  }

  setWeekInvalid() { 
    this.week = new InvalidValue(this.cron.isEnableInvalid)
    if (this.day instanceof InvalidValue) { 
      this.day = new DigitsValue(new WildcardValue())
    }
  }

  setWeek(value: '?'): boolean
  setWeek(value: WeekDigits, increment?: number): boolean
  setWeek(value: '?' | WeekDigits, increment?: number) { 
    let values: IValues
    if (value === '?') {
      this.setWeekInvalid()
      return true
    } else { 
      const tmp = formaterLastDigits(value, default_min_week, default_max_week, WeekLastValue)
      if (!tmp) return false
      values = tmp
    }
    const tmp = new DigitsValue(values)
    if (validateIncrement(increment, default_min_week, default_max_week)) { 
      tmp.increment = increment
    }
    this.week = tmp
    const { day } = this
    if (isDigitsValue(day) && (day.increment !== void 0 || !isWildcardValue(day.values))) { 
      if (this.cron.isEnableInvalid) {
        this.day = new InvalidValue(true)
      } else { 
        day.values = new WildcardValue()
        day.increment = void 0
      }
    }
    return true
  }

  setYear(value: BasicDigits, increment?: number): boolean { 
    if (!this.cron.isEnableYear) return false
    const values = formaterDigits(value, 0, MAX_SAFE_INTEGER)
    if (!values) return false
    const year = new DigitsValue(values)
    if (validateIncrement(increment, 0, MAX_SAFE_INTEGER)) { 
      year.increment = increment
    }
    this.year = year
    return true
  }

  text() {
    const { cron, second, year } = this
    const list: string[] = []
    if (cron.isEnableSecond) { 
      list.push(second ? second.text() : '0')
    }
    list.push(this.minute.text())
    list.push(this.hour.text())
    list.push(this.day.text())
    list.push(this.month.text())
    list.push(this.week.text())
    if (cron.isEnableYear && year) { 
      list.push(year.text())
    }
    return list.join(' ')
  }
}

export class Cron { 
  #options: ReturnType<typeof createCronRegexText>

  #regex: RegExp

  get isEnableSecond() { 
    return this.#options.enableSecond
  }

  get isEnableYear() { 
    return this.#options.enableYear
  }

  get isEnableDayLast() { 
    return this.#options.enableDayLast
  }

  get isEnableWeekLast() { 
    return this.#options.enableWeekLast
  }

  get isEnableInvalid() { 
    return this.#options.enableInvalid
  }

  constructor(options?: Options) { 
    const { regex } = this.#options = createCronRegexText(options)
    this.#regex = new RegExp(`^${regex}$`)
  }

  parse(text: string) { 
    const matchs = text.trim().match(this.#regex)
    if (!matchs) return
    const config = this.#options
    const { enableSecond, enableYear } = config
    let second: string | undefined
    let minute: string
    let hour: string
    let day: string
    let month: string
    let week: string
    let year: string | undefined

    if (config.enableSlot) {
      const groups = matchs.groups as Record<ConfigType, string>
      if (enableSecond) { 
        second = groups.s
      }
      minute = groups.m
      hour = groups.h
      day = groups.D
      month = groups.M
      week = groups.w
      if (enableYear) { 
        year = groups.Y
      }
    } else { 
      let count = 1
      if (enableSecond) { 
        second = matchs[count++]
      }
      minute = matchs[count++]
      hour = matchs[count++]
      day = matchs[count++]
      month = matchs[count++]
      week = matchs[count++]
      if (enableYear) { 
        year = matchs[count++]
      }
    }

    return new Parse(second, minute, hour, day, month, week, year, this)
  }
}