// deno-lint-ignore-file no-explicit-any
// @utils Array Utilities

import { dual } from "../internal.ts"
import * as Option from "../Option.ts"
import type { AnyArray, ArrayType } from "./ArraysTypes.ts"

/**
 * Retrieves elements from an array at the specified indices.
 * Each element will be an `Option`, which will be `None` if something isn't found at that index.
 * This function supports negative indices, which count from the end of the array.
 */
export const at: {
  <A extends AnyArray<T>, T>(
    array: A,
    idxs: Array<number>,
  ): ArrayType<A, Option.Option<T>>
  <A extends AnyArray<T>, T>(
    idxs: Array<number>,
  ): (array: A) => ArrayType<A, Option.Option<T>>
} = dual(
  2,
  <T>(arr: Array<T>, indices: Array<number>): Array<Option.Option<T>> => {
    const result = new Array(indices.length)
    const length = arr.length
    for (let i = 0; i < indices.length; i++) {
      let index = indices[i]
      index = Number.isInteger(index) ? index : Math.trunc(index) || 0
      if (index < 0) {
        index += length
      }
      result[i] = arr[index]
    }
    return result.map(Option.of)
  },
)
/**
 * Recursively processes an array by consuming a prefix and producing a value and the rest of the array.
 * Useful for "chopping" up the input array.
 *
 * @example
 * ```ts
 * import { Array } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * // Split array into chunks of 2
 * const chunk2 = <A>(arr: Array<A>): [Array<A>, Array<A>] =>
 *   arr.length >= 2 ? [[arr[0], arr[1]], arr.slice(2)] : [arr, []]
 *
 * expect(Array.chop([1,2,3,4,5], chunk2)).toEqual([[1,2],[3,4],[5]])
 * ```
 */
export const chop: <A, B>(
  arr: AnyArray<A>,
  f: (as: Array<A>) => [B, Array<A>],
) => ArrayType<typeof arr, B> = dual(
  2,
  <A, B>(
    arr: AnyArray<A>,
    f: (as: Array<A>) => [B, Array<A>],
  ): ArrayType<typeof arr, B> => {
    const out: B[] = []
    let rest = Array.from(arr)
    while (rest.length > 0) {
      const [b, next] = f(rest)
      out.push(b)
      rest = next
    }
    return out as ArrayType<typeof arr, B>
  },
)
/**
 * Splits an array into chunks of a specified size.
 *
 * @example
 * ```ts
 * import { Array } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(Array.chunksOf([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]])
 * expect(Array.chunksOf([1,2,3,4,5], 3)).toEqual([[1,2,3],[4,5]])
 * expect(Array.chunksOf([], 2)).toEqual([])
 * expect(Array.chunksOf([1], 0)).toEqual([[1]])
 * ```
 */
export const chunksOf: {
  <A>(array: AnyArray<A>, size: number): ArrayType<typeof array, Array<A>>
  <A>(size: number): (array: AnyArray<A>) => ArrayType<typeof array, Array<A>>
} = dual(2, <A>(array: AnyArray<A>, size: number): Array<Array<A>> => {
  const result: Array<Array<A>> = []
  const chunkSize = Math.max(1, Math.floor(size))
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return Array.from(result) as Array<Array<A>>
})
/**
 * Generates an array by comprehending over multiple input arrays.
 * Similar to a nested for-loop or list comprehension in other languages.
 *
 * @example
 * ```ts
 * import { comprehension } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const xs = [1, 2]
 * const ys = ['a', 'b']
 * const result = comprehension([xs, ys], (x, y) => [x, y])
 * expect(result).toEqual([[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']])
 * ```
 */
export function comprehension<T extends any[], R>(
  arrays: { [K in keyof T]: AnyArray<T[K]> },
  f: (...args: T) => R,
): Array<R> {
  const result: Array<R> = []
  const n = arrays.length
  if (n === 0) return result

  function helper(idx: number, acc: any[]) {
    if (idx === n) {
      result.push(f(...(acc as T)))
      return
    }
    for (const item of arrays[idx]) {
      helper(idx + 1, [...acc, item])
    }
  }

  helper(0, [])
  return result
}
/**
 * Concatenates two arrays.
 *
 * @example
 * ```ts
 * import { concat } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(concat([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
 * expect(concat([], [1])).toEqual([1])
 * expect(concat([1], [])).toEqual([1])
 * ```
 */
