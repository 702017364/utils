import { URLParamsValues } from '@vope/utils'

export interface F { 
  a: string
  b: number
}

export interface G { 
  c: number
  b: boolean
}

export const serializes = {
  a: Boolean,
  b: Number,
  c: Date,
  d: BigInt,
  e: RegExp,
  f(text: string) { 
    const f: F = {
      a: text.slice(0, 1),
      b: +text.slice(1)
    }
    return f
  },
  g: {
    cube(text: string) { 
      const g: G = {
        b: text.slice(2) === 'true',
        c: +text.slice(0, 2),
      }
      return g
    }
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
  i(text: string) { 
    return 1 as const
  }
} satisfies URLParamsValues