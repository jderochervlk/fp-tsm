// @filtering Filtering Arrays

import { dual } from "../internal.ts"
import type * as Option from "../Option.ts"
import { map } from "./ArraysMapping.ts"
import type { AnyArray, ArrayType } from "./ArraysTypes.ts"
export const compact = <T>(
  array: AnyArray<Option.Option<T>>,
): ArrayType<
  typeof array extends ReadonlyArray<Option.Option<T>>
    ? ReadonlyArray<Option.Option<T>>
    : Array<Option.Option<T>>,
  T
> => {
  const onlySomes = map(array, (o) => (o._tag === "Some" ? o.value : null))
  return filter(onlySomes, isNotNull)
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

/**
 * Given an iterating function that is a `Predicate` or a `Refinement`,
 * `filter` creates a new `Array` containing the elements of the original `Array` for which the iterating function is `true`.
 *
 * @example
 * ```ts
 * import { pipe } from "@jvlk/fp-tsm"
 * import { filter, map } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const numbers = [1, 2, 3, 4]
 * const isEven = (n: number) => n % 2 === 0
 *
 * const result = pipe(
 *   numbers,
 *   filter(isEven)
 * )
 * expect(result).toEqual([2, 4])
 * ```
 *
 * @example type guard
 * ```ts
 * import { pipe } from "@jvlk/fp-tsm"
 * import { filter, map } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const items = [1, "a", 2, "b", 3]
 * const isNumber = (x: unknown): x is number => typeof x === "number"
 * const add = (x: number) => x + 1
 *
 * const onlyNumbers = pipe(
 *   items,
 *   filter(isNumber),
 *   map(add)
 * )
 *
 * expect(onlyNumbers).toEqual([2, 3, 4])
 * ```
 *
 * @example data first
 * ```ts
 * import { filter, map } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const items = [1, "a", 2, "b", 3]
 * const isNumber = (x: unknown): x is number => typeof x === "number"
 * const isEven = (n: number) => n % 2 === 0
 *
 * const onlyNumbers = filter(items, isNumber)
 *
 * expect(onlyNumbers).toEqual([1, 2, 3])
 *
 * const onlyEven = filter(onlyNumbers, isEven)
 *
 * expect(onlyEven).toEqual([2])
 * ```
 */
export const filter: {
  // point free type guard
  <A, B extends A>(
    predicate: (x: A) => x is B,
  ): (array: AnyArray<A>) => ArrayType<
    typeof array extends ReadonlyArray<A> ? ReadonlyArray<A>
      : Array<A>,
    B
  >

  // point free boolean
  <A>(
    predicate: (a: A) => boolean,
  ): (
    array: AnyArray<A>,
  ) => ArrayType<
    typeof array extends ReadonlyArray<A> ? ReadonlyArray<A>
      : Array<A>,
    A
  >

  // data first type guard
  <A, B extends A>(
    array: AnyArray<A>,
    predicate: (x: A) => x is B,
  ): ArrayType<
    typeof array extends ReadonlyArray<A> ? ReadonlyArray<A>
      : Array<A>,
    B
  >

  // data first boolean
  <T extends AnyArray<A>, A>(
    array: T,
    predicate: (a: A) => boolean,
  ): ArrayType<
    typeof array extends ReadonlyArray<A> ? ReadonlyArray<A>
      : Array<A>,
    A
  >
} = dual(2, <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): AnyArray<A> => {
  return array.filter(predicate)
})

/**
 * Maps an array with an iterating function that returns an `Option` and it keeps only the `Some` values discarding the `None`s.
 *
 * @example point free
 * ```ts
 * import { pipe, Option, Array } from '@jvlk/fp-tsm'
 * import { expect } from "@std/expect/expect"
 *
 * const f = (s: string) => (s.length === 1 ? Option.some(s.toUpperCase()) : Option.none)
 * expect(pipe(['a', 'no', 'neither', 'b'], arr => Array.filterMap(arr, f))).toEqual(['A', 'B'])
 * ```
 * @example data first
 * ```ts
 * import { pipe, Option, Array } from '@jvlk/fp-tsm'
 * import { expect } from "@std/expect/expect"
 *
 * const f = (s: string) => (s.length === 1 ? Option.some(s.toUpperCase()) : Option.none)
 * expect(Array.filterMap(['a', 'no', 'neither', 'b'], f)).toEqual(['A', 'B'])
 * ```
 */
