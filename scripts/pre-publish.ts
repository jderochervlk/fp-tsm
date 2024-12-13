import { left } from '../src/TaskEither.js'
import { run } from './run.js'

const main = left(new Error('"npm publish" can not be run from root, run "npm run release" instead'))

run(main)
