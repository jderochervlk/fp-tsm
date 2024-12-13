import { getFunctorComposition } from '../src/Functor.js'
import * as option from '../src/Option.js'
import * as RA from '../src/ReadonlyArray.js'
import * as U from './util.js'

describe('Functor', () => {
  it('getFunctorComposition', () => {
    const arrayOption = getFunctorComposition(RA.Functor, option.Functor)
    U.deepStrictEqual(arrayOption.map([option.some(1)], U.double), [option.some(2)])
  })
})
