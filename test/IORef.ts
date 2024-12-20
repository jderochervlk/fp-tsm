import { pipe } from '../src/function.js'
import * as I from '../src/IO.js'
import { IORef, newIORef } from '../src/IORef.js'
import * as U from './util.js'

describe('IORef', () => {
  it('read', () => {
    const ref = new IORef(1)
    U.deepStrictEqual(ref.read(), 1)
  })

  it('write', () => {
    const ref = new IORef(1)
    U.deepStrictEqual(
      pipe(
        ref.write(2),
        I.chain(() => ref.read)
      )(),
      2
    )
  })

  it('modify', () => {
    const ref = new IORef(1)
    U.deepStrictEqual(
      pipe(
        ref.modify(U.double),
        I.chain(() => ref.read)
      )(),
      2
    )
  })

  it('newIORef', () => {
    U.deepStrictEqual(
      pipe(
        newIORef(1),
        I.chain((ref) => ref.read)
      )(),
      1
    )
  })

  it('pipe', () => {
    const ref = new IORef(1)
    pipe(2, ref.write)()
    U.deepStrictEqual(ref.read(), 2)
    pipe(() => 3, ref.modify)()
    U.deepStrictEqual(ref.read(), 3)
  })
})
