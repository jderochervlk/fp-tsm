import * as _ from '../src/Console.js'
import { flow, pipe } from '../src/function.js'
import * as TE from '../src/TaskEither.js'

// $ExpectType TaskEither<never, string>
pipe(TE.right('a'), TE.chainFirst(flow(_.error, TE.fromIO)))

// $ExpectType TaskEither<never, string>
pipe(TE.right('a'), TE.chainFirst(flow(_.info, TE.fromIO)))

// $ExpectType TaskEither<never, string>
pipe(TE.right('a'), TE.chainFirst(flow(_.log, TE.fromIO)))

// $ExpectType TaskEither<never, string>
pipe(TE.right('a'), TE.chainFirst(flow(_.warn, TE.fromIO)))