export const filterMap: <T extends AnyArray<A>, A, B>(
  array: T,
  fn: (a: A) => Option.Option<B>,
) => ArrayType<T, B> = dual(
  2,
  <T extends AnyArray<A>, A, B>(
    array: T,
    fn: (a: A) => Option.Option<B>,
  ): ArrayType<T, B> => {
    const out = []
    for (let i = 0; i < array.length; i++) {
      const optionB = fn(array[i])
      if (optionB._tag === "Some") {
        out.push(optionB.value)
      }
    }
    return out as ArrayType<T, B>
  },
)

/**
 * Maps an array with an iterating function that returns an `Option`, keeping only the `Some` values, and passes the index to the function.
 *
 * @example
 * ```ts
 * import { Array, Option } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const f = (s: string, i: number) => s.length === i + 1 ? Option.some(s.toUpperCase()) : Option.none
 * expect(Array.filterMapWithIndex(['a', 'bb', 'ccc'], f)).toEqual(['A', 'BB', 'CCC'])
 * ```
 */
export const filterMapWithIndex: <T extends AnyArray<A>, A, B>(
  array: T,
  fn: (a: A, i: number) => Option.Option<B>,
) => ArrayType<T, B> = dual(
  2,
  <T extends AnyArray<A>, A, B>(
    array: T,
    fn: (a: A, i: number) => Option.Option<B>,
  ): ArrayType<T, B> => {
    const out: B[] = []
    for (let i = 0; i < array.length; i++) {
      const optionB = fn(array[i], i)
      if (optionB._tag === "Some") {
        out.push(optionB.value)
      }
    }
    return out as ArrayType<T, B>
  },
)

/**
 * Filters an array using a predicate that receives both the value and its index.
 *
 * @example
 * ```ts
 * import { Array } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const arr = [10, 20, 30, 40]
 * const evenIndex = (value: number, index: number) => index % 2 === 0
 * expect(Array.filterWithIndex(arr, evenIndex)).toEqual([10, 30])
 * ```
 */
export const filterWithIndex: {
  <A>(
    array: AnyArray<A>,
    predicate: (a: A, i: number) => boolean,
  ): ArrayType<typeof array, A>
  <A>(
    predicate: (a: A, i: number) => boolean,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(
    array: AnyArray<A>,
    predicate: (a: A, i: number) => boolean,
  ): ArrayType<typeof array, A> => {
    const out: A[] = []
    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i], i)) out.push(array[i])
    }
    return out as ArrayType<typeof array, A>
  },
)

/**
 * Splits an array into two arrays: one with elements satisfying the predicate, and one with the rest.
 *
 * @example
 * ```ts
 * import { Array } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const arr = [1, 2, 3, 4]
 * const isEven = (n: number) => n % 2 === 0
 * expect(Array.partition(arr, isEven)).toEqual([[2, 4], [1, 3]])
 * ```
 */
export const partition = <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): [ArrayType<typeof array, A>, ArrayType<typeof array, A>] => {
  const yes: A[] = []
  const no: A[] = []
  for (const x of array) {
    if (predicate(x)) yes.push(x)
    else no.push(x)
  }
  return [yes as ArrayType<typeof array, A>, no as ArrayType<typeof array, A>]
}

/**
 * Maps each element to an Either, then partitions the results into lefts and rights.
 *
 * @example
 * ```ts
 * import { Array, Either } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const f = (n: number) => n % 2 === 0 ? Either.right(n) : Either.left(n)
 * expect(Array.partitionMap([1, 2, 3, 4], f)).toEqual([[1, 3], [2, 4]])
 * ```
 */