export const concat: {
  <A>(a: AnyArray<A>, b: AnyArray<A>): ArrayType<typeof a, A>
  <A>(b: AnyArray<A>): (a: AnyArray<A>) => ArrayType<typeof a, A>
} = dual(2, <A>(a: AnyArray<A>, b: AnyArray<A>): ArrayType<typeof a, A> => {
  return [...a, ...b] as ArrayType<typeof a, A>
})
/**
 * Returns a shallow copy of the given array.
 *
 * @example
 * ```ts
 * import { copy } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const arr = [1, 2, 3]
 * const arrCopy = copy(arr)
 * expect(arrCopy).toEqual([1, 2, 3])
 * expect(arrCopy).not.toBe(arr)
 * ```
 */
export const copy = <A>(array: AnyArray<A>): ArrayType<typeof array, A> => {
  return array.slice() as ArrayType<typeof array, A>
}
/**
 * Removes the element at the specified index from the array.
 * Returns a new array with the element removed. If the index is out of bounds, returns the original array.
 *
 * @example
 * ```ts
 * import { deleteAt } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(deleteAt([1, 2, 3], 1)).toEqual([1, 3])
 * expect(deleteAt([1, 2, 3], -1)).toEqual([1, 2, 3])
 * expect(deleteAt([1, 2, 3], 3)).toEqual([1, 2, 3])
 * ```
 */
