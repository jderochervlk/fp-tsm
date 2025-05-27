/**
 * This module adds functions to the global `Array` that are point-free.
 * @module
 */

export type NonEmptyArray<T> = [T, ...T[]] | readonly [T, ...T[]]
// export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]
// function map<T, U>(fn: (x: T) => U): (a: NonEmptyArray<T>) => NonEmptyArray<U>
function map<T, U extends Array<T>>(
  fn: <A extends T>(x: A) => A,
): (a: U) => U
function map<T, U extends ReadonlyArray<T> | Array<T> | NonEmptyArray<T>>(
  fn: (x: T) => T,
): (a: U) => U

function map<T, U>(fn: (x: T) => U) {
  return (x: Array<T> | ReadonlyArray<T> | NonEmptyArray<T>) => x.map(fn)
}

export type AnyArray<Type = unknown> = Array<Type> | ReadonlyArray<Type>
export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null

export type AnyFunction<
  Args extends unknown[] = unknown[],
  ReturnType = unknown,
> = (
  ...args: Args
) => ReturnType
export type ValueOf<Type> = Type extends Primitive ? Type
  : Type extends AnyArray ? Type[number]
  : Type extends AnyFunction ? ReturnType<Type>
  : Type[keyof Type]

declare global {
  interface ArrayConstructor {
    map<T, U, A extends ReadonlyArray<T> | Array<T>>(
      fn: (x: ValueOf<A>) => U,
    ): (
      a: A,
    ) => A
  }
}

Array.map = map
