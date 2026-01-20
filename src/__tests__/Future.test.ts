import { expect } from "@std/expect/expect"
import { assertSpyCalls, spy } from "@std/testing/mock"
import type { ZodError } from "zod"
import { z } from "zod"
import * as Either from "../Either.ts"
import * as Future from "../Future.ts"
import * as Option from "../Option.ts"
import { pipe } from "../utility.ts"
import { Result } from "@jvlk/fp-tsm"

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
  expect(result).toEqual(Result.ok(43))
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
//         ? Future.ok(parsed.data)
//         : Future.error(parsed.error)
//     }),
//   )

//   expect(Either.isRight(await result())).toBeTruthy()
// })

Deno.test("Future.fromPromise", async () => {
  const data = Future.fromPromise(Promise.resolve(42))

  expect(await data()).toEqual(Result.ok(42))

  expect(await Future.fromPromise(Promise.reject("Error"))()).toEqual(
    Result.error("Error"),
  )
})

Deno.test("Future.ok and map", async () => {
  expect(await Future.map(Future.ok(42), (x) => x + 1)()).toEqual(
    Result.ok(43),
  )
})

Deno.test("flatMapLeft", async () => {
  const future = Future.error("error")
  const mapped = Future.flatMapLeft(
    future,
    (e: string) => Future.error(new Error(e)),
  ) // Future<Error, never>
  await mapped() // Result.error(Error("error"))

  const success = Future.ok(42)
  const mappedSuccess = Future.flatMapLeft(
    success,
    (e: string) => Future.error(new Error(e)),
  ) // Future<Error, number>

  expect(await mappedSuccess()).toEqual(Result.ok(42)) // Result.ok(42)
})

Deno.test("bimap", async () => {
  const future = Future.ok(42)
  const mapped = Future.bimap(
    future,
    (e: string) => new Error(e),
    (n: number) => n * 2,
  )

  expect(await mapped()).toEqual(Result.ok(84))

  const error = Future.error("error")
  const mappedError = Future.bimap(
    error,
    (e: string) => new Error(e),
    (n: number) => n * 2,
  )

  expect(await mappedError()).toEqual(Result.error(Error("error")))
})

const userSchema = z.object({
  email: z.string().email(),
  settings: z.object({
    theme: z.string().optional(),
  }).optional(),
})

const _getUserData = (
  id: string,
): Future.Future<string, Error | ZodError> =>
  pipe(
    Future.fetch(`/api/users/${id}`),
    Future.mapErr((error) => Error(`Network error: ${error}`)),
    Future.flatMap((res) => Future.fromPromise(res.json())),
    Future.mapErr((error) => Error(`Failed to get user data: ${error}`)),
    Future.flatMap((data) => {
      const parsed = userSchema.safeParse(data)
      return parsed.success ? Future.ok(parsed.data) : Future.error(parsed.error)
    }),
    Future.map((user) =>
      pipe(
        Option.of(user?.settings?.theme),
        Option.getOrElse(() => "default-theme"),
      )
    ),
  )
