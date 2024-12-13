import * as B from '../src/boolean.js'
import * as N from '../src/number.js'
import * as _ from '../src/Ord.js'
import * as S from '../src/string.js'

//
// tuple
//

// $ExpectType Ord<readonly [string, number, boolean]>
_.tuple(S.Ord, N.Ord, B.Ord)

//
// getTupleOrd
//

_.getTupleOrd(_.ordString, _.ordNumber, _.ordBoolean) // $ExpectType Ord<[string, number, boolean]>
