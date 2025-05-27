import { expect } from "@std/expect/expect"
import { pipe } from "./utility.ts"
import "./Array.ts"

Deno.test("Array", () => {
  const a1: ReadonlyArray<number> = [1, 2, 3]
  const a2: Array<number> = [1, 2, 3]

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
      return t + 1
    }),
  )

  expect(x2).toEqual([1, 2, 3].map((t) => t + 1))

  const fn = (a: ReadonlyArray<number>) => a

  fn(x1)
  fn(x2)
})
