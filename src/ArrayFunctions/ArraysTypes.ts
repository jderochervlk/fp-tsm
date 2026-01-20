// deno-lint-ignore-file no-explicit-any

/**
 * Represents a non-empty array type.
 *
 * @example
 * ```ts
 * import type { NonEmptyArray } from "@jvlk/fp-tsm/Array"
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
 *
 * @example
 * ```ts
 * import type { NonEmptyArray } from "@jvlk/fp-tsm/Array"
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
 *
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
export type ValueOf<Type> = Type extends Primitive ? Type
  : Type extends AnyArray<Type> ? Type[number]
  : Type extends AnyFunction ? ReturnType<Type>
  : Type[keyof Type]

export type ArrayType<T, U> = T extends NonEmptyArray<infer A> ? NonEmptyArray<U>
  : T extends ReadonlyNonEmptyArray<infer A> ? ReadonlyNonEmptyArray<U>
  : T extends Array<infer A> ? Array<U>
  : T extends ReadonlyArray<infer A> ? ReadonlyArray<U>
  : never
