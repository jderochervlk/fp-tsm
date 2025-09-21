/**
 * Checks if a value is a number and not NaN.
 *
 * @category Refinements
 * @example isNumber
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { isNumber } from "@jvlk/fp-tsm/number"
 *
 * expect(isNumber(123)).toEqual(true)
 * expect(isNumber(NaN)).toEqual(false)
 * expect(isNumber("123")).toEqual(false)
 * ```
 */
export const isNumber = (n: unknown): n is number =>
  typeof n === "number" && !isNaN(n)
