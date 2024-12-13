import * as E from '../src/Either.js'
import * as IO from '../src/IO.js'
import * as _ from '../src/ReaderT.js'
import * as TE from '../src/TaskEither.js'
import * as U from './util.js'

describe('ReaderT', () => {
  it('fromNaturalTransformation', async () => {
    const fromReaderIO = _.fromNaturalTransformation<'IO', 'TaskEither'>(TE.fromIO)
    const f = (s: string): IO.IO<number> => IO.of(s.length)
    const fa = fromReaderIO(f)
    U.deepStrictEqual(await fa('a')(), E.right(1))
  })
})
