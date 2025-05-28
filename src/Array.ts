import { Option } from "./index.ts"

/**
 * Represents a non-empty array type.
 * @category Types
 * @example
 * ```ts
 * import type { NonEmptyArray } from "@jvlk/fp-tsm";
 *
 * const arr: NonEmptyArray<number> = [1, 2, 3]; // valid
 *
 * // @ts-expect-error
 * const emptyArr: NonEmptyArray<number> = []; // invalid, will cause a type error
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Represents a non-empty readonly array type.
 * @category Types
 */
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]

/**
 * A utilty type to represent any array type, including mutable and immutable arrays, as well as non-empty arrays.
 * @category Types
 */

export type AnyArray<Type = unknown> =
  | Array<Type>
  | ReadonlyArray<Type>
  | ReadonlyNonEmptyArray<Type>
  | NonEmptyArray<Type>

/**
 * The `Array` module provides point-free functions to work with arrays and some utility types for non empty arrays.
 * @module
 */
export const Array: ArrayConstructor & {
  map: <A extends AnyArray<T>, T = unknown, U = unknown>(
    fn: (x: ValueOf<A>, index?: number) => U,
  ) => (a: A) => ArrayType<A, U>
  at: <T>(index: number) => (array: Array<T>) => Option.Option<T>
} = Object.assign(globalThis.Array, { map, at })

/**
 * Point-free way to get a value from an array by index.
 * @category Functions
 */
export function at<T>(index: number): (array: Array<T>) => Option.Option<T> {
  return (array: AnyArray<T>) => Option.of(array[index])
}

/**
 * Point-free way to get a use `Array.prototype.map`.
 * @category Functions
 */
export function map<A extends AnyArray<T>, T = unknown, U = unknown>(
  fn: (x: ValueOf<A>, index?: number) => U,
): (a: A) => ArrayType<A, U>
export function map<
  A extends AnyArray<T>,
  T = unknown,
  U = unknown,
>(fn: any) {
  return (x: A) => x.map(fn)
}

// utility types

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null

type AnyFunction<
  Args extends unknown[] = unknown[],
  ReturnType = unknown,
> = (
  ...args: Args
) => ReturnType
type ValueOf<Type> = Type extends Primitive ? Type
  : Type extends AnyArray ? Type[number]
  : Type extends AnyFunction ? ReturnType<Type>
  : Type[keyof Type]

type ArrayType<T, U> = T extends NonEmptyArray<infer A> ? NonEmptyArray<U>
  : T extends ReadonlyNonEmptyArray<infer A> ? ReadonlyNonEmptyArray<U>
  : T extends Array<infer A> ? Array<U>
  : T extends ReadonlyArray<infer A> ? ReadonlyArray<U>
  : never
