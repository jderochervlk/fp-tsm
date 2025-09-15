// @contructors Making Arrays
/**
 * Return a `Array` of length `n` with element `i` initialized with `f(i)`.
 *
 * @example makeBy
 * ```ts
 * import { makeBy } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const double = (i: number): number => i * 2
 * expect(makeBy(5, double)).toEqual([0, 2, 4, 6, 8])
 * expect(makeBy(-3, double)).toEqual([])
 * expect(makeBy(4.32164, double)).toEqual([0, 2, 4, 6])
 * ```
 */

export const makeBy = <A>(n: number, f: (i: number) => A): Array<A> => {
  const j = Math.max(0, Math.floor(n))
  if (j <= 0) return []
  const out: A[] = []
  for (let i = 0; i < j; i++) {
    out.push(f(i))
  }
  // deno-lint-ignore no-explicit-any
  return out as any
}

/**
 * Creates an `Array` from the values passed to it.
 *
 * @example of
 * ```ts
 * import { of } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(of(1, 2, 3)).toEqual([1, 2, 3])
 * expect(of('a', 'b', 'c')).toEqual(['a', 'b', 'c'])
 * expect(of()).toEqual([])
 * ```
 */
export const of = <A>(...elements: A[]): Array<A> => {
  return elements
}

/**
 * Create an `Array` containing a value repeated the specified number of times.
 *
 * Note. `n` is normalized to a non negative integer.
 *
 * @example replicate
 * ```ts
 * import { replicate } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(replicate(3, 'a')).toEqual(['a', 'a', 'a'])
 * expect(replicate(0, 42)).toEqual([])
 * expect(replicate(-2, true)).toEqual([])
 * ```
 */
export const replicate = <A>(n: number, a: A): Array<A> => {
  const j = Math.max(0, Math.floor(n))
  if (j <= 0) return []
  const out: A[] = []
  for (let i = 0; i < j; i++) {
    out.push(a)
  }
  // deno-lint-ignore no-explicit-any
  return out as any
}
