import type { AnyArray } from "./ArrayTypes.ts"

/**
 * Reduces the array from left to right using the provided function and initial value.
 *
 * @category Folding Arrays
 * @example
 * ```ts
 * import { reduce } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(reduce([1, 2, 3], 0, (acc, x) => acc + x)).toBe(6)
 * expect(reduce([], 10, (acc, x) => acc + x)).toBe(10)
 * ```
 */
export const reduce = <A, B>(
  array: AnyArray<A>,
  initial: B,
  f: (acc: B, a: A) => B,
): B => {
  let acc = initial
  for (let i = 0; i < array.length; i++) {
    acc = f(acc, array[i])
  }
  return acc
}

/**
 * Reduces the array from right to left using the provided function and initial value.
 *
 * @category Folding Arrays
 * @example
 * ```ts
 * import { reduceRight } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(reduceRight([1, 2, 3], 0, (x, acc) => acc + x)).toBe(6)
 * expect(reduceRight([], 10, (x, acc) => acc + x)).toBe(10)
 * ```
 */
export const reduceRight = <A, B>(
  array: AnyArray<A>,
  initial: B,
  f: (a: A, acc: B) => B,
): B => {
  let acc = initial
  for (let i = array.length - 1; i >= 0; i--) {
    acc = f(array[i], acc)
  }
  return acc
}

/**
 * Reduces the array from left to right using the provided function and initial value, passing the index to the function.
 *
 * @category Folding Arrays
 * @example
 * ```ts
 * import { reduceWithIndex } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(reduceWithIndex([1, 2, 3], 0, (i, acc, x) => acc + x * i)).toBe(8)
 * // 0*1 + 1*2 + 2*3 = 0 + 2 + 6 = 8
 * ```
 */
export const reduceWithIndex = <A, B>(
  array: AnyArray<A>,
  initial: B,
  f: (index: number, acc: B, a: A) => B,
): B => {
  let acc = initial
  for (let i = 0; i < array.length; i++) {
    acc = f(i, acc, array[i])
  }
  return acc
}

/**
 * Reduces the array from right to left using the provided function and initial value, passing the index to the function.
 *
 * @category Folding Arrays
 * @example
 * ```ts
 * import { reduceRightWithIndex } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(reduceRightWithIndex([1, 2, 3], 0, (i, x, acc) => acc + x * i)).toBe(8)
 * // 2*3 + 1*2 + 0*1 = 6 + 2 + 0 = 8
 * ```
 */
export const reduceRightWithIndex = <A, B>(
  array: AnyArray<A>,
  initial: B,
  f: (index: number, a: A, acc: B) => B,
): B => {
  let acc = initial
  for (let i = array.length - 1; i >= 0; i--) {
    acc = f(i, array[i], acc)
  }
  return acc
}
