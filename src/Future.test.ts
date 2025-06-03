import { expect } from "@std/expect/expect"
import { assertSpyCalls, spy } from "jsr:@std/testing/mock"
// import { z } from "npm:zod@4.0.0-beta.20250505T195954"
import * as Either from "./Either.ts"
import * as Future from "./Future.ts"
import { pipe } from "./utility.ts"

Deno.test("Future is are lazy and multiple maps can be applied", async () => {
  const logSpy = spy()

  const fn = (x: number) => {
    logSpy()
    return x + 1
  }

  let data = pipe(
    Future.fromPromise(Promise.resolve(42)),
  )

  assertSpyCalls(logSpy, 0)

  data = pipe(
    data,
    Future.map(fn),
  )

  assertSpyCalls(logSpy, 0)

  const result = await data()
  expect(result).toEqual(Either.right(43))
})

// this does network requests, so it's commented out to avoid running it in CI

// Deno.test("Fetching and promises", async () => {
//   const data = z.array(z.string())
//   const result = pipe(
//     Future.fetch("https://baconipsum.com/api/?type=meat-and-filler"),
//     Future.flatMap((res) => Future.fromPromise(res.json())),
//     Future.flatMap((res) => {
//       const parsed = data.safeParse(res)
//       return parsed.success
//         ? Future.right(parsed.data)
//         : Future.left(parsed.error)
//     }),
//   )

//   expect(Either.isRight(await result())).toBeTruthy()
// })

Deno.test("Future.fromPromise", async () => {
  const data = Future.fromPromise(Promise.resolve(42))

  expect(await data()).toEqual(Either.right(42))

  expect(await Future.fromPromise(Promise.reject("Error"))()).toEqual(
    Either.left("Error"),
  )
})

Deno.test("Future.right and map", async () => {
  expect(await Future.map(Future.right(42), (x) => x + 1)()).toEqual(
    Either.right(43),
  )
})

Deno.test("flatMapLeft", async () => {
  const future = Future.left("error")
  const mapped = Future.flatMapLeft(
    future,
    (e: string) => Future.left(new Error(e)),
  ) // Future<Error, never>
  await mapped() // Either.left(Error("error"))

  const success = Future.right(42)
  const mappedSuccess = Future.flatMapLeft(
    success,
    (e: string) => Future.left(new Error(e)),
  ) // Future<Error, number>

  expect(await mappedSuccess()).toEqual(Either.right(42)) // Either.right(42)
})

Deno.test("bimap", async () => {
  const future = Future.right(42)
  const mapped = Future.bimap(
    future,
    (e: string) => new Error(e),
    (n: number) => n * 2,
  )

  expect(await mapped()).toEqual(Either.right(84))

  const error = Future.left("error")
  const mappedError = Future.bimap(
    error,
    (e: string) => new Error(e),
    (n: number) => n * 2,
  )

  expect(await mappedError()).toEqual(Either.left(Error("error")))
})
