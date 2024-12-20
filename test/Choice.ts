import { fanin, splitChoice } from '../src/Choice.js'
import { left, right } from '../src/Either.js'
import * as R from '../src/Reader.js'
import * as U from './util.js'

describe('Choice', () => {
  it('splitChoice', () => {
    const ab = (s: string) => s.length
    const cd = (n: number) => n >= 2
    U.deepStrictEqual(splitChoice({ ...R.Choice, ...R.Category })(ab, cd)(right(3)), right(true))
    U.deepStrictEqual(splitChoice({ ...R.Choice, ...R.Category })(ab, cd)(right(1)), right(false))
    U.deepStrictEqual(splitChoice({ ...R.Choice, ...R.Category })(ab, cd)(left('foo')), left(3))
  })

  it('fanin', () => {
    const ac = (s: string) => s === s.toLowerCase()
    const bc = (n: number) => n >= 2
    U.deepStrictEqual(fanin({ ...R.Choice, ...R.Category })(ac, bc)(right(3)), true)
    U.deepStrictEqual(fanin({ ...R.Choice, ...R.Category })(ac, bc)(right(1)), false)
    U.deepStrictEqual(fanin({ ...R.Choice, ...R.Category })(ac, bc)(left('foo')), true)
    U.deepStrictEqual(fanin({ ...R.Choice, ...R.Category })(ac, bc)(left('A')), false)
  })
})
