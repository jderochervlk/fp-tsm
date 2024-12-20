import * as E from '../src/Either.js'
import { pipe } from '../src/function.js'
import * as _ from '../src/Json.js'
import * as U from './util.js'

describe('Json', () => {
  it('parse', () => {
    U.deepStrictEqual(pipe('{"a":1}', _.parse), E.right({ a: 1 }))
    U.deepStrictEqual(
      pipe('{"a":}', _.parse),
      E.left(new SyntaxError(`Unexpected token '}', "{"a":}" is not valid JSON`))
    )
  })

  it('stringify', () => {
    U.deepStrictEqual(pipe({ a: 1 }, _.stringify), E.right('{"a":1}'))
    const circular: any = { ref: null }
    circular.ref = circular
    U.deepStrictEqual(
      pipe(
        circular,
        _.stringify,
        E.mapLeft((e) => (e as Error).message.includes('Converting circular structure to JSON'))
      ),
      E.left(true)
    )
    type Person = {
      readonly name: string
      readonly age: number
    }
    const person: Person = { name: 'Giulio', age: 45 }
    U.deepStrictEqual(pipe(person, _.stringify), E.right('{"name":"Giulio","age":45}'))

    U.deepStrictEqual(_.stringify(undefined as any), E.left(new Error('Converting unsupported structure to JSON')))
  })
})
