// @sequencing Sequencing Arrays

import { dual } from "../internal.ts"
import type { AnyArray, ArrayType } from "./ArraysTypes.ts"

/**
 * Applies a function to each element of the array and flattens the result by one level.
 *
 * @example
 * ```ts
 * import { Array, pipe } from '@jvlk/fp-tsm'
 * import { expect } from "@std/expect/expect"
 *
 * const arr = [1, 2, 3]
 * const duplicate = (n: number) => [n, n]
 * expect(pipe(arr, Array.flatMap(duplicate))).toEqual([1, 1, 2, 2, 3, 3])
 * ```
 */
export const flatMap: {
  <A extends AnyArray<T>, T, U>(
    arr: A,
    fn: (x: T) => AnyArray<U>,
  ): ArrayType<A, U>
  <A extends AnyArray<T>, T, U>(
    fn: (x: T) => AnyArray<U>,
  ): (arr: A) => ArrayType<A, U>
} = dual(2, (arr, fn) => arr.flatMap(fn))

/**
 * Flattens an array of arrays into a single array.
 *
 * @example
 * ```ts
 * import { flatten } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(flatten([[1, 2], [3], [], [4, 5]])).toEqual([1, 2, 3, 4, 5])
 * ```
 */
export const flatten = <A>(
  arr: AnyArray<AnyArray<A>>,
): ArrayType<typeof arr, A> => {
  const out: A[] = []
  for (const inner of arr) {
    out.push(...inner)
  }
  return out as ArrayType<typeof arr, A>
}
