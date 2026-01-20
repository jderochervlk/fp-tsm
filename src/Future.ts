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
 * const data = z.array(z.string())
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
 *       : Future.err(parsed.error)
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
export type Future<L, R> = () => Promise<
  Result.Result<L, R>
>

/**
 * @ignore
 */
export type Ok<R> = () => Promise<Result.Ok<R>>

/**
 * @ignore
 */
export type Err<L> = () => Promise<Result.Err<L>>

/**
 * Create a `Future` from an `Promise` by using `.then` and `.catch`.
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const data = Future.fromPromise(Promise.resolve(42)) // Result.ok(42)
 *
 * const error = Future.fromPromise(Promise.reject("Error")) // Result.err("Error")
 * ```
 */
export const fromPromise = <L, R>(
  value: Promise<R>,
): Future<L, R> =>
() =>
  value.then((r: R) => Result.ok<R>(r))
    .catch((l: L) => Result.err<L>(l))

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
export const ok = <R>(value: R): Ok<R> => () => Promise.resolve(Result.ok(value))

/**
 * Create a Future that resolves to a Err value.
 *
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const error = Future.err("Error") // Result.err("Error")
 * ```
 */
export const err = <L>(value: L): Err<L> => () => Promise.resolve(Result.err<L>(value))

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
 * const error = Future.err("error")
 * const doubledError = Future.map(error, (n: number) => n * 2) // Future<string, number>
 * await doubledError() // Result.err("error")
 * ```
 */
export const map: {
  <L, R1, R2>(f: (a: R1) => R2): (future: Future<L, R1>) => Future<L, R2>
  <L, R1, R2>(future: Future<L, R1>, f: (a: R1) => R2): Future<L, R2>
} = dual(
  2,
  <L, R1, R2>(future: Future<L, R1>, f: (a: R1) => R2): Future<L, R2> => async () => {
    const x = await future()
    return Result.map(x, f)
  },
)

/**
 * Maps over the Ok value of a Future using the provided function and flattens the result.
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
 * const error = Future.err("error")
 * const doubledError = Future.flatMap(error, (n: number) => Future.ok(n * 2)) // Future<string, number>
 * await doubledError() // Result.err("error")
 * ```
 */
export const flatMap: {
  <LA, LB, RA, RB>(
    f: (a: RA) => Future<LB, RB>,
  ): (future: Future<LA, RA>) => Future<LA | LB, RB>
  <LA, LB, RA, RB>(
    future: Future<LA, RA>,
    f: (a: RA) => Future<LB, RB>,
  ): Future<LA | LB, RB>
} = dual(
  2,
  <LA, LB, RA, RB>(
    future: Future<LA, RA>,
    f: (a: RA) => Future<LB, RB>,
  ): Future<LA | LB, RB> =>
  async () => {
    const value = await future()
    return value._tag === "Ok" ? await f(value.ok)() : Result.err(value.err)
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
 * const future = Future.err("error")
 * const mapped = Future.mapErr(future, (e: string) => new Error(e)) // Future<Error, never>
 * await mapped() // Result.err(Error("error"))
 *
 * const success = Future.ok(42)
 * const mappedSuccess = Future.mapErr(success, (e: string) => new Error(e)) // Future<Error, number>
 * await mappedSuccess() // Result.ok(42)
 * ```
 */
export const mapErr: {
  <L1, L2, R>(f: (a: L1) => L2): (future: Future<L1, R>) => Future<L2, R>
  <L1, L2, R>(future: Future<L1, R>, f: (a: L1) => L2): Future<L2, R>
} = dual(
  2,
  <L1, L2, R>(future: Future<L1, R>, f: (a: L1) => L2): Future<L2, R> => () =>
    future().then(Result.mapErr(f)),
)

/**
 * Maps over the Err value of a Future using the provided function and flattens the result.
 * If the Future contains a Ok value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.err("error")
 * const mapped = Future.flatMapErr(future, (e: string) => Future.err(new Error(e))) // Future<Error, never>
 * await mapped() // Result.err(Error("error"))
 *
 * const success = Future.ok(42)
 * const mappedSuccess = Future.flatMapErr(success, (e: string) => Future.err(new Error(e))) // Future<Error, number>
 * await mappedSuccess() // Result.ok(42)
 * ```
 */
export const flatMapLeft: {
  <LA, LB, RA, RB>(
    f: (a: LA) => Future<LB, RB>,
  ): (future: Future<LA, RA>) => Future<LB, RA | RB>
  <LA, LB, RA, RB>(
    future: Future<LA, RA>,
    f: (a: LA) => Future<LB, RB>,
  ): Future<LB, RA | RB>
} = dual(
  2,
  <LA, LB, RA, RB>(
    future: Future<LA, RA>,
    f: (a: LA) => Future<LB, RB>,
  ): Future<LB, RA | RB> =>
  async () => {
    const value = await future()
    return value._tag === "Err" ? await f(value.err)() : Result.ok(value.ok)
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
 * const error = Future.err("error")
 * const mappedError = Future.bimap(
 *   error,
 *   (e: string) => new Error(e),
 *   (n: number) => n * 2
 * )
 * await mappedError() // Result.err(Error("error"))
 * ```
 */
export const bimap: {
  <L1, L2, R1, R2>(
    fl: (l: L1) => L2,
    fr: (r: R1) => R2,
  ): (future: Future<L1, R1>) => Future<L2, R2>
  <L1, L2, R1, R2>(
    future: Future<L1, R1>,
    fl: (l: L1) => L2,
    fr: (r: R1) => R2,
  ): Future<L2, R2>
} = dual(
  3,
  <L1, L2, R1, R2>(
    future: Future<L1, R1>,
    fl: (l: L1) => L2,
    fr: (r: R1) => R2,
  ): Future<L2, R2> =>
  async () => {
    const value = await future()
    return Result.bimap(value, fl, fr)
  },
)

/**
 * A wrapper for `fetch` that returns a `Future<Response | TypeError, Response>` and checks `Response.ok` to determine if the response is a success or failure.
 *
 * If there is an issue with the `fetch` call itself (like a bad URL), it will return a `TypeError` in the `Err` of the `Result`.
 *
 * @category Utility Functions
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const result = Future.fetch("https://baconipsum.com/api/?type=meat-and-filler")
 * ```
 */
export const fetch = (
  url: string,
  init?: RequestInit,
): Future<
  | Response
  | TypeError,
  Response
> =>
async () => {
  try {
    return await globalThis.fetch(url, init).then((res) =>
      res.ok ? Result.ok(res) : Result.err(res)
    )
  } catch (error) {
    return error instanceof TypeError
      ? Result.err(error)
      : Result.err(TypeError(JSON.stringify(error))) // This should never happen, but it's here just in case
  }
}
