import { expect } from "@std/expect/expect"
import * as Either from "./Either.ts"
import * as Option from "./Option.ts"
import { pipe } from "./utility.ts"
import { assertSpyCalls, spy } from "jsr:@std/testing/mock"

/**
 * A task is like a promise, but it's lazy and has a type for the catch cases.
 * The value inside a `Task` is either an `Option` or an `Either`.
 *
 * You can use `map` and `flatMap` and the functions will apply to the `Option` or `Either` contained in the `Task`.
 * None of these functions will execute until you call the task itself, which is just a lazy function that you can await.
 */
export type Task<A, B> = () => Promise<
  Option.Option<A> | Either.Either<B, A>
>

export const of = <A extends Option.Option<B> | Either.Either<L, B>, B, L>(
  value: A,
): Task<B, L> =>
() => Promise.resolve(value)

export const map =
  <A, B, E>(f: (a: A) => NonNullable<B>) =>
  (task: Task<A, E>): Task<B, E> =>
  async () => {
    const result = await task()
    switch (result._tag) {
      case "None":
        return Promise.resolve(result)
      case "Some":
        return Promise.resolve(Option.map(f)(result))
      case "Left":
        return Promise.resolve(result)
      case "Right":
        return Promise.resolve(Either.map<E, A, NonNullable<B>>(f)(result))
    }
  }

export const flatMap =
  <A, B, E>(f: (a: A) => Task<B, E>) =>
  (task: Task<A, E>): Task<B, E> =>
  async () => {
    const result = await task()
    switch (result._tag) {
      case "None":
        return result
      case "Some":
        return f(result.value)()
      case "Left":
        return result
      case "Right":
        return f(result.right)()
    }
  }

export const fetch =
  (url: string, init?: RequestInit): Task<Response, Response> => async () =>
    await globalThis.fetch(url, init).then((res) =>
      res.ok ? Either.right(res) : Either.left(res)
    )

export const promise =
  <A, B, C, T extends Option.Option<A> | Either.Either<B, A>>(
    fn: (a: A) => Promise<T>,
  ) =>
  (a: Task<A, B>) =>
  () =>
    a().then(async (t) => {
      const val = t._tag === "Some"
        ? await fn(t.value)
        : t._tag === "Right"
        ? await fn(t.right)
        : t
      return val
    })

// export const tryPromise = <L1, R1>(
//   fn: <L2, R2>(a: L1) => Either.Either<L2, R1>,
// ) => promise((x) => fn(x).then(Either.right).catch(Either.left))
