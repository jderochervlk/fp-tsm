import { dual } from "./internal.ts"
import * as Option from "./Option.ts"

/**
 * Looks up a value on an object by its key and returns it wrapped in an `Option`.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Object.lookup({ foo: 'bar'}, 'foo')).toEqual(Option.some('bar'))
 *
 * expect(Object.lookup({ foo: null }, 'foo')).toEqual(Option.none)
 * ```
 */
const lookup: {
  <O, K extends keyof O>(
    key: K,
  ): (self: O) => O[K]
  <O, K extends keyof O>(self: O, key: K): Option.Option<O[K]>
} = dual(2, (obj, key) => Option.of(obj[key]))

declare global {
  interface Object {
    lookup: typeof lookup
  }
}

Object.lookup = lookup
