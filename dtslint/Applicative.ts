import * as _ from '../src/Applicative.js'
import * as E from '../src/Either.js'
import * as R from '../src/Reader.js'
import * as S from '../src/Semigroup.js'

//
// getApplicativeComposition
//

const applicativeValidation = E.getValidation(S.semigroupString)

_.getApplicativeComposition(R.reader, applicativeValidation).map // $ExpectType <FE, A, B>(fa: Reader<FE, Either<string, A>>, f: (a: A) => B) => Reader<FE, Either<string, B>>
