import { dual } from "./internal.ts"
import * as Option from "./Option.ts"

/**
 * Looks up a value on an object by its key and returns it wrapped in an `Option`.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, Object } from "@jvlk/fp-tsm"
 *
 * expect(Object.lookup({ foo: 'bar'}, 'foo')).toEqual(Option.some('bar'))
 *
 * expect(Object.lookup({ foo: null }, 'foo')).toEqual(Option.none)
 * ```
 */
export const lookup: {
  <O, K extends keyof O>(
    key: K,
  ): (self: O) => O[K]
  <O, K extends keyof O>(self: O, key: K): Option.Option<O[K]>
} = dual(2, (obj, key) => Option.of(obj[key]))

/**
 * This module provides utility functions for working with objects.
 * The `Object` import extends the global `Object` constructor with additional methods, which means that you can use the new functions alongside the standard object methods.
 *
 * @module
 */
export const Object = { ...globalThis.Object, lookup }
