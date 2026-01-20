import * as Either from "./Either.ts"
import { dual } from "./internal.ts"

/**
 * A `Future` is like a `Promise`, but it's lazy and has a type for the catch cases by using an `Either` as the value.
 *
 * You can use `map` and `flatMap` and the functions will apply to the `Either` contained in the `Future` when the `Future` is executed.
 *
 * @example
 * ```ts
 * import { Future, pipe } from "@jvlk/fp-tsm"
 * import { z } from "npm:zod"
 *
 * const data = z.array(z.string())
 * const result = pipe(
 *   // fetch the data and depending on the .ok property of the response, return a Right or Left
 *   Future.fetch("https://baconipsum.com/api/?type=meat-and-filler"),
 *   // fromPromise uses a try/catch under the hood so if res.json() fails, it will return a Left with that error
 *   Future.flatMap((res) => Future.fromPromise(res.json())),
 *   Future.flatMap((res) => {
 *     // parse the data with zod, if it fails, it will return a Left with the error
 *     const parsed = data.safeParse(res)
 *     return parsed.success
 *       ? Future.right(parsed.data)
 *       : Future.left(parsed.error)
 *   })
 * )
 *
 * // nothing has executed yet, so no network request has been made!
 *
 * await result().then(console.log)
 *
 * // Now the Future is executed, and the result is either a Right with the data or a Left with the error
 * ```
 *
 * @module
 */
export type Future<L, R> = () => Promise<
  Either.Either<L, R>
>

/**
 * @ignore
 */
export type Right<R> = () => Promise<Either.Right<R>>

/**
 * @ignore
 */
export type Left<L> = () => Promise<Either.Left<L>>

/**
 * Create a `Future` from an `Promise` by using `.then` and `.catch`.
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const data = Future.fromPromise(Promise.resolve(42)) // Either.right(42)
 *
 * const error = Future.fromPromise(Promise.reject("Error")) // Either.left("Error")
 * ```
 */
export const fromPromise = <L, R>(
  value: Promise<R>,
): Future<L, R> =>
() =>
  value.then((r: R) => Either.right<R>(r))
    .catch((l: L) => Either.left<L>(l))

/**
 * Create a Future that resolves to a Right value.
 *
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const data = Future.right(42) // Either.right(42)
 * ```
 */
export const right = <R>(value: R): Right<R> => () => Promise.resolve(Either.right(value))

/**
 * Create a Future that resolves to a Left value.
 *
 * @category Creating Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const error = Future.left("Error") // Either.left("Error")
 * ```
 */
export const left = <L>(value: L): Left<L> => () => Promise.resolve(Either.left<L>(value))

/**
 * Maps over the Right value of a Future using the provided function.
 * If the Future contains a Left value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.right(42)
 * const doubled = Future.map(future, (n: number) => n * 2)// Future<never, number>
 * await doubled() // Either.right(84)
 *
 * const error = Future.left("error")
 * const doubledError = Future.map(error, (n: number) => n * 2) // Future<string, number>
 * await doubledError() // Either.left("error")
 * ```
 */
export const map: {
  <L, R1, R2>(f: (a: R1) => R2): (future: Future<L, R1>) => Future<L, R2>
  <L, R1, R2>(future: Future<L, R1>, f: (a: R1) => R2): Future<L, R2>
} = dual(
  2,
  <L, R1, R2>(future: Future<L, R1>, f: (a: R1) => R2): Future<L, R2> => async () => {
    const x = await future()
    return Either.map(x, f)
  },
)

/**
 * Maps over the Right value of a Future using the provided function and flattens the result.
 * If the Future contains a Left value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.right(42)
 * const doubled = Future.flatMap(future, (n: number) => Future.right(n * 2))// Future<never, number>
 * await doubled() // Either.right(84)
 *
 * const error = Future.left("error")
 * const doubledError = Future.flatMap(error, (n: number) => Future.right(n * 2)) // Future<string, number>
 * await doubledError() // Either.left("error")
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
    return value._tag === "Right" ? await f(value.right)() : Either.left(value.left)
  },
)

/**
 * Maps over the Left value of a Future using the provided function.
 * If the Future contains a Right value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.left("error")
 * const mapped = Future.mapLeft(future, (e: string) => new Error(e)) // Future<Error, never>
 * await mapped() // Either.left(Error("error"))
 *
 * const success = Future.right(42)
 * const mappedSuccess = Future.mapLeft(success, (e: string) => new Error(e)) // Future<Error, number>
 * await mappedSuccess() // Either.right(42)
 * ```
 */
export const mapLeft: {
  <L1, L2, R>(f: (a: L1) => L2): (future: Future<L1, R>) => Future<L2, R>
  <L1, L2, R>(future: Future<L1, R>, f: (a: L1) => L2): Future<L2, R>
} = dual(
  2,
  <L1, L2, R>(future: Future<L1, R>, f: (a: L1) => L2): Future<L2, R> => () =>
    future().then(Either.mapLeft(f)),
)

/**
 * Maps over the Left value of a Future using the provided function and flattens the result.
 * If the Future contains a Right value, it will be returned unchanged.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.left("error")
 * const mapped = Future.flatMapLeft(future, (e: string) => Future.left(new Error(e))) // Future<Error, never>
 * await mapped() // Either.left(Error("error"))
 *
 * const success = Future.right(42)
 * const mappedSuccess = Future.flatMapLeft(success, (e: string) => Future.left(new Error(e))) // Future<Error, number>
 * await mappedSuccess() // Either.right(42)
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
    return value._tag === "Left" ? await f(value.left)() : Either.right(value.right)
  },
)

/**
 * Maps over both the Left and Right values of a Future using the provided functions.
 *
 * @category Working with Futures
 * @example
 * ```ts
 * import { Future } from "@jvlk/fp-tsm"
 *
 * const future = Future.right(42)
 * const mapped = Future.bimap(
 *   future,
 *   (e: string) => new Error(e),
 *   (n: number) => n * 2
 * )
 * await mapped() // Either.right(84)
 *
 * const error = Future.left("error")
 * const mappedError = Future.bimap(
 *   error,
 *   (e: string) => new Error(e),
 *   (n: number) => n * 2
 * )
 * await mappedError() // Either.left(Error("error"))
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
    return Either.bimap(value, fl, fr)
  },
)

/**
 * A wrapper for `fetch` that returns a `Future<Response | TypeError, Response>` and checks `Response.ok` to determine if the response is a success or failure.
 *
 * If there is an issue with the `fetch` call itself (like a bad URL), it will return a `TypeError` in the `Left` of the `Either`.
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
      res.ok ? Either.right(res) : Either.left(res)
    )
  } catch (error) {
    return error instanceof TypeError
      ? Either.left(error)
      : Either.left(TypeError(JSON.stringify(error))) // This should never happen, but it's here just in case
  }
}