export const deleteAt: {
  <A>(array: AnyArray<A>, index: number): ArrayType<typeof array, A>
  <A>(index: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(array: AnyArray<A>, index: number): ArrayType<typeof array, A> => {
    if (index < 0 || index >= array.length) {
      return array.slice() as ArrayType<
        typeof array,
        A
      >
    }
    return [...array.slice(0, index), ...array.slice(index + 1)] as ArrayType<
      typeof array,
      A
    >
  },
)
/**
 * Drops the first `n` elements from an array.
 * If `n` is less than or equal to 0, returns a copy of the array.
 * If `n` is greater than the array length, returns an empty array.
 *
 * @example
 * ```ts
 * import { dropLeft } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(dropLeft([1, 2, 3, 4], 2)).toEqual([3, 4])
 * expect(dropLeft([1, 2, 3], 0)).toEqual([1, 2, 3])
 * expect(dropLeft([1, 2, 3], 5)).toEqual([])
 * ```
 */
export const dropLeft: {
  <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A>
  <A>(n: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(2, <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A> => {
  const count = Math.max(0, Math.floor(n))
  return array.slice(count) as ArrayType<typeof array, A>
})

/**
 * Drops elements from the beginning of the array while the predicate returns true.
 * Stops dropping when the predicate returns false for the first time.
 *
 * @example
 * ```ts
 * import { dropLeftWhile } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(dropLeftWhile([1, 2, 3, 4], n => n < 3)).toEqual([3, 4])
 * expect(dropLeftWhile([1, 2, 3], n => n < 0)).toEqual([1, 2, 3])
 * expect(dropLeftWhile([1, 2, 3], n => n < 10)).toEqual([])
 * ```
 */
export const dropLeftWhile: {
  <A>(
    array: AnyArray<A>,
    predicate: (a: A) => boolean,
  ): ArrayType<typeof array, A>
  <A>(
    predicate: (a: A) => boolean,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(
    array: AnyArray<A>,
    predicate: (a: A) => boolean,
  ): ArrayType<typeof array, A> => {
    let i = 0
    while (i < array.length && predicate(array[i])) {
      i++
    }
    return array.slice(i) as ArrayType<typeof array, A>
  },
)
/**
 * Drops the last `n` elements from an array.
 * If `n` is less than or equal to 0, returns a copy of the array.
 * If `n` is greater than the array length, returns an empty array.
 *
 * @example
 * ```ts
 * import { dropRight } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(dropRight([1, 2, 3, 4], 2)).toEqual([1, 2])
 * expect(dropRight([1, 2, 3], 0)).toEqual([1, 2, 3])
 * expect(dropRight([1, 2, 3], 5)).toEqual([])
 * ```
 */
export const dropRight: {
  <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A>
  <A>(n: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(2, <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A> => {
  const count = Math.max(0, Math.floor(n))
  if (count <= 0) return array.slice() as ArrayType<typeof array, A>
  if (count >= array.length) return [] as ArrayType<typeof array, A>
  return array.slice(0, array.length - count) as ArrayType<typeof array, A>
})

/**
 * Returns a new array with the element at the specified index duplicated.
 * If the index is out of bounds, returns a copy of the original array.
 *
 * @example
 * ```ts
 * import { duplicate } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(duplicate([1, 2, 3], 1)).toEqual([1, 2, 2, 3])
 * expect(duplicate([1, 2, 3], 0)).toEqual([1, 1, 2, 3])
 * expect(duplicate([1, 2, 3], 3)).toEqual([1, 2, 3])
 * expect(duplicate([1, 2, 3], -1)).toEqual([1, 2, 3])
 * ```
 */
export const duplicate: {
  <A>(array: AnyArray<A>, index: number): ArrayType<typeof array, A>
  <A>(index: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(array: AnyArray<A>, index: number): ArrayType<typeof array, A> => {
    if (index < 0 || index >= array.length) {
      return array.slice() as ArrayType<typeof array, A>
    }
    return [
      ...array.slice(0, index),
      array[index],
      ...array.slice(index),
    ] as ArrayType<typeof array, A>
  },
)
/**
 * Checks if every element in the array satisfies the predicate.
 *
 * @example
 * ```ts
 * import { every } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(every([1, 2, 3], n => n > 0)).toBe(true)
 * expect(every([1, 2, 3], n => n > 2)).toBe(false)
 * expect(every([], n => n > 0)).toBe(true)
 * ```
 */
export const every: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => boolean
} = dual(2, <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean => {
  return array.every(predicate)
})
/**
 * Checks if at least one element in the array satisfies the predicate.
 *
 * @example
 * ```ts
 * import { exists } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(exists([1, 2, 3], n => n > 2)).toBe(true)
 * expect(exists([1, 2, 3], n => n > 3)).toBe(false)
 * expect(exists([], n => true)).toBe(false)
 * ```
 */
export const exists: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => boolean
} = dual(2, <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean => {
  return array.some(predicate)
})

/**
 * Returns an array where each element is the result of applying a function to each window of the input array.
 * The function receives a slice of the array starting at each index.
 *
 * @example
 * ```ts
 * import { extend } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const arr = [1, 2, 3, 4]
 * const sumWindow = (window: number[]) => window.reduce((a, b) => a + b, 0)
 * expect(extend(arr, sumWindow)).toEqual([10, 9, 7, 4])
 * ```
 */
export const extend: {
  <A, B>(array: AnyArray<A>, f: (as: Array<A>) => B): ArrayType<typeof array, B>
  <A, B>(
    f: (as: Array<A>) => B,
  ): (array: AnyArray<A>) => ArrayType<typeof array, B>
} = dual(
  2,
  <A, B>(
    array: AnyArray<A>,
    f: (as: Array<A>) => B,
  ): ArrayType<typeof array, B> => {
    const out: B[] = []
    for (let i = 0; i < array.length; i++) {
      out.push(f(array.slice(i)))
    }
    return out as ArrayType<typeof array, B>
  },
)

/**
 * Find the first element which satisfies a predicate (or a refinement) function. It returns an `Option` containing the element or `None` if not found.
 *
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

/**
 * Find the last element which satisfies a predicate (or a refinement) function. It returns an `Option` containing the element or `None` if not found.
 *
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
 *  Array.findLast(isEven)
 * )
 *
 * expect(result).toEqual(Option.some(4))
 * ```
 *
 * @example Data first
 * ```ts
 * import { Option, pipe } from "@jvlk/fp-tsm"
 * import { findLast } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const isEven = (n: number) => n % 2 === 0
 * const numbers = [1, 2, 3, 4]
 *
 * const result = findLast(numbers, isEven)
 *
 * expect(result).toEqual(Option.some(4))
 * ```
 */
export const findLast: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): Option.Option<A>
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => Option.Option<A>
} = dual(2, <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): Option.Option<A> => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return Option.of(array[i])
    }
  }
  return Option.none
})

/**
 * Find the first element for which the mapping function returns a Some, and return its value.
 * Returns Option.none if no such element is found.
 *
 * @example
 * ```ts
 * import { Array, Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const parseEven = (n: number) => n % 2 === 0 ? Option.some(n * 10) : Option.none
 * expect(Array.findFirstMap([1, 2, 3, 4], parseEven)).toEqual(Option.some(20))
 * expect(Array.findFirstMap([1, 3, 5], parseEven)).toEqual(Option.none)
 * ```
 */
