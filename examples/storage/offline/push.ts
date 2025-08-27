import { flatURLParams, isKey } from '@vope/utils'
import { OfflineStorage } from '@vope/utils/storage'
import { type OfflineRequest, serializes } from './_utils'

interface Person { 
  name: string
  sex: 0 | 1
  age: number
  height: number
  weight: number
  hobby: string[]
}

type Colour = {
  [P in keyof Person]: string
}

const initial = async () => { 
  const persons: Person[] = [
    {
      name: '张三',
      sex: 1,
      age: 18,
      height: 180,
      weight: 156,
      hobby: ['象棋', '篮球'],
    },
    {
      name: '李四',
      sex: 0,
      age: 28,
      height: 154,
      weight: 101,
      hobby: ['看书', '购物'],
    },
    {
      name: '王五',
      sex: 1,
      age: 38,
      height: 174,
      weight: 150,
      hobby: ['电子游戏'],
    },
    {
      name: '孙六',
      sex: 1,
      age: 48,
      height: 174,
      weight: 150,
      hobby: ['电子游戏'],
    },
  ]

  const config: ConstructorParameters<typeof OfflineStorage<Person, Colour>>[0] = {
    name: 'test',
    crypto: {
      encrypt(plain) { 
        const data = {} as Colour
        for (const key in plain) { 
          if (!isKey(key, plain)) continue
          switch (key) { 
            case 'name':
              data[key] = plain[key]
              break
            case 'sex':
            case 'age':
            case 'height':
            case 'weight':
              data[key] = plain[key].toString(16)
              break
            case 'hobby':
              data[key] = plain[key].reduce((text, value, index) => { 
                return index === 0
                  ? encodeURIComponent(value)
                  : text + ',' + encodeURIComponent(value)
              }, '')
          }
        }
        return data
      },
      decrypt(cipher) {
        const data = {} as Person
        for (const key in cipher) { 
          if (!isKey(key, cipher)) continue
          switch (key) { 
            case 'name':
              data[key] = cipher[key]
              break
            case 'sex':
              data[key] = cipher[key] === '0'
                ? 0
                : 1
              break
            case 'age':
            case 'height':
            case 'weight':
              data[key] = Number.parseInt(cipher[key], 16)
              break
            case 'hobby':
              data[key] = cipher[key].split(',').map((value) => decodeURIComponent(value))
          }
        }
        return data
      },
    },
  }
  
  const os1 = new OfflineStorage<Person, Colour>(config)
  await os1.ready()
  
  const index1 = await os1.push(persons[0]) - 1
  const index2 = await os1.push(persons[1]) - 1
  const data = {
    size1: os1.size,
    key1_name: (await os1.get(index1))!.name,
  } as OfflineRequest
  await os1.push(persons[2])
  data.size2 = os1.size
  data.key2_name = (await os1.get(index2))!.name

  const os2 = new OfflineStorage<Person, Colour>(config)
  await os2.ready()
  await os2.push(persons[2])
  data.size3 = os2.size

  fetch('/offline-storage', {
    method: 'POST',
    body: flatURLParams(data, serializes),
  })
}

initial()