import * as B from '../src/boolean.js'
import * as _ from '../src/Eq.js'
import * as N from '../src/number.js'
import * as S from '../src/string.js'

//
// struct
//

// $ExpectType Eq<{ readonly a: string; readonly b: number; readonly c: boolean; }>
_.struct({ a: S.Eq, b: N.Eq, c: B.Eq })

//
// tuple
//

// $ExpectType Eq<readonly [string, number, boolean]>
_.tuple(S.Eq, N.Eq, B.Eq)

//
// getTupleEq
//

_.getTupleEq(_.eqString, _.eqNumber, _.eqBoolean) // $ExpectType Eq<[string, number, boolean]>
