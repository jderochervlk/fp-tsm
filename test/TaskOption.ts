import * as E from '../src/Either.js'
import { pipe, SK } from '../src/function.js'
import * as IO from '../src/IO.js'
import * as O from '../src/Option.js'
import * as RA from '../src/ReadonlyArray.js'
import { ReadonlyNonEmptyArray } from '../src/ReadonlyNonEmptyArray.js'
import * as T from '../src/Task.js'
import * as TE from '../src/TaskEither.js'
import * as _ from '../src/TaskOption.js'
import * as U from './util.js'

describe('TaskOption', () => {
  // -------------------------------------------------------------------------------------
  // type class members
  // -------------------------------------------------------------------------------------

  it('map', async () => {
    U.deepStrictEqual(await pipe(_.some(1), _.map(U.double))(), O.some(2))
  })

  it('ap', async () => {
    U.deepStrictEqual(await pipe(_.some(U.double), _.ap(_.some(2)))(), O.some(4))
    U.deepStrictEqual(await pipe(_.some(U.double), _.ap(_.none))(), O.none)
    U.deepStrictEqual(await pipe(_.none, _.ap(_.some(2)))(), O.none)
    U.deepStrictEqual(await pipe(_.none, _.ap(_.none))(), O.none)
  })

  it('flatMap', async () => {
    const f = (n: number) => _.some(n * 2)
    const g = () => _.none
    U.deepStrictEqual(await pipe(_.some(1), _.flatMap(f))(), O.some(2))
    U.deepStrictEqual(await pipe(_.none, _.flatMap(f))(), O.none)
    U.deepStrictEqual(await pipe(_.some(1), _.flatMap(g))(), O.none)
    U.deepStrictEqual(await pipe(_.none, _.flatMap(g))(), O.none)

    U.deepStrictEqual(await _.flatMap(_.some(1), f)(), O.some(2))
    U.deepStrictEqual(await _.flatMap(_.none, f)(), O.none)
    U.deepStrictEqual(await _.flatMap(_.some(1), g)(), O.none)
    U.deepStrictEqual(await _.flatMap(_.none, g)(), O.none)
  })

  it('chain', async () => {
    const f = (n: number) => _.some(n * 2)
    const g = () => _.none
    U.deepStrictEqual(await pipe(_.some(1), _.chain(f))(), O.some(2))
    U.deepStrictEqual(await pipe(_.none, _.chain(f))(), O.none)
    U.deepStrictEqual(await pipe(_.some(1), _.chain(g))(), O.none)
    U.deepStrictEqual(await pipe(_.none, _.chain(g))(), O.none)
  })

  it('alt', async () => {
    U.deepStrictEqual(
      await pipe(
        _.some(1),
        _.alt(() => _.some(2))
      )(),
      O.some(1)
    )
    U.deepStrictEqual(
      await pipe(
        _.some(2),
        _.alt(() => _.none as _.TaskOption<number>)
      )(),
      O.some(2)
    )
    U.deepStrictEqual(
      await pipe(
        _.none,
        _.alt(() => _.some(1))
      )(),
      O.some(1)
    )
    U.deepStrictEqual(
      await pipe(
        _.none,
        _.alt(() => _.none)
      )(),
      O.none
    )
  })

  it('zero', async () => {
    U.deepStrictEqual(await _.zero()(), O.none)
  })

  it('fromIO', async () => {
    U.deepStrictEqual(await _.fromIO(() => 1)(), O.some(1))
  })

  // -------------------------------------------------------------------------------------
  // instances
  // -------------------------------------------------------------------------------------

  it('ApplicativeSeq', async () => {
    await U.assertSeq(_.ApplySeq, _.FromTask, (fa) => fa())
    await U.assertSeq(_.ApplicativeSeq, _.FromTask, (fa) => fa())
  })

  it('ApplicativePar', async () => {
    await U.assertPar(_.ApplyPar, _.FromTask, (fa) => fa())
    await U.assertPar(_.ApplicativePar, _.FromTask, (fa) => fa())
  })

  // -------------------------------------------------------------------------------------
  // constructors
  // -------------------------------------------------------------------------------------

  describe('tryCatch', () => {
    test('with a resolving promise', async () => {
      U.deepStrictEqual(await _.tryCatch(() => Promise.resolve(1))(), O.some(1))
    })

    test('with a rejected promise', async () => {
      U.deepStrictEqual(await _.tryCatch(() => Promise.reject(1))(), O.none)
    })

    test('with a thrown error', async () => {
      U.deepStrictEqual(
        await _.tryCatch(() => {
          throw new Error('Some error')
        })(),
        O.none
      )
    })
  })

  it('fromNullable', async () => {
    U.deepStrictEqual(await _.fromNullable(1)(), O.some(1))
    U.deepStrictEqual(await _.fromNullable(null)(), O.none)
    U.deepStrictEqual(await _.fromNullable(undefined)(), O.none)
  })

  it('fromNullableK', async () => {
    const f = _.fromNullableK((n: number) => (n > 0 ? n : n === 0 ? null : undefined))
    U.deepStrictEqual(await f(1)(), O.some(1))
    U.deepStrictEqual(await f(0)(), O.none)
    U.deepStrictEqual(await f(-1)(), O.none)
  })

  it('chainNullableK', async () => {
    const f = _.chainNullableK((n: number) => (n > 0 ? n : n === 0 ? null : undefined))
    U.deepStrictEqual(await f(_.of(1))(), O.some(1))
    U.deepStrictEqual(await f(_.of(0))(), O.none)
    U.deepStrictEqual(await f(_.of(-1))(), O.none)
  })

  it('fromPredicate', async () => {
    const p = (n: number): boolean => n > 2
    const f = _.fromPredicate(p)
    U.deepStrictEqual(await f(1)(), O.none)
    U.deepStrictEqual(await f(3)(), O.some(3))
  })

  it('fromTaskEither', async () => {
    const pl = TE.left('a')
    const pr = TE.right('a')
    const fl = _.fromTaskEither(pl)
    const fr = _.fromTaskEither(pr)
    U.deepStrictEqual(await fl(), O.none)
    U.deepStrictEqual(await fr(), O.some('a'))
  })

  // -------------------------------------------------------------------------------------
  // destructors
  // -------------------------------------------------------------------------------------

  it('fold', async () => {
    const f = _.fold(
      () => T.of('none'),
      (a) => T.of(`some(${a})`)
    )
    U.deepStrictEqual(await pipe(_.some(1), f)(), 'some(1)')
    U.deepStrictEqual(await pipe(_.none, f)(), 'none')
  })

  it('getOrElse', async () => {
    U.deepStrictEqual(
      await pipe(
        _.some(1),
        _.getOrElse(() => T.of(2))
      )(),
      1
    )
    U.deepStrictEqual(
      await pipe(
        _.none,
        _.getOrElse(() => T.of(2))
      )(),
      2
    )
  })

  // -------------------------------------------------------------------------------------
  // combinators
  // -------------------------------------------------------------------------------------

  it('fromOptionK', async () => {
    const f = _.fromOptionK((n: number) => (n > 0 ? O.some(n) : O.none))
    U.deepStrictEqual(await f(1)(), O.some(1))
    U.deepStrictEqual(await f(-1)(), O.none)
  })

  it('chainOptionK', async () => {
    const f = _.chainOptionK((n: number) => (n > 0 ? O.some(n) : O.none))
    U.deepStrictEqual(await f(_.some(1))(), O.some(1))
    U.deepStrictEqual(await f(_.some(-1))(), O.none)
    U.deepStrictEqual(await f(_.none)(), O.none)
  })

  describe('array utils', () => {
    const input: ReadonlyNonEmptyArray<string> = ['a', 'b']

    it('traverseReadonlyArrayWithIndex', async () => {
      const f = _.traverseReadonlyArrayWithIndex((i, a: string) => (a.length > 0 ? _.some(a + i) : _.none))
      U.deepStrictEqual(await pipe(RA.empty, f)(), O.some(RA.empty))
      U.deepStrictEqual(await pipe(input, f)(), O.some(['a0', 'b1']))
      U.deepStrictEqual(await pipe(['a', ''], f)(), O.none)
    })

    it('traverseReadonlyArrayWithIndexSeq', async () => {
      const f = _.traverseReadonlyArrayWithIndexSeq((i, a: string) => (a.length > 0 ? _.some(a + i) : _.none))
      U.deepStrictEqual(await pipe(RA.empty, f)(), O.some(RA.empty))
      U.deepStrictEqual(await pipe(input, f)(), O.some(['a0', 'b1']))
      U.deepStrictEqual(await pipe(['a', ''], f)(), O.none)
    })

    it('sequenceReadonlyArray', async () => {
      const log: Array<number | string> = []
      const some = (n: number): _.TaskOption<number> =>
        _.fromIO(() => {
          log.push(n)
          return n
        })
      const none = (s: string): _.TaskOption<number> =>
        pipe(
          T.fromIO(() => {
            log.push(s)
            return s
          }),
          T.map(() => O.none)
        )
      U.deepStrictEqual(await pipe([some(1), some(2)], _.traverseReadonlyArrayWithIndex(SK))(), O.some([1, 2]))
      U.deepStrictEqual(await pipe([some(3), none('a')], _.traverseReadonlyArrayWithIndex(SK))(), O.none)
      U.deepStrictEqual(await pipe([none('b'), some(4)], _.traverseReadonlyArrayWithIndex(SK))(), O.none)
      U.deepStrictEqual(log, [1, 2, 3, 'a', 'b', 4])
    })

    it('sequenceReadonlyArraySeq', async () => {
      const log: Array<number | string> = []
      const some = (n: number): _.TaskOption<number> =>
        _.fromIO(() => {
          log.push(n)
          return n
        })
      const none = (s: string): _.TaskOption<number> =>
        pipe(
          T.fromIO(() => {
            log.push(s)
            return s
          }),
          T.map(() => O.none)
        )
      U.deepStrictEqual(await pipe([some(1), some(2)], _.traverseReadonlyArrayWithIndexSeq(SK))(), O.some([1, 2]))
      U.deepStrictEqual(await pipe([some(3), none('a')], _.traverseReadonlyArrayWithIndexSeq(SK))(), O.none)
      U.deepStrictEqual(await pipe([none('b'), some(4)], _.traverseReadonlyArrayWithIndexSeq(SK))(), O.none)
      U.deepStrictEqual(log, [1, 2, 3, 'a', 'b'])
    })

    // old
    it('sequenceArray', async () => {
      const log: Array<number | string> = []
      const some = (n: number): _.TaskOption<number> =>
        _.fromIO(() => {
          log.push(n)
          return n
        })
      const none = (s: string): _.TaskOption<number> =>
        pipe(
          T.fromIO(() => {
            log.push(s)
            return s
          }),
          T.map(() => O.none)
        )
      U.deepStrictEqual(await pipe([some(1), some(2)], _.sequenceArray)(), O.some([1, 2]))
      U.deepStrictEqual(await pipe([some(3), none('a')], _.sequenceArray)(), O.none)
      U.deepStrictEqual(await pipe([none('b'), some(4)], _.sequenceArray)(), O.none)
      U.deepStrictEqual(log, [1, 2, 3, 'a', 'b', 4])
    })

    it('sequenceSeqArray', async () => {
      const log: Array<number | string> = []
      const some = (n: number): _.TaskOption<number> =>
        _.fromIO(() => {
          log.push(n)
          return n
        })
      const none = (s: string): _.TaskOption<number> =>
        pipe(
          T.fromIO(() => {
            log.push(s)
            return s
          }),
          T.map(() => O.none)
        )
      U.deepStrictEqual(await pipe([some(1), some(2)], _.sequenceSeqArray)(), O.some([1, 2]))
      U.deepStrictEqual(await pipe([some(3), none('a')], _.sequenceSeqArray)(), O.none)
      U.deepStrictEqual(await pipe([none('b'), some(4)], _.sequenceSeqArray)(), O.none)
      U.deepStrictEqual(log, [1, 2, 3, 'a', 'b'])
    })
  })

  describe('tryCatchK', () => {
    test('with a resolved promise', async () => {
      const g = _.tryCatchK((a: number) => Promise.resolve(a))
      U.deepStrictEqual(await g(1)(), O.some(1))
    })

    test('with a rejected promise', async () => {
      const g = _.tryCatchK((a: number) => Promise.reject(a))
      U.deepStrictEqual(await g(-1)(), O.none)
    })

    test('with a thrown error', async () => {
      const g = _.tryCatchK((_: number) => {
        throw new Error('Some error')
      })
      U.deepStrictEqual(await g(-1)(), O.none)
    })
  })

  it('match', async () => {
    const f = _.match(
      () => 'none',
      (a) => `some(${a})`
    )
    U.deepStrictEqual(await pipe(_.some(1), f)(), 'some(1)')
    U.deepStrictEqual(await pipe(_.none, f)(), 'none')
  })

  it('matchE', async () => {
    const f = _.matchE(
      () => T.of('none'),
      (a) => T.of(`some(${a})`)
    )
    U.deepStrictEqual(await pipe(_.some(1), f)(), 'some(1)')
    U.deepStrictEqual(await pipe(_.none, f)(), 'none')
  })

  it('fromEitherK', async () => {
    const f = (s: string) => (s.length <= 2 ? E.right(s + '!') : E.left(s.length))
    const g = _.fromEitherK(f)
    U.deepStrictEqual(await g('')(), O.some('!'))
    U.deepStrictEqual(await g('a')(), O.some('a!'))
    U.deepStrictEqual(await g('aa')(), O.some('aa!'))
    U.deepStrictEqual(await g('aaa')(), O.none)
  })

  it('chainEitherK', async () => {
    const f = (s: string) => (s.length <= 2 ? E.right(s + '!') : E.left(s.length))
    const g = _.chainEitherK(f)
    U.deepStrictEqual(await g(_.of(''))(), O.some('!'))
    U.deepStrictEqual(await g(_.of('a'))(), O.some('a!'))
    U.deepStrictEqual(await g(_.of('aa'))(), O.some('aa!'))
    U.deepStrictEqual(await g(_.of('aaa'))(), O.none)
  })

  it('tapEither', async () => {
    const f = (s: string) => (s.length <= 2 ? E.right(s + '!') : E.left(s.length))
    const g = _.tapEither(f)
    U.deepStrictEqual(await g(_.of(''))(), O.some(''))
    U.deepStrictEqual(await g(_.of('a'))(), O.some('a'))
    U.deepStrictEqual(await g(_.of('aa'))(), O.some('aa'))
    U.deepStrictEqual(await g(_.of('aaa'))(), O.none)
  })

  it('chainFirstEitherK', async () => {
    const f = (s: string) => (s.length <= 2 ? E.right(s + '!') : E.left(s.length))
    const g = _.chainFirstEitherK(f)
    U.deepStrictEqual(await g(_.of(''))(), O.some(''))
    U.deepStrictEqual(await g(_.of('a'))(), O.some('a'))
    U.deepStrictEqual(await g(_.of('aa'))(), O.some('aa'))
    U.deepStrictEqual(await g(_.of('aaa'))(), O.none)
  })

  it('tapIO', async () => {
    const ref: Array<number> = []
    const add = (value: number) => () => ref.push(value)

    U.deepStrictEqual(await pipe(_.of(1), _.tapIO(add))(), O.of(1))
    U.deepStrictEqual(await pipe(_.none, _.tapIO(add))(), O.none)
    U.deepStrictEqual(ref, [1])
  })

  it('as', async () => {
    U.deepStrictEqual(await pipe(_.some('a'), _.as('b'))(), O.some('b'))
    U.deepStrictEqual(await _.as(_.of('a'), 'b')(), O.some('b'))
    U.deepStrictEqual(await _.as(_.none, 'b')(), O.none)
  })

  it('asUnit', async () => {
    U.deepStrictEqual(await pipe(_.some('a'), _.asUnit)(), O.some(undefined))
  })

  it('tapIO', async () => {
    const ref: Array<number> = []
    const add = (value: number) => T.fromIO(() => ref.push(value))

    U.deepStrictEqual(await pipe(_.of(1), _.tapTask(add))(), O.of(1))
    U.deepStrictEqual(await pipe(_.none, _.tapTask(add))(), O.none)
    U.deepStrictEqual(ref, [1])
  })

  it('flatMapIO', async () => {
    U.deepStrictEqual(
      await pipe(
        _.of(1),
        _.flatMapIO(() => IO.of(2))
      )(),
      O.of(2)
    )
  })

  it('flatMapTask', async () => {
    const f = (s: string) => T.of(s.length)
    U.deepStrictEqual(await pipe(_.of('a'), _.flatMapTask(f))(), O.of(1))
  })
})
