import { expect } from "@std/expect/expect"
import * as Either from "../Either.ts"
import { pipe } from "../utility.ts"

Deno.test("flatMap types should work", () => {
  const t = Either.right(42)
  const result = pipe(
    Either.flatMap(
      t,
      (x) => x > 10 ? Either.right(x + 1) : Either.left("Too small"),
    ),
    Either.flatMap((x) => x > 8 ? Either.right(x + 1) : Either.left(Error("Too small again"))),
  )

  expect(result).toEqual(Either.right(44))

  const changedError = Either.mapLeft(
    result,
    (e) => e instanceof Error ? "Error occurred" : e,
  )

  expect(changedError).toEqual(Either.right(44))
})
