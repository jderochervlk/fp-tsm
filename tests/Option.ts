import { expect } from "jsr:@std/expect"
import * as Option from "../src/Option.ts"

Deno.test("of creates a Some when value is not nullable", () => {
  const option = Option.of(1)
  expect(option._tag).toBe("Some")
})

Deno.test("of creates a None when value is null", () => {
  const option = Option.of(null)
  expect(option._tag).toBe("None")
})

Deno.test("of creates a None when value is undefined", () => {
  const option = Option.of(undefined)
  expect(option._tag).toBe("None")
})
