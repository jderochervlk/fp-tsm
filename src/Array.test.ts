import { Option } from "@jvlk/fp-tsm"
import { expect } from "@std/expect/expect"
import type { NonEmptyArray, ReadonlyNonEmptyArray } from "./Array.ts"
import * as A from "./Array.ts"
import { flow, pipe } from "./utility.ts"

Deno.test("map", () => {
  const a1: ReadonlyArray<number> = [1, 2, 3]
  const a2: Array<number> = [1, 2, 3]
  const a3: NonEmptyArray<number> = [1, 2, 3]
  const a4: ReadonlyNonEmptyArray<number> = [1, 2, 3]

  const x1 = pipe(
    a1,
    A.map((t) => {
      return t + 1
    }),
  )

  expect(x1).toEqual([1, 2, 3].map((t) => t + 1))

  const x2 = pipe(
    a2,
    A.map((t) => {
      return t + 1
    }),
  )

  expect(x2).toEqual([1, 2, 3].map((t) => t + 1))

  const x3 = pipe(
    a3,
    A.map((t) => {
      return t + 1
    }),
  )

  expect(x3).toEqual([1, 2, 3].map((t) => t + 1))

  const x4 = pipe(
    a4,
    A.map((t) => {
      return t + 1
    }),
  )

  expect(x4).toEqual([1, 2, 3].map((t) => t + 1))
})

Deno.test("at", () => {
  expect(
    pipe([1, 2, 3], A.at([0])),
  ).toEqual([{ _tag: "Some", value: 1 }])
})

Deno.test("array flow", () => {
  const arrayPipe: {
    <T, U>(
      fn: (t: T) => U,
      preProcess: <A>(t: T | A) => t is T,
    ): <X>(arr: Array<X>) => Array<U>
    <T, U>(
      fn: (t: T) => U,
    ): (arr: Array<T>) => Array<U>
  } = <T, U, A extends T>(
    fn: (t: A) => U,
    preProcess?: (t: T | A) => t is A,
  ) =>
  (arr: Array<A>) => {
    const acc: Array<U> = []
    arr.forEach((item) => {
      if (preProcess && !preProcess(item)) {
        return
      }
      acc.push(fn(item))
    })
    return acc
  }

  const incrementAndStringify = flow((x: number) => x + 1, (x) => String(x))

  expect(pipe([1, 2, 3], arrayPipe(incrementAndStringify))).toEqual([
    "2",
    "3",
    "4",
  ])

  const arr2 = pipe(
    [1, 2, 3, "3", false],
    arrayPipe(
      incrementAndStringify,
      (x: unknown): x is number => typeof x === "number",
    ),
  )

  expect(
    arr2,
  ).toEqual([
    "2",
    "3",
    "4",
  ])
})

Deno.test("Filtering cound product an empty array - data first", () => {
  const arr: ReadonlyNonEmptyArray<number> = [1, 2, 3, 4, 5]

  const result = A.filter(arr, (n) => n > 5)

  expect(result).toEqual([])
})

Deno.test("Filtering cound product an empty array - point free", () => {
  const arr: ReadonlyNonEmptyArray<number> = [1, 2, 3, 4, 5]

  const result = pipe(arr, A.filter((n) => n > 5))

  expect(result).toEqual([])
})

Deno.test("compact", () => {
  const arr: ReadonlyNonEmptyArray<Option.Option<number>> = [
    Option.some(1),
    Option.none,
  ]

  const res = A.compact(arr)

  expect(res).toEqual([1])
})
