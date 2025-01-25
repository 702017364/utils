import { BuildOptions, build } from 'esbuild'
import { dependencies, devDependencies } from './package.json'

const external: string[] = []

const setExternal = (dependencies: Record<string, string>) => { 
  for (const key in dependencies) {
    external.push(key)
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