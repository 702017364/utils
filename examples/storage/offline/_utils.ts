import { Serializes } from '@vope/utils'

export interface OfflineRequest { 
  size1: number
  key1_name: string
  size2: number
  key2_name: string
  size3: number
}

export const serializes = {
  size1: 'number',
  key1_name: 'string',
  size2: 'number',
  key2_name: 'string',
  size3: 'number',
} satisfies Serializes<OfflineRequest>