// deno-lint-ignore-file no-explicit-any
import { at as _at } from "es-toolkit/array"
import { Option } from "./index.ts"
import { dual } from "./internal.ts"

/**
 * Represents a non-empty array type.
 * @category Types
 * @example
 * ```ts
 * import type { NonEmptyArray } from "@jvlk/fp-tsm"
 *
 * const arr: NonEmptyArray<number> = [1, 2, 3] // valid
 *
 * // @ts-expect-error
 * const emptyArr: NonEmptyArray<number> = [] // invalid, will cause a type error
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Represents a non-empty readonly array type.
 * @category Types
 * @example
 * ```ts
 * import type { NonEmptyArray } from "@jvlk/fp-tsm"
 *
 * const arr: ReadonlyNonEmptyArray<number> = [1, 2, 3] // valid
 *
 * // @ts-expect-error
 * const emptyArr: ReadonlyNonEmptyArray<number> = [] // invalid, will cause a type error
 *
 * // @ts-expect-error
 * arr.push(4) // cannot modify a readonly array
 * ```
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]

/**
 * A utilty type to represent any array type, including mutable and immutable arrays, as well as non-empty arrays.
 * @category Types
 * @example
 * ```ts
 * import type { AnyArray, ReadonlyNonEmptyArray, NonEmptyArray } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const firstItem = <T>(arr: AnyArray<T>): T => arr[0]
 *
 * const arr1: Array<number> = [1, 2, 3]
 * const arr2: ReadonlyArray<number> = [1]
 * const arr3: ReadonlyNonEmptyArray<number> = [1, 2]
 * const arr4: NonEmptyArray<number> = [1]
 *
 * expect(firstItem(arr1)).toBe(1) // works with mutable array
 * expect(firstItem(arr2)).toBe(1) // works with immutable array
 * expect(firstItem(arr3)).toBe(1) // works with readonly non-empty array
 * expect(firstItem(arr4)).toBe(1) // works with non-empty array
 * ```
 */

export type AnyArray<Type> =
  | Array<Type>
  | ReadonlyArray<Type>
  | ReadonlyNonEmptyArray<Type>
  | NonEmptyArray<Type>

// @contructors Making Arrays

/**
 * Return a `Array` of length `n` with element `i` initialized with `f(i)`.
 *
 * @category Creating Arrays
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
  return out as any
}

/**
 * Creates an `Array` from the values passed to it.
 *
 * @category Creating Arrays
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
 * @category Creating Arrays
 * @example replicate
 * ```ts
 * import { replicate } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(replicate(3, 'a')).toEqual(['a', 'a', 'a'])
 * expect(replicate(0, 42)).toEqual([])
 * expect(replicate(-2, true)).toEqual([])
 */
export const replicate = <A>(n: number, a: A): Array<A> => {
  const j = Math.max(0, Math.floor(n))
  if (j <= 0) return []
  const out: A[] = []
  for (let i = 0; i < j; i++) {
    out.push(a)
  }
  return out as any
}

// @filtering Filtering Arrays

// @todo compact
/**
 * Given an iterating function that is a `Predicate` or a `Refinement`,
 * `filter` creates a new `Array` containing the elements of the original `Array` for which the iterating function is `true`.
 *
 * @category Filtering Arrays
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
  <A, B>(
    predicate: (x: unknown) => x is B,
  ): (array: AnyArray<A>) => AnyArray<B>
  <A>(
    predicate: (a: A) => boolean,
  ): (array: AnyArray<A>) => AnyArray<A>
  <A, B>(
    array: AnyArray<A>,
    predicate: (x: unknown) => x is B,
  ): AnyArray<B>
  <A>(
    array: AnyArray<A>,
    predicate: (a: A) => boolean,
  ): AnyArray<A>
} = dual(2, <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): AnyArray<A> => {
  return array.filter(predicate)
})
// @todo filterMap
// @todo filterMapWithIndex
// @todo filterWithIndex
// @todo partition
// @todo partitionMap
// @todo partitionMapWithIndex
// @todo partitionWithIndex
// @todo separate

// @folding Folding Arrays
// @todo reduce
// @todo reduceRight
// @todo reduceWithIndex
// @todo reduceRightWithIndex

// @mapping Mapping Arrays
// @todo flap
/**
 * TODO: description
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
// @todo mapWithIndex

// @refinements Refining Arrays
// @todo isEmpty
// @todo isNonEmpty

// @sequencing Sequencing Arrays
// @todo flatMap
// @todo flatten

// @traversing Traversing Arrays
// @todo traverse
// @todo sequence

// @utils Array Utilities
/**
 * Retrieves elements from an array at the specified indices.
 * Each element will be an `Option`, which will be `None` if something isn't found at that index.
 * This function supports negative indices, which count from the end of the array.
 */
