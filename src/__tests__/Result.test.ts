import { expect } from "@std/expect/expect"
import * as Result from "../Result.ts"

Deno.test("OK type is all you need", () => {
  const value = Result.ok(42)

  const add = (n: number) => n + 1

  const result = Result.map(value, add)

  expect(result).toEqual(Result.ok(43))
})