export const findFirstMap: {
  <A, B>(array: AnyArray<A>, f: (a: A) => Option.Option<B>): Option.Option<B>
  <A, B>(
    f: (a: A) => Option.Option<B>,
  ): (array: AnyArray<A>) => Option.Option<B>
} = dual(2, <A, B>(
  array: AnyArray<A>,
  f: (a: A) => Option.Option<B>,
): Option.Option<B> => {
  for (let i = 0; i < array.length; i++) {
    const ob = f(array[i])
    if (ob._tag === "Some") return ob
  }
  return Option.none
})

/**
 * Returns the index of the first element in the array that satisfies the predicate.
 * If no element matches, returns -1.
 *
 * @example
 * ```ts
 * import { findIndex } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(findIndex([1, 2, 3], n => n === 2)).toBe(1)
 * expect(findIndex([1, 2, 3], n => n === 4)).toBe(-1)
 * expect(findIndex([], n => true)).toBe(-1)
 * ```
 */
export const findIndex: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): number
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => number
} = dual(2, <A>(array: AnyArray<A>, predicate: (a: A) => boolean): number => {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) return i
  }
  return -1
})

/**
 * Returns the index of the last element in the array that satisfies the predicate.
 * If no element matches, returns -1.
 *
 * @example
 * ```ts
 * import { findLastIndex } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(findLastIndex([1, 2, 3], n => n === 2)).toBe(1)
 * expect(findLastIndex([1, 2, 3], n => n === 4)).toBe(-1)
 * expect(findLastIndex([], n => true)).toBe(-1)
 * ```
 */
export const findLastIndex: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): number
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => number
} = dual(2, <A>(array: AnyArray<A>, predicate: (a: A) => boolean): number => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i
  }
  return -1
})

/**
 * Find the last element for which the mapping function returns a Some, and return its value.
 * Returns Option.none if no such element is found.
 *
 * @example
 * ```ts
 * import { Array, Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * const parseEven = (n: number) => n % 2 === 0 ? Option.some(n * 10) : Option.none
 * expect(Array.findLastMap([1, 2, 3, 4], parseEven)).toEqual(Option.some(40))
 * expect(Array.findLastMap([1, 3, 5], parseEven)).toEqual(Option.none)
 * ```
 */
export const findLastMap: {
  <A, B>(array: AnyArray<A>, f: (a: A) => Option.Option<B>): Option.Option<B>
  <A, B>(
    f: (a: A) => Option.Option<B>,
  ): (array: AnyArray<A>) => Option.Option<B>
} = dual(2, <A, B>(
  array: AnyArray<A>,
  f: (a: A) => Option.Option<B>,
): Option.Option<B> => {
  for (let i = array.length - 1; i >= 0; i--) {
    const ob = f(array[i])
    if (ob._tag === "Some") return ob
  }
  return Option.none
})

/**
 * Returns the first element of the array as an Option.
 *
 * @example
 * ```ts
 * import { head } from "@jvlk/fp-tsm/Array"
 * import { Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(head([1, 2, 3])).toEqual(Option.some(1))
 * expect(head([])).toEqual(Option.none)
 * ```
 */
export const head = <A>(array: AnyArray<A>): Option.Option<A> =>
  array.length > 0 ? Option.of(array[0]) : Option.none

/**
 * Returns all elements of the array except the last one.
 *
 * @example
 * ```ts
 * import { init } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(init([1, 2, 3])).toEqual([1, 2])
 * expect(init([1])).toEqual([])
 * expect(init([])).toEqual([])
 * ```
 */
export const init = <A>(array: AnyArray<A>): ArrayType<typeof array, A> =>
  array.slice(0, Math.max(0, array.length - 1)) as ArrayType<typeof array, A>

/**
 * Inserts an element at the specified index.
 * Returns a new array with the element inserted, or the original array if index is out of bounds.
 *
 * @example
 * ```ts
 * import { insertAt } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(insertAt([1, 2, 3], 1, 9)).toEqual([1, 9, 2, 3])
 * expect(insertAt([1, 2, 3], 0, 9)).toEqual([9, 1, 2, 3])
 * expect(insertAt([1, 2, 3], 3, 9)).toEqual([1, 2, 3, 9])
 * expect(insertAt([1, 2, 3], 4, 9)).toEqual([1, 2, 3])
 * ```
 */
