import { expect } from "@std/expect/expect"
import { pipe } from "./utility.ts"
import "./Array.ts"
import { NonEmptyArray, ReadonlyNonEmptyArray } from "./Array.ts"

Deno.test("Array", () => {
  const a1: ReadonlyArray<number> = [1, 2, 3]
  const a2: Array<number> = [1, 2, 3]
  const a3: NonEmptyArray<number> = [1]
  const a4: ReadonlyNonEmptyArray<number> = [1]
  const x1 = pipe(
    a1,
    Array.map((t) => {
      return t + 1
    }),
  )

  expect(x1).toEqual([1, 2, 3].map((t) => t + 1))

  const x2 = pipe(
    a2,
    Array.map((t) => {
      return "Hello!"
    }),
  )

  expect(x2).toEqual([1, 2, 3].map((t) => t + 1))

  const x3 = pipe(
    a3,
    Array.map((t) => {
      return t + 1
    }),
  )

  expect(x3).toEqual([1, 2, 3].map((t) => t + 1))

  const x4 = pipe(
    a4,
    Array.map((t) => {
      return t + 1
    }),
  )

  expect(x4).toEqual([1, 2, 3].map((t) => t + 1))
})
