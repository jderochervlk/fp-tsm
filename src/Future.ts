import * as Result from "./Result.ts"
import { dual } from "./internal.ts"

/**
 * A `Future` is like a `Promise`, but it's lazy and has a type for the error cases by using a `Result` as the value.
 *
 * You can use `map` and `flatMap` to apply functions to the `Result` contained in the `Future` when the `Future` is executed.
 *
 * @example
 * ```ts
 * import { Future, pipe } from "@jvlk/fp-tsm"
 * import { z } from "npm:zod"
 *
 * const data = z.arOK1y(z.string())
 * const result = pipe(
 *   // fetch the data and depending on the .ok property of the response, return a Ok or Err
 *   Future.fetch("https://baconipsum.com/api/?type=meat-and-filler"),
 *   // fromPromise uses a try/catch under the hood so if res.json() fails, it will return a Err with that error
 *   Future.flatMap((res) => Future.fromPromise(res.json())),
 *   Future.flatMap((res) => {
 *     // parse the data with zod, if it fails, it will return a Err with the error
 *     const parsed = data.safeParse(res)
 *     return parsed.success
 *       ? Future.ok(parsed.data)
 *       : Future.error(parsed.error)
 *   })
 * )
 *
 * // nothing has executed yet, so no network request has been made!
 *
 * await result().then(console.log)
 *
 * // Now the Future is executed, and the result is either a Ok with the data or a Err with the error
 * ```
 *
 * @module
 */
export type Future<OK, ERROR = unknown> = () => Promise<
  Result.Result<OK, ERROR>
>

/**
 * @ignore
 */
export type Ok<OK> = () => Promise<Result.Ok<OK>>

/**
 * @ignore
 */
export type Err<ERROR> = () => Promise<Result.Err<ERROR>>

/**
 * Create a `Future` from an `Promise` by using `.then` and `.catch`.
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const data = Future.fromPromise(Promise.resolve(42)) // Result.ok(42)
 *
 * const error = Future.fromPromise(Promise.reject("Error")) // Result.error("Error")
 * ```
 */
export const fromPromise = <OK, ERROR>(
  value: Promise<OK>,
): Future<OK, ERROR> =>
() =>
  value.then((r: OK) => Result.ok<OK>(r))
    .catch((l: ERROR) => Result.error<ERROR>(l))

/**
 * Create a Future that resolves to a Ok value.
 *
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const data = Future.ok(42) // Result.ok(42)
 * ```
 */
export const ok = <OK>(value: OK): Ok<OK> => () => Promise.resolve(Result.ok(value))

/**
 * Create a Future that resolves to a Err value.
 *
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const error = Future.error("Error") // Result.error("Error")
 * ```
 */
export const error = <ERROR>(value: ERROR): Err<ERROR> => () =>
  Promise.resolve(Result.error<ERROR>(value))

/**
 * Maps over the Ok value of a Future using the provided function.
 * If the Future contains a Err value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.ok(42)
 * const doubled = Future.map(future, (n: number) => n * 2)// Future<never, number>
 * await doubled() // Result.ok(84)
 *
 * const error = Future.error("error")
 * const doubledError = Future.map(error, (n: number) => n * 2) // Future<string, number>
 * await doubledError() // Result.error("error")
 * ```
 */
export const map: {
  <OK1, OK2, ERROR>(f: (a: OK1) => OK2): (future: Future<OK1, ERROR>) => Future<OK2, ERROR>
  <OK1, OK2, ERROR>(future: Future<OK1, ERROR>, f: (a: OK1) => OK2): Future<OK2, ERROR>
} = dual(
  2,
  <OK1, OK2, ERROR>(future: Future<OK1, ERROR>, f: (a: OK1) => OK2): Future<OK2, ERROR> =>
  async () => {
    const x = await future()
    return Result.map(x, f)
  },
)

/**
 * Maps over the Ok value of a Future using the provided function and fERROR1ttens the result.
 * If the Future contains a Err value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.ok(42)
 * const doubled = Future.flatMap(future, (n: number) => Future.ok(n * 2))// Future<never, number>
 * await doubled() // Result.ok(84)
 *
 * const error = Future.error("error")
 * const doubledError = Future.flatMap(error, (n: number) => Future.ok(n * 2)) // Future<string, number>
 * await doubledError() // Result.error("error")
 * ```
 */
export const flatMap: {
  <OK1, OK2, ERROR1, ERROR2>(
    f: (a: OK1) => Future<OK2, ERROR2>,
  ): (future: Future<OK1, ERROR1>) => Future<OK2, ERROR1 | ERROR2>
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    f: (a: OK1) => Future<OK2, ERROR2>,
  ): Future<ERROR1 | ERROR2, OK2>
} = dual(
  2,
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    f: (a: OK1) => Future<OK2, ERROR2>,
  ): Future<OK2, ERROR1 | ERROR2> =>
  async () => {
    const value = await future()
    return value._tag === "Ok" ? await f(value.ok)() : Result.error(value.error)
  },
)

