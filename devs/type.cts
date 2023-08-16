import { copyFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const re_file = /\.d.ts$/

const build = (origin: string, target: string) => { 
  readdirSync(origin).forEach((file) => { 
    const src = join(origin, file)
    if (statSync(src).isDirectory()) {
      build(src, join(target, file))
    } else if(re_file.test(file)) { 
      copyFileSync(src, join(target, file))
    }
  })
}

const root = process.cwd()

build(join(root, 'src'), join(root, 'types'))