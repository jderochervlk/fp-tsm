import * as B from '../src/boolean.js'
import * as N from '../src/number.js'
import * as _ from '../src/Semigroup.js'
import * as S from '../src/string.js'

//
// struct
//

// $ExpectType Semigroup<{ readonly a: string; readonly b: number; readonly c: boolean; }>
_.struct({ a: S.Semigroup, b: N.SemigroupSum, c: B.SemigroupAll })

//
// tuple
//

// $ExpectType Semigroup<readonly [string, number, boolean]>
_.tuple(S.Semigroup, N.SemigroupSum, B.SemigroupAll)

//
// getTupleSemigroup
//

_.getTupleSemigroup(_.semigroupString, _.semigroupSum, _.semigroupAll) // $ExpectType Semigroup<[string, number, boolean]>

//
// fold
//

_.fold(_.semigroupString)('', ['a']) // $ExpectType string
_.fold(_.semigroupString)('') // $ExpectType (as: readonly string[]) => string
