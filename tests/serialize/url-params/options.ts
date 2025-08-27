import type { Serializes } from '@vope/utils'

export interface F { 
  a: string
  b: number
}

export interface G { 
  c: number
  b: boolean
}

export interface IParams { 
  a: boolean
  b: number
  c: Date
  d: bigint
  e: RegExp
  f: F
  g: G
  h: G
  i: 1,
  j: null,
}

export const serializes = {
  a: 'boolean',
  b: 'number',
  c: 'date',
  d: 'bigint',
  e: 'regexp',
  f: {
    cube(text) {
      return <F>JSON.parse(text)
    },
    flat(value: F) {
      return JSON.stringify(value)
    },
  },
  g: {
    cube(text: string) { 
      const g: G = {
        b: text.slice(2) === 'true',
        c: +text.slice(0, 2),
      }
      return g
    },
    flat(value: G) { 
      return `${value.c}${value.b}`
    },
  },
  h: {
    cube(text: string) { 
      const g: G = {
        b: text.slice(2) === 'true',
        c: +text.slice(0, 2),
      }
      return g
    },
    flat(data: G) {
      return data.c + data.b.toString()
    },
  },
  i: {
    cube(text: string) {
      return 1 as const
    },
    flat(value: 1) {
      return '1'
    },
  },
  j: 'null',
} satisfies Serializes<IParams>