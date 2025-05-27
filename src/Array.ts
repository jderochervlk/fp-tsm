/**
 * This module adds functions to the global `Array` that are point-free and some utility types for non empty arrays.
 * @module
 */

import { array } from "astro/zod"
import { Option } from "./index.ts"

export type NonEmptyArray<T> = [T, ...T[]]
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]]

export type AnyArray<Type = unknown> =
  | Array<Type>
  | ReadonlyArray<Type>
  | ReadonlyNonEmptyArray<Type>
  | NonEmptyArray<Type>

declare global {
  interface ArrayConstructor {
    map<
      A extends AnyArray<T>,
      T = unknown,
      U = unknown,
    >(
      fn: (x: ValueOf<A>) => U,
    ): (
      a: A,
    ) => ArrayType<A, U>

    at<T>(
      index: number,
    ): (a: AnyArray<T>) => Option.Option<T>
  }
}

// overload Array
Array.map = map
Array.at = function at<T>(index: number) {
  return (array: AnyArray<T>) => Option.of(array[index])
}

// functions for overloading
function map<T, U>(
  fn: (x: T) => U,
): (a: ReadonlyNonEmptyArray<T>) => ReadonlyNonEmptyArray<U>
function map<T, U>(fn: (x: T) => U): (a: NonEmptyArray<T>) => NonEmptyArray<U>
function map<T, U extends Array<T>>(
  fn: <A extends T>(x: A) => A,
): (a: U) => U
function map<T, U extends ReadonlyArray<T> | Array<T> | NonEmptyArray<T>>(
  fn: (x: T) => T,
): (a: U) => U
function map<T, U>(fn: (x: T) => U) {
  return (x: Array<T> | ReadonlyArray<T> | NonEmptyArray<T>): any => x.map(fn)
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
