import * as _ from '../src/Const.js'

//
// contramap
//

_.const_.contramap(_.make<boolean>(true), (s: string) => s.length) // $ExpectType Const<boolean, string>