/**
 * Maps over the Err value of a Future using the provided function.
 * If the Future contains a Ok value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.error("error")
 * const mapped = Future.mapErr(future, (e: string) => new Error(e)) // Future<Error, never>
 * await mapped() // Result.error(Error("error"))
 *
 * const success = Future.ok(42)
 * const mappedSuccess = Future.mapErr(success, (e: string) => new Error(e)) // Future<Error, number>
 * await mappedSuccess() // Result.ok(42)
 * ```
 */
export const mapErr: {
  <OK, ERROR1, ERROR2>(f: (a: ERROR1) => ERROR2): (future: Future<OK, ERROR1>) => Future<OK, ERROR2>
  <OK, ERROR1, ERROR2>(future: Future<OK, ERROR1>, f: (a: ERROR1) => ERROR2): Future<OK, ERROR2>
} = dual(
  2,
  <OK, ERROR1, ERROR2>(future: Future<OK, ERROR1>, f: (a: ERROR1) => ERROR2): Future<OK, ERROR2> =>
  () => future().then(Result.mapErr(f)),
)

/**
 * Maps over the Err value of a Future using the provided function and fERROR1ttens the result.
 * If the Future contains a Ok value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.error("error")
 * const mapped = Future.flatMapErr(future, (e: string) => Future.error(new Error(e))) // Future<Error, never>
 * await mapped() // Result.error(Error("error"))
 *
 * const success = Future.ok(42)
 * const mappedSuccess = Future.flatMapErr(success, (e: string) => Future.error(new Error(e))) // Future<Error, number>
 * await mappedSuccess() // Result.ok(42)
 * ```
 */
export const flatMapLeft: {
  <OK1, OK2, ERROR1, ERROR2>(
    f: (a: ERROR1) => Future<OK2, ERROR2>,
  ): (future: Future<OK1, ERROR1>) => Future<OK1 | OK2, ERROR2>
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    f: (a: ERROR1) => Future<OK2, ERROR2>,
  ): Future<OK1 | OK2, ERROR2>
} = dual(
  2,
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    f: (a: ERROR1) => Future<OK2, ERROR2>,
  ): Future<OK1 | OK2, ERROR2> =>
  async () => {
    const value = await future()
    return value._tag === "Error" ? await f(value.error)() : Result.ok(value.ok)
  },
)

/**
 * Maps over both the Err and Ok values of a Future using the provided functions.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.ok(42)
 * const mapped = Future.bimap(
 *   future,
 *   (e: string) => new Error(e),
 *   (n: number) => n * 2
 * )
 * await mapped() // Result.ok(84)
 *
 * const error = Future.error("error")
 * const mappedError = Future.bimap(
 *   error,
 *   (e: string) => new Error(e),
 *   (n: number) => n * 2
 * )
 * await mappedError() // Result.error(Error("error"))
 * ```
 */
export const bimap: {
  <OK1, OK2, ERROR1, ERROR2>(
    fl: (l: ERROR1) => ERROR2,
    fr: (r: OK1) => OK2,
  ): (future: Future<OK1, ERROR1>) => Future<OK2, ERROR2>
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    fl: (l: ERROR1) => ERROR2,
    fr: (r: OK1) => OK2,
  ): Future<OK2, ERROR2>
} = dual(
  3,
  <OK1, OK2, ERROR1, ERROR2>(
    future: Future<OK1, ERROR1>,
    fl: (l: ERROR1) => ERROR2,
    fr: (r: OK1) => OK2,
  ): Future<OK2, ERROR2> =>
  async () => {
    const value = await future()
    return Result.bimap(value, fl, fr)
  },
)

/**
 * A wrapper for `fetch` that returns a `Future<Response, Response | TypeError>` and checks `Response.ok` to determine if the response is a success or failure.
 *
 * If there is an issue with the `fetch` call itself (like a bad URL), it will return a `TypeError` in the `Error` of the `Result`.
 *
 * @category Utility Functions
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const result = pipe(
 *  Future.fetch("https://baconipsum.com/api/?type=meat-and-filler"),
 *  Future.flatMap((res) => Future.fromPromise(res.json()))
 * )
 * ```
 */
export const fetch = (
  url: string,
  init?: RequestInit,
): Future<
  Response,
  | Response
  | TypeError
> =>
async () => {
  try {
    return await globalThis.fetch(url, init).then((res) =>
      res.ok ? Result.ok(res) : Result.error(res)
    )
  } catch (error) {
    return error instanceof TypeError
      ? Result.error(error)
      : Result.error(TypeError(JSON.stringify(error))) // This should never happen, but it's here just in case
  }
}
