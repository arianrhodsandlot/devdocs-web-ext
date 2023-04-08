import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fs } from 'zx'

const pathToExtension = path.resolve(fileURLToPath(import.meta.url), '../../dist')
const tmpdir = path.resolve(fileURLToPath(import.meta.url), '../../tmp')

await Promise.all([fs.remove(pathToExtension), fs.remove(tmpdir)])
