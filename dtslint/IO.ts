import { pipe } from '../src/function.js'
import * as _ from '../src/IO.js'

//
// Do
//

// $ExpectType IO<{ readonly a1: number; readonly a2: string; }>
pipe(
  _.Do,
  _.bind('a1', () => _.of(1)),
  _.bind('a2', () => _.of('b'))
)
