// @mapping Mapping Arrays

import { dual } from "../internal.ts"
import type { AnyArray, ArrayType } from "./ArraysTypes.ts"

/**
 * Applies a function to each element of the array, where the function itself is an array of functions.
 * This is sometimes called "ap" or "flap" in functional programming.
 *
 * @example
 * ```ts
 * import { flap } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const fns = [(x: number) => x + 1, (x: number) => x * 2]
 * expect(flap(fns, 3)).toEqual([4, 6])
 * expect(flap([], 3)).toEqual([])
 * ```
 */
export const flap = <A, B>(
  fns: AnyArray<(a: A) => B>,
  value: A,
): ArrayType<typeof fns, B> => {
  return fns.map((fn) => fn(value)) as ArrayType<typeof fns, B>
}
/**
 * `map` applies the base function to each element of the array and collects the results in a new array.
 *
 * @example
 * ```ts
 * import { map } from "@jvlk/fp-tsm/Array"
 * import { pipe } from '@jvlk/fp-tsm'
 * import { expect } from "@std/expect/expect"
 *
 * const f = (n: number) => n * 2
 * expect(pipe([1, 2, 3], map(f))).toEqual([2, 4, 6])
 * ```
 */
export const map: {
  <A extends AnyArray<T>, T, U>(
    arr: A,
    fn: (x: A extends AnyArray<infer Y> ? Y : never) => U,
  ): ArrayType<A, U>
  <A extends AnyArray<T>, T, U>(
    fn: (x: A extends AnyArray<infer Y> ? Y : never) => U,
  ): (arr: A) => ArrayType<A, U>
} = dual(2, (arr, fn) => arr.map(fn))

/**
 * Same as `map`, but the iterating function takes both the index and the value of the element.
 *
 * @example
 * ```ts
 * import { Array, pipe } from '@jvlk/fp-tsm'
 * import { expect } from "@std/expect/expect"
 *
 * const arr = [10, 20, 30]
 * const addIndex = (value: number, index: number) => value + index
 * expect(pipe(arr, Array.mapWithIndex(addIndex))).toEqual([10, 21, 32])
 * ```
 */
export const mapWithIndex: {
  <A extends AnyArray<T>, T, U>(
    arr: A,
    fn: (x: A extends AnyArray<infer Y> ? Y : never, index: number) => U,
  ): ArrayType<A, U>
  <A extends AnyArray<T>, T, U>(
    fn: (x: A extends AnyArray<infer Y> ? Y : never, index: number) => U,
  ): (arr: A) => ArrayType<A, U>
} = dual(2, (arr, fn) => arr.map(fn))