export const at: {
  <T>(array: Array<T>, idxs: Array<number>): Array<Option.Option<T>>
  <T>(idxs: Array<number>): (array: Array<T>) => Array<Option.Option<T>>
} = dual(
  2,
  <T>(array: Array<T>, idxs: Array<number>): Array<Option.Option<T>> =>
    _at(array, idxs).map(Option.of),
)
// @todo chop
// @todo chunksOf
// @todo comprehension
// @todo concat
// @todo copy
// @todo deleteAt
// @todo dropLeft
// @todo dropLeftWhile
// @todo dropRight
// @todo duplicate
// @todo every
// @todo exists
// @todo extend

/**
 * Find the first element which satisfies a predicate (or a refinement) function. It returns an `Option` containing the element or `None` if not found.
 *
 * @category Array Utilities
 * @example Point free
 * ```ts
 * import { Array, Option, pipe } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const isEven = (n: number) => n % 2 === 0
 * const numbers = [1, 2, 3, 4]
 *
 * const result = pipe(
 *  numbers,
 *  Array.findFirst(isEven)
 * )
 *
 * expect(result).toEqual(Option.some(2))
 * ```
 *
 * @example Data first
 * ```ts
 * import { Option, pipe } from "@jvlk/fp-tsm"
 * import { findFirst } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const isEven = (n: number) => n % 2 === 0
 * const numbers = [1, 2, 3, 4]
 *
 * const result = findFirst(numbers, isEven)
 *
 * expect(result).toEqual(Option.some(2))
 *
 * ```
 */
export const findFirst: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): Option.Option<A>
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => Option.Option<A>
} = dual(2, <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): Option.Option<A> => {
  return Option.of(array.find(predicate))
})

// @todo findLast
// @todo findFirstMap
// @todo findIndex
// @todo findLastIndex
// @todo findLastMap
// @todo head
// @todo init
// @todo insertAt
// @todo intersection ?
// @todo isOutOfBound
// @todo last
// @todo lefts
// @todo lookup
// @todo modifyAt
// @todo prepend
// @todo prependAll
// @todo reverse
// @todo rights
// @todo rotate
// @todo scanLeft
// @todo scanRight
// @todo size (aka length)
// @todo some
// @todo sort
// @todo sortBy
// @todo spanLeft
// @todo splitAt
// @todo tail
// @todo takeLeft
// @todo takeLeftWhile
// @todo takeRight
// @todo unfold
// @todo union
// @todo uniq
// @todo unzip
// @todo updateAt
// @todo zip
// @todo zipWith

// @internal-types

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null

type AnyFunction<
  Args extends any[] = any[],
  ReturnType = any,
> = (
  ...args: Args
) => ReturnType
type ValueOf<Type> = Type extends Primitive ? Type
  : Type extends AnyArray<Type> ? Type[number]
  : Type extends AnyFunction ? ReturnType<Type>
  : Type[keyof Type]

type ArrayType<T, U> = T extends NonEmptyArray<infer A> ? NonEmptyArray<U>
  : T extends ReadonlyNonEmptyArray<infer A> ? ReadonlyNonEmptyArray<U>
  : T extends Array<infer A> ? Array<U>
  : T extends ReadonlyArray<infer A> ? ReadonlyArray<U>
  : never