export const partitionMap: <T extends AnyArray<A>, A, L, R>(
  array: T,
  fn: (a: A) => { _tag: "Left"; left: L } | { _tag: "Right"; right: R },
) => [ArrayType<T, L>, ArrayType<T, R>] = dual(
  2,
  <T extends AnyArray<A>, A, L, R>(
    array: T,
    fn: (a: A) => { _tag: "Left"; left: L } | { _tag: "Right"; right: R },
  ): [ArrayType<T, L>, ArrayType<T, R>] => {
    const lefts: L[] = []
    const rights: R[] = []
    for (let i = 0; i < array.length; i++) {
      const e = fn(array[i])
      if (e._tag === "Left") lefts.push(e.left)
      else rights.push(e.right)
    }
    return [lefts as ArrayType<T, L>, rights as ArrayType<T, R>]
  },
)

/**
 * Maps each element and its index to an Either, then partitions the results into lefts and rights.
 *
 * @example
 * ```ts
 * import { Array, Either } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const f = (n: number, i: number) => i % 2 === 0 ? Either.right(n) : Either.left(n)
 * expect(Array.partitionMapWithIndex([1, 2, 3, 4], f)).toEqual([[2, 4], [1, 3]])
 * ```
 */
export const partitionMapWithIndex: <T extends AnyArray<A>, A, L, R>(
  array: T,
  fn: (
    a: A,
    i: number,
  ) => { _tag: "Left"; left: L } | { _tag: "Right"; right: R },
) => [ArrayType<T, L>, ArrayType<T, R>] = dual(
  2,
  <T extends AnyArray<A>, A, L, R>(
    array: T,
    fn: (
      a: A,
      i: number,
    ) => { _tag: "Left"; left: L } | { _tag: "Right"; right: R },
  ): [ArrayType<T, L>, ArrayType<T, R>] => {
    const lefts: L[] = []
    const rights: R[] = []
    for (let i = 0; i < array.length; i++) {
      const e = fn(array[i], i)
      if (e._tag === "Left") lefts.push(e.left)
      else rights.push(e.right)
    }
    return [lefts as ArrayType<T, L>, rights as ArrayType<T, R>]
  },
)

/**
 * Splits an array into two arrays using a predicate that receives both value and index.
 *
 * @example
 * ```ts
 * import { Array } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const arr = [10, 20, 30, 40]
 * const evenIndex = (value: number, index: number) => index % 2 === 0
 * expect(Array.partitionWithIndex(arr, evenIndex)).toEqual([[10, 30], [20, 40]])
 * ```
 */
export const partitionWithIndex = <A>(
  array: AnyArray<A>,
  predicate: (a: A, i: number) => boolean,
): [ArrayType<typeof array, A>, ArrayType<typeof array, A>] => {
  const yes: A[] = []
  const no: A[] = []
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) yes.push(array[i])
    else no.push(array[i])
  }
  return [yes as ArrayType<typeof array, A>, no as ArrayType<typeof array, A>]
}

/**
 * Separates an array of Either into two arrays: lefts and rights.
 *
 * @example
 * ```ts
 * import { Array, Either } from '@jvlk/fp-tsm'
 * import { expect } from '@std/expect/expect'
 *
 * const arr = [Either.left(1), Either.right("a"), Either.left(2), Either.right("b")]
 * expect(Array.separate(arr)).toEqual([[1, 2], ["a", "b"]])
 * ```
 */
export const separate = <L, R>(
  array: AnyArray<{ _tag: "Left" | "Right"; left?: L; right?: R }>,
): [Array<L>, Array<R>] => {
  const lefts: L[] = []
  const rights: R[] = []
  for (const e of array) {
    if (e._tag === "Left") lefts.push(e.left as L)
    else rights.push(e.right as R)
  }
  return [lefts, rights]
}
