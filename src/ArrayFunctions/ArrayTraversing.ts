// @traversing Traversing Arrays

import * as Option from "../Option.ts"
import { dual } from "../internal.ts"
import type { AnyArray, ArrayType } from "./ArrayTypes.ts"

/**
 * Traverse an array with an effectful function, collecting the results in an array.
 * The function should return an Option for each element.
 *
 * @category Traversing Arrays
 * @example
 * ```ts
 * import { Array, Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const parse = (s: string) => s.length > 0 ? Option.some(s.length) : Option.none
 * expect(Array.traverse(["a", "bb", ""], parse)).toEqual(Option.none)
 * expect(Array.traverse(["a", "bb"], parse)).toEqual(Option.some([1, 2]))
 * ```
 */
export const traverse: <A, B>(
  arr: AnyArray<A>,
  fn: (a: A) => Option.Option<B>,
) => Option.Option<ArrayType<typeof arr, B>> = dual(
  2,
  <A, B>(
    arr: AnyArray<A>,
    fn: (a: A) => Option.Option<B>,
  ): Option.Option<ArrayType<typeof arr, B>> => {
    const out: B[] = []
    for (let i = 0; i < arr.length; i++) {
      const ob = fn(arr[i])
      if (ob._tag === "None") return Option.none
      out.push(ob.value)
    }
    return Option.some(out as ArrayType<typeof arr, B>)
  },
)
/**
 * Converts an array of Options into an Option of an array.
 * Returns `Option.none` if any element is `Option.none`, otherwise returns `Option.some` of the array of values.
 *
 * @category Traversing Arrays
 * @example
 * ```ts
 * import { Array, Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(Array.sequence([Option.some(1), Option.some(2)])).toEqual(Option.some([1, 2]))
 * expect(Array.sequence([Option.some(1), Option.none])).toEqual(Option.none)
 * ```
 */
export const sequence = <A>(
  arr: AnyArray<Option.Option<A>>,
): Option.Option<ArrayType<typeof arr, A>> => {
  const out: A[] = []
  for (let i = 0; i < arr.length; i++) {
    const oa = arr[i]
    if (oa._tag === "None") return Option.none
    out.push(oa.value)
  }
  return Option.some(out as ArrayType<typeof arr, A>)
}