export const insertAt: {
  <A>(array: AnyArray<A>, index: number, value: A): ArrayType<typeof array, A>
  <A>(
    index: number,
    value: A,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  3,
  <A>(
    array: AnyArray<A>,
    index: number,
    value: A,
  ): ArrayType<typeof array, A> => {
    if (index < 0 || index > array.length) {
      return array.slice() as ArrayType<
        typeof array,
        A
      >
    }
    return [
      ...array.slice(0, index),
      value,
      ...array.slice(index),
    ] as ArrayType<typeof array, A>
  },
)

/**
 * Checks if the index is out of bounds for the array.
 *
 * @example
 * ```ts
 * import { isOutOfBound } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(isOutOfBound([1, 2, 3], 2)).toBe(false)
 * expect(isOutOfBound([1, 2, 3], 3)).toBe(true)
 * expect(isOutOfBound([], 0)).toBe(true)
 * ```
 */
export const isOutOfBound = <A>(array: AnyArray<A>, index: number): boolean =>
  index < 0 || index >= array.length

/**
 * Returns the last element of the array as an Option.
 *
 * @example
 * ```ts
 * import { last } from "@jvlk/fp-tsm/Array"
 * import { Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(last([1, 2, 3])).toEqual(Option.some(3))
 * expect(last([])).toEqual(Option.none)
 * ```
 */
export const last = <A>(array: AnyArray<A>): Option.Option<A> =>
  array.length > 0 ? Option.of(array[array.length - 1]) : Option.none

/**
 * Returns all left values from an array of Either.
 *
 * @example
 * ```ts
 * import { lefts } from "@jvlk/fp-tsm/Array"
 * import { Either } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(lefts([Either.left(1), Either.right("a"), Either.left(2)])).toEqual([1, 2])
 * ```
 */
export const lefts = <L, R>(
  array: AnyArray<{ _tag: "Left" | "Right"; left?: L; right?: R }>,
): Array<L> =>
  array.filter((e): e is { _tag: "Left"; left: L } => e._tag === "Left").map(
    (e) => e.left as L,
  )

/**
 * Looks up the element at the specified index, returning an Option.
 *
 * @example
 * ```ts
 * import { lookup } from "@jvlk/fp-tsm/Array"
 * import { Option } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(lookup([1, 2, 3], 1)).toEqual(Option.some(2))
 * expect(lookup([1, 2, 3], 3)).toEqual(Option.none)
 * ```
 */
export const lookup = <A>(
  array: AnyArray<A>,
  index: number,
): Option.Option<A> =>
  index >= 0 && index < array.length ? Option.of(array[index]) : Option.none

/**
 * Modifies the element at the specified index using a function.
 * Returns a new array with the element modified, or the original array if index is out of bounds.
 *
 * @example
 * ```ts
 * import { modifyAt } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(modifyAt([1, 2, 3], 1, n => n * 10)).toEqual([1, 20, 3])
 * expect(modifyAt([1, 2, 3], 3, n => n * 10)).toEqual([1, 2, 3])
 * ```
 */
export const modifyAt: {
  <A>(
    array: AnyArray<A>,
    index: number,
    f: (a: A) => A,
  ): ArrayType<typeof array, A>
  <A>(
    index: number,
    f: (a: A) => A,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  3,
  <A>(
    array: AnyArray<A>,
    index: number,
    f: (a: A) => A,
  ): ArrayType<typeof array, A> => {
    if (index < 0 || index >= array.length) {
      return array.slice() as ArrayType<
        typeof array,
        A
      >
    }
    return [
      ...array.slice(0, index),
      f(array[index]),
      ...array.slice(index + 1),
    ] as ArrayType<typeof array, A>
  },
)

/**
 * Prepends an element to the beginning of the array.
 *
 * @example
 * ```ts
 * import { prepend } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(prepend([2, 3], 1)).toEqual([1, 2, 3])
 * ```
 */
export const prepend: {
  <A>(array: AnyArray<A>, value: A): ArrayType<typeof array, A>
  <A>(value: A): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(2, <A>(array: AnyArray<A>, value: A): ArrayType<typeof array, A> => {
  return [value, ...array] as ArrayType<typeof array, A>
})

/**
 * Prepends all elements of one array to another.
 *
 * @example
 * ```ts
 * import { prependAll } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(prependAll([3, 4], [1, 2])).toEqual([1, 2, 3, 4])
 * ```
 */
export const prependAll: {
  <A>(array: AnyArray<A>, values: AnyArray<A>): ArrayType<typeof array, A>
  <A>(values: AnyArray<A>): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(array: AnyArray<A>, values: AnyArray<A>): ArrayType<typeof array, A> => {
    return [...values, ...array] as ArrayType<typeof array, A>
  },
)

/**
 * Returns a new array with the elements in reverse order.
 *
 * @example
 * ```ts
 * import { reverse } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(reverse([1, 2, 3])).toEqual([3, 2, 1])
 * expect(reverse([])).toEqual([])
 * ```
 */
export const reverse = <A>(array: AnyArray<A>): ArrayType<typeof array, A> =>
  array.slice().reverse() as ArrayType<typeof array, A>

/**
 * Returns all right values from an array of Either.
 *
 * @example
 * ```ts
 * import { rights } from "@jvlk/fp-tsm/Array"
 * import { Either } from "@jvlk/fp-tsm"
 * import { expect } from "@std/expect/expect"
 *
 * expect(rights([Either.left(1), Either.right("a"), Either.right("b")])).toEqual(["a", "b"])
 * ```
 */
export const rights = <L, R>(
  array: AnyArray<{ _tag: "Left" | "Right"; left?: L; right?: R }>,
): Array<R> =>
  array.filter((e): e is { _tag: "Right"; right: R } => e._tag === "Right").map(
    (e) => e.right as R,
  )

/**
 * Rotates the array by n positions.
 * Positive n rotates left, negative n rotates right.
 *
 * @example
 * ```ts
 * import { rotate } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1])
 * expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3])
 * expect(rotate([1, 2, 3, 4], 4)).toEqual([1, 2, 3, 4])
 * ```
 */
export const rotate = <A>(
  array: AnyArray<A>,
  n: number,
): ArrayType<typeof array, A> => {
  const len = array.length
  if (len === 0) return array.slice() as ArrayType<typeof array, A>
  const k = ((n % len) + len) % len
  return [...array.slice(k), ...array.slice(0, k)] as ArrayType<typeof array, A>
}

/**
 * Produces an array of accumulated values from left to right.
 *
 * @example
 * ```ts
 * import { scanLeft } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(scanLeft([1, 2, 3], 0, (acc, x) => acc + x)).toEqual([0, 1, 3, 6])
 * ```
 */
export const scanLeft = <A, B>(
  array: AnyArray<A>,
  init: B,
  f: (acc: B, a: A) => B,
): ArrayType<typeof array, B> => {
  const out: B[] = [init]
  let acc = init
  for (let i = 0; i < array.length; i++) {
    acc = f(acc, array[i])
    out.push(acc)
  }
  return out as ArrayType<typeof array, B>
}

/**
 * Produces an array of accumulated values from right to left.
 *
 * @example
 * ```ts
 * import { scanRight } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(scanRight([1, 2, 3], 0, (x, acc) => acc + x)).toEqual([6, 5, 3, 0])
 * ```
 */
export const scanRight = <A, B>(
  array: AnyArray<A>,
  init: B,
  f: (a: A, acc: B) => B,
): ArrayType<typeof array, B> => {
  const out: B[] = [init]
  let acc = init
  for (let i = array.length - 1; i >= 0; i--) {
    acc = f(array[i], acc)
    out.unshift(acc)
  }
  return out as ArrayType<typeof array, B>
}

/**
 * Returns the length of the array.
 *
 * @example
 * ```ts
 * import { size } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(size([1, 2, 3])).toBe(3)
 * expect(size([])).toBe(0)
 * ```
 */
export const size = <A>(array: AnyArray<A>): number => array.length

/**
 * Checks if at least one element in the array satisfies the predicate.
 *
 * @example
 * ```ts
 * import { some } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(some([1, 2, 3], n => n === 2)).toBe(true)
 * expect(some([1, 2, 3], n => n === 4)).toBe(false)
 * ```
 */
export const some: {
  <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean
  <A>(predicate: (a: A) => boolean): (array: AnyArray<A>) => boolean
} = dual(2, <A>(array: AnyArray<A>, predicate: (a: A) => boolean): boolean => {
  return array.some(predicate)
})

/**
 * Returns a sorted copy of the array using the provided compare function.
 *
 * @example
 * ```ts
 * import { sort } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(sort([3, 1, 2], (a, b) => a - b)).toEqual([1, 2, 3])
 * ```
 */
export const sort = <A>(
  array: AnyArray<A>,
  compareFn: (a: A, b: A) => number,
): ArrayType<typeof array, A> =>
  array.slice().sort(compareFn) as ArrayType<typeof array, A>

/**
 * Sorts the array by one or more key functions.
 *
 * @example
 * ```ts
 * import { sortBy } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const arr = [{a: 2, b: 1}, {a: 1, b: 2}, {a: 1, b: 1}]
 * expect(sortBy(arr, x => x.a, x => x.b)).toEqual([{a: 1, b: 1}, {a: 1, b: 2}, {a: 2, b: 1}])
 * ```
 */
export const sortBy = <A>(
  array: AnyArray<A>,
  ...keyFns: Array<(a: A) => any>
): ArrayType<typeof array, A> => {
  return array.slice().sort((a, b) => {
    for (const keyFn of keyFns) {
      const ka = keyFn(a)
      const kb = keyFn(b)
      if (ka < kb) return -1
      if (ka > kb) return 1
    }
    return 0
  }) as ArrayType<typeof array, A>
}

/**
 * Splits the array into two arrays: the first containing elements satisfying the predicate, the second containing the rest.
 *
 * @example
 * ```ts
 * import { spanLeft } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(spanLeft([1, 2, 3, 4], n => n < 3)).toEqual([[1, 2], [3, 4]])
 * ```
 */
export const spanLeft = <A>(
  array: AnyArray<A>,
  predicate: (a: A) => boolean,
): [ArrayType<typeof array, A>, ArrayType<typeof array, A>] => {
  let i = 0
  while (i < array.length && predicate(array[i])) i++
  return [
    array.slice(0, i) as ArrayType<typeof array, A>,
    array.slice(i) as ArrayType<typeof array, A>,
  ]
}

/**
 * Splits the array at the specified index.
 *
 * @example
 * ```ts
 * import { splitAt } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(splitAt([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
 * ```
 */
export const splitAt = <A>(
  array: AnyArray<A>,
  index: number,
): [ArrayType<typeof array, A>, ArrayType<typeof array, A>] => {
  return [
    array.slice(0, index) as ArrayType<typeof array, A>,
    array.slice(index) as ArrayType<typeof array, A>,
  ]
}

/**
 * Returns all elements of the array except the first one.
 *
 * @example
 * ```ts
 * import { tail } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(tail([1, 2, 3])).toEqual([2, 3])
 * expect(tail([1])).toEqual([])
 * expect(tail([])).toEqual([])
 * ```
 */
export const tail = <A>(array: AnyArray<A>): ArrayType<typeof array, A> =>
  array.slice(1) as ArrayType<typeof array, A>

/**
 * Takes the first n elements from the array.
 *
 * @example
 * ```ts
 * import { takeLeft } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(takeLeft([1, 2, 3, 4], 2)).toEqual([1, 2])
 * expect(takeLeft([1, 2, 3], 0)).toEqual([])
 * expect(takeLeft([1, 2, 3], 5)).toEqual([1, 2, 3])
 * ```
 */
export const takeLeft: {
  <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A>
  <A>(n: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(2, <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A> => {
  return array.slice(0, Math.max(0, Math.floor(n))) as ArrayType<
    typeof array,
    A
  >
})

/**
 * Takes elements from the beginning of the array while the predicate returns true.
 *
 * @example
 * ```ts
 * import { takeLeftWhile } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(takeLeftWhile([1, 2, 3, 4], n => n < 3)).toEqual([1, 2])
 * expect(takeLeftWhile([1, 2, 3], n => n < 0)).toEqual([])
 * expect(takeLeftWhile([1, 2, 3], n => n < 10)).toEqual([1, 2, 3])
 * ```
 */
export const takeLeftWhile: {
  <A>(
    array: AnyArray<A>,
    predicate: (a: A) => boolean,
  ): ArrayType<typeof array, A>
  <A>(
    predicate: (a: A) => boolean,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  2,
  <A>(
    array: AnyArray<A>,
    predicate: (a: A) => boolean,
  ): ArrayType<typeof array, A> => {
    let i = 0
    while (i < array.length && predicate(array[i])) i++
    return array.slice(0, i) as ArrayType<typeof array, A>
  },
)

/**
 * Takes the last n elements from the array.
 *
 * @example
 * ```ts
 * import { takeRight } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(takeRight([1, 2, 3, 4], 2)).toEqual([3, 4])
 * expect(takeRight([1, 2, 3], 0)).toEqual([])
 * expect(takeRight([1, 2, 3], 5)).toEqual([1, 2, 3])
 * ```
 */
export const takeRight: {
  <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A>
  <A>(n: number): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(2, <A>(array: AnyArray<A>, n: number): ArrayType<typeof array, A> => {
  const count = Math.max(0, Math.floor(n))
  return array.slice(Math.max(0, array.length - count)) as ArrayType<
    typeof array,
    A
  >
})

/**
 * Builds an array by repeatedly applying a function to a seed value.
 *
 * @example
 * ```ts
 * import { unfold } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * const f = (n: number) => n < 5 ? [n, n + 1] as [number, number] : undefined
 * expect(unfold(0, f)).toEqual([0, 1, 2, 3, 4])
 * ```
 */
export const unfold = <A, B>(
  seed: B,
  f: (b: B) => [A, B] | undefined,
): Array<A> => {
  const out: A[] = []
  let next = seed
  while (true) {
    const res = f(next)
    if (!res) break
    out.push(res[0])
    next = res[1]
  }
  return out
}

/**
 * Returns the union of two arrays, removing duplicates.
 *
 * @example
 * ```ts
 * import { union } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(union([1, 2], [2, 3])).toEqual([1, 2, 3])
 * ```
 */
export const union = <A>(
  a: AnyArray<A>,
  b: AnyArray<A>,
): ArrayType<typeof a, A> => {
  const set = new Set(a)
  for (const x of b) set.add(x)
  return Array.from(set) as ArrayType<typeof a, A>
}

/**
 * Removes duplicate elements from the array.
 *
 * @example
 * ```ts
 * import { uniq } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(uniq([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
 * ```
 */
export const uniq = <A>(array: AnyArray<A>): ArrayType<typeof array, A> => {
  return Array.from(new Set(array)) as ArrayType<typeof array, A>
}

/**
 * Unzips an array of tuples into a tuple of arrays.
 *
 * @example
 * ```ts
 * import { unzip } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(unzip([[1, "a"], [2, "b"], [3, "c"]])).toEqual([[1, 2, 3], ["a", "b", "c"]])
 * ```
 */
export const unzip = <A, B>(
  array: AnyArray<[A, B]>,
): [ArrayType<typeof array, A>, ArrayType<typeof array, B>] => {
  const a: A[] = []
  const b: B[] = []
  for (const [x, y] of array) {
    a.push(x)
    b.push(y)
  }
  return [a as ArrayType<typeof array, A>, b as ArrayType<typeof array, B>]
}

/**
 * Updates the element at the specified index.
 * Returns a new array with the element updated, or the original array if index is out of bounds.
 *
 * @example
 * ```ts
 * import { updateAt } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(updateAt([1, 2, 3], 1, 9)).toEqual([1, 9, 3])
 * expect(updateAt([1, 2, 3], 3, 9)).toEqual([1, 2, 3])
 * ```
 */
export const updateAt: {
  <A>(array: AnyArray<A>, index: number, value: A): ArrayType<typeof array, A>
  <A>(
    index: number,
    value: A,
  ): (array: AnyArray<A>) => ArrayType<typeof array, A>
} = dual(
  3,
  <A>(
    array: AnyArray<A>,
    index: number,
    value: A,
  ): ArrayType<typeof array, A> => {
    if (index < 0 || index >= array.length) {
      return array.slice() as ArrayType<
        typeof array,
        A
      >
    }
    return [
      ...array.slice(0, index),
      value,
      ...array.slice(index + 1),
    ] as ArrayType<typeof array, A>
  },
)

/**
 * Zips two arrays into an array of tuples.
 *
 * @example
 * ```ts
 * import { zip } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(zip([1, 2], ["a", "b", "c"])).toEqual([[1, "a"], [2, "b"]])
 * ```
 */
export const zip = <A, B>(a: AnyArray<A>, b: AnyArray<B>): Array<[A, B]> => {
  const len = Math.min(a.length, b.length)
  const out: Array<[A, B]> = []
  for (let i = 0; i < len; i++) {
    out.push([a[i], b[i]])
  }
  return out
}

/**
 * Zips two arrays using a function.
 *
 * @example
 * ```ts
 * import { zipWith } from "@jvlk/fp-tsm/Array"
 * import { expect } from "@std/expect/expect"
 *
 * expect(zipWith([1, 2], ["a", "b", "c"], (n, s) => `${n}${s}`)).toEqual(["1a", "2b"])
 * ```
 */
export const zipWith = <A, B, C>(
  a: AnyArray<A>,
  b: AnyArray<B>,
  f: (a: A, b: B) => C,
): Array<C> => {
  const len = Math.min(a.length, b.length)
  const out: Array<C> = []
  for (let i = 0; i < len; i++) {
    out.push(f(a[i], b[i]))
  }
  return out
}
