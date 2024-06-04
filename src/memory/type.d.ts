import { GetGivenProps } from '@vope/types'

export namespace Memory { 
  type Type = string | number | symbol

  type Pitch<Data, Type> = (
    Data extends object
      ? GetGivenProps<Data, Type>
      : never
  ) | ((data: Data) => Type)
}