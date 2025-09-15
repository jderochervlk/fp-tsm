// @refinements Refining Arrays

import type { AnyArray } from "./ArraysTypes.ts"

/**
 * Checks if an array is empty.
 *
 * @example
 * ```ts
 * import { isEmpty } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(isEmpty([])).toBe(true)
 * expect(isEmpty([1, 2, 3])).toBe(false)
 * expect(isEmpty([undefined])).toBe(false)
 * ```
 */
export const isEmpty = <A>(array: AnyArray<A>): boolean => array.length === 0

/**
 * Checks if an array is not empty.
 *
 * @example
 * ```ts
 * import { isNotEmpty } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(isNotEmpty([])).toBe(false)
 * expect(isNotEmpty([1, 2, 3])).toBe(true)
 * expect(isNotEmpty([undefined])).toBe(true)
 * ```
 */
export const isNotEmpty = <A>(array: AnyArray<A>): boolean => array.length > 0
