// deno-lint-ignore-file no-explicit-any
import { Option } from "./index.ts"

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
 * import type { AnyArray, ReadonlyNonEmptyArray, NonEmptyArray } from "@jvlk/fp-tsm"
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

/**
 * The `Array` module provides point-free functions to work with arrays and some utility types for non empty arrays.
 * @module
 */
export const Array: ArrayConstructor & {
  map: <A extends AnyArray<T>, T, U>(
    fn: (x: A extends AnyArray<infer Y> ? Y : never) => U,
  ) => (a: A) => ArrayType<A, U>
  at: <T>(index: number) => (array: Array<T>) => Option.Option<T>
  findFirst<A>(
    predicate: (a: A) => boolean,
  ): (as: Array<A>) => Option.Option<A>
  filter: {
    <A extends AnyArray<T>, T, U>(
      predicate: (a: T | U) => a is U,
    ): (as: A) => ArrayType<A, U>
    <A extends AnyArray<T>, T>(
      predicate: (a: A extends AnyArray<infer Y> ? Y : never) => boolean,
    ): (as: A) => A
  }
} = Object.assign({}, globalThis.Array, { map, at, findFirst, filter })

/**
 * Point-free way to get a value from an array by index. Returns an `Option` type.
 * @category Functions
 * @example
 * ```ts
 * import { Array, Option, pipe } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(pipe([1, 2, 3], Array.at(0))).toEqual(Option.some(1))
 * expect(pipe([1, 2, 3], Array.at(3))).toEqual(Option.none)
 * ```
 */
export function at<T>(index: number): (array: Array<T>) => Option.Option<T> {
  return (array: AnyArray<T>) => Option.of(array[index])
}

/**
 * Point-free way to use `Array.prototype.map`.
 * @category Functions
 * @example
 * ```ts
 * import { Array, pipe } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const numbers: ReadonlyArray<number> = [1, 2, 3]
 * const double = (n: number) => n * 2
 *
 * const result = pipe(
 *  numbers,
 *  Array.map(double)
 * )
 * expect(result).toEqual([2, 4, 6])
 * ```
 */
export function map<A extends AnyArray<T>, T, U>(
  fn: (x: A extends AnyArray<infer Y> ? Y : never) => U,
): <Z>(a: A) => ArrayType<A, Z>
export function map<
  A extends AnyArray<T>,
  T = unknown,
  U = unknown,
>(fn: (X: T) => U) {
  return (x: A) => x.map(fn)
}

/**
 * Point-free way to use `Array.prototype.filter`. Works as a valid type guard.
 *
 * @category Functions
 * @example
 * ```ts
 * import { Array, pipe } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const numbers = [1, 2, 3, 4]
 * const isEven = (n: number) => n % 2 === 0
 *
 * const result = pipe(
 *   numbers,
 *   Array.filter(isEven)
 * )
 * expect(result).toEqual([2, 4])
 *
 * // Type guard example
 * const items = [1, "a", 2, "b", 3]
 * const isNumber = (x: unknown): x is number => typeof x === "number"
 * const add = (x: number) => x + 1
 *
 * const onlyNumbers = pipe(
 *   items,
 *   Array.filter(isNumber),
 *   Array.map(add)
 * )
 *
 * expect(onlyNumbers).toEqual([2, 3, 4])
 * ```
 */
export function filter<A>(
  predicate: (a: A) => boolean,
): (as: Array<A>) => Array<A> {
  return (as) => as.filter(predicate)
}

Object.assign(Array, { filter })

/**
 * Point-free way to find the first element in an array that satisfies a predicate. Returns an `Option` type.
 * @category Functions
 * @example
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
 */
export function findFirst<A>(
  predicate: (a: A) => boolean,
): (as: Array<A>) => Option.Option<A> {
  return (as) => Option.of(as.find(predicate))
}

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
