import { type BuildOptions, build } from 'esbuild'
import { dependencies, devDependencies } from './package.json'

const external: string[] = []

const excludes = ([
  'lodash-es'
] satisfies string[]).reduce<Record<string, string>>((caches, exclude) => { 
  caches[exclude] = exclude
  return caches
}, {})

const setExternal = (dependencies: Record<string, string>) => { 
  for (const key in dependencies) {
    key in excludes || external.push(key)
  }
}

setExternal(dependencies)
setExternal(devDependencies)

build<BuildOptions>({
  entryPoints: ['./build.ts'],
  format: 'cjs',
  bundle: true,
  outfile: 'build.cjs',
  external,
  platform: 'node',
})