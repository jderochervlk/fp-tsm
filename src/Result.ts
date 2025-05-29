import { dual } from "./internal.ts"
import type { Option } from "./Option.ts"
import type { Either } from "./Either.ts"

/**
 * The `Result` type represents values that can be either a success value `Ok` or an `Error` value.
 *
 * It is commonly used for error handling and expressing computations that may fail. Instead of throwing exceptions, functions can return a `Result`
 * that explicitly represents both success and failure cases.
 *
 * `Result` is similar to `Either` but the failure case is always an `Error` type, which provides a consistent way to handle errors across your codebase and it can provide better interop with the other TypeScript features.
 *
 * Throwing exceptions complicates control flow and hides exceptions from the type system, making it harder to reason about error handling in your code.
 *
 * @example Functions that can fail with exceptions can become hard to compose and manage. Exception handling adds complexity and makes control flow harder to follow.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 *
 * const divide = (a: number, b: number): number => {
 *   if (b === 0) {
 *     throw new Error("Division by zero")
 *   }
 *   return a / b
 * }
 *
 * const increment = (a: number): number => a + 1
 *
 * try {
 *   expect(increment(divide(6, 2))).toEqual(4)
 *   expect(increment(divide(6, 0))) // Throws error
 * } catch (e) {
 *   // handle error
 * }
 * ```
 *
 * @example Using `Result` makes error handling explicit and composable. The error cases are handled through the type system rather than exceptions.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * const divide = (a: number, b: number): Result.Result<number> =>
 *   b === 0 ? new Error("Division by zero") : Result.ok(a / b)
 *
 * const increment = (a: Result.Result<number>): Result.Result<number> =>
 *   Result.map(a, x => x + 1)
 *
 * expect(increment(divide(6, 2))).toEqual({ _tag: "Ok", val: 4 })
 * expect(increment(divide(6, 0))).toEqual(new Error("Division by zero"))
 * ```
 *
 * @module
 */
export type Result<T, E extends Error = Error> = Ok<T> | E

type Ok<T> = {
  _tag: "Ok"
  val: T
}

// Generators
/**
 * Constructs an `Ok`. Represents a successful value in a Result.
 *
 * @category Creating Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Construct successful results
 * expect(Result.ok(1)).toEqual({ _tag: "Ok", val: 1 })
 * expect(Result.ok("hello")).toEqual({ _tag: "Ok", val: "hello" })
 * ```
 */
export const ok = <T>(val: T): Result<T> => ({ _tag: "Ok", val })

/**
 * `tryCatch` is a utility function that allows you to execute a function that may throw an error and return a `Result`.
 *
 * @category Creating Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.tryCatch(() => 1)).toEqual(Result.ok(1))
 *
 * expect(Result.tryCatch(() => { throw new Error("Error") }))
 *   .toEqual(new Error("Error"))
 * ```
 */
export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return ok(fn())
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e))
  }
}
/**
 * You can create a `Result` based on a predicate, for example, to check if a value is positive.
 *
 * @category Creating Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * const isPositive = Result.fromPredicate(
 *   (n: number) => n >= 0,
 *   (n) => new Error("Number must be positive")
 * )
 *
 * expect(isPositive(-1)).toEqual(new Error("Number must be positive"))
 * expect(isPositive(1)).toEqual(Result.ok(1))
 * ```
 */
export function fromPredicate<T>(
  predicate: (r: T) => boolean,
  onFalse: (r: T) => Error,
): (r: T) => Result<T> {
  return (r) => predicate(r) ? ok(r) : onFalse(r)
}
/**
 * The `Result.map` function lets you transform the success value inside a `Result` without manually unwrapping and re-wrapping it.
 * If the `Result` holds a success value (`Ok`), the transformation function is applied.
 * If the `Result` is an `Error`, the function is ignored, and the `Error` value remains unchanged.
 *
 * @category Working with Results
 * @example Mapping a Value in Ok
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Transform the value inside Ok
 * expect(Result.map(Result.ok(1), (n: number) => n + 1))
 *   .toEqual(Result.ok(2))
 * ```
 *
 * @example Mapping over Error
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Mapping over Error results in the same Error
 * expect(Result.map(new Error("error"), (n: number) => n + 1))
 *   .toEqual(new Error("error"))
 * ```
 */
export const map: {
  <T, U>(f: (a: T) => U): (self: Result<T>) => Result<U>
  <T, U>(self: Result<T>, f: (a: T) => U): Result<U>
} = dual(
  2,
  <T, U>(self: Result<T>, f: (a: T) => U): Result<U> =>
    self instanceof Error ? self : ok(f(self.val)),
)

/**
 * The `Result.mapError` function lets you transform the error value inside a `Result` without manually unwrapping and re-wrapping it.
 * If the `Result` is an `Error`, the transformation function is applied.
 * If the `Result` holds a success value (`Ok`), the function is ignored, and the success value remains unchanged.
 *
 * @category Working with Results
 * @example Mapping an Error Value
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Transform the error value
 * expect(Result.mapError(new Error("error"), (e: Error) => new Error(e.message.toUpperCase())))
 *   .toEqual(new Error("ERROR"))
 * ```
 *
 * @example Mapping Error over Ok
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Mapping Error over Ok results in the same Ok
 * expect(Result.mapError(Result.ok(1), (e: Error) => new Error(e.message.toUpperCase())))
 *   .toEqual(Result.ok(1))
 * ```
 */
export const mapError: {
  <E extends Error, F extends Error>(
    f: (e: E) => F,
  ): <T>(self: Result<T>) => Result<T>
  <T, E extends Error, F extends Error>(
    self: Result<T>,
    f: (e: E) => F,
  ): Result<T>
} = dual(
  2,
  <T>(
    self: Result<T>,
    f: <E extends Error, F extends Error>(e: E) => F,
  ): Result<T> => self instanceof Error ? f(self) : ok(self.val),
)

/**
 * Maps over both parts of a Result simultaneously using two functions.
 * If the Result is Error, applies the first function; if Ok, applies the second function.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.bimap(Result.ok(1),
 *   (e: Error) => new Error(e.message.toUpperCase()),
 *   (n: number) => n + 1
 * )).toEqual(Result.ok(2))
 *
 * expect(Result.bimap(new Error("error"),
 *   (e: Error) => new Error(e.message.toUpperCase()),
 *   (n: number) => n + 1
 * )).toEqual(new Error("ERROR"))
 *
 * expect(
 *  pipe(
 *    Result.ok(1),
 *    Result.bimap(
 *      (e: Error) => new Error(e.message.toUpperCase()),
 *      (n: number) => n + 1
 *    )
 *  )
 * ).toEqual(Result.ok(2))
 * ```
 */
export const bimap: {
  <T, U>(
    f: (e: Error) => Error,
    g: (a: T) => U,
  ): (self: Result<T>) => Result<U>
  <T, U>(
    self: Result<T>,
    f: (e: Error) => Error,
    g: (a: T) => U,
  ): Result<U>
} = dual(
  3,
  <T, U>(
    self: Result<T>,
    f: (e: Error) => Error,
    g: (a: T) => U,
  ): Result<U> => self instanceof Error ? f(self) : ok(g(self.val)),
)
/**
 * `flatMap` allows you to chain operations that return Results. It applies a function to the success value
 * and flattens the resulting Result. If the input is an Error, it remains unchanged.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * type User = {
 *   readonly id: number
 *   readonly address: Result.Result<string>
 * }
 *
 * const user: User = {
 *   id: 1,
 *   address: Result.ok("123 Main St")
 * }
 *
 * const validateAddress = (address: string): Result.Result<string> =>
 *   address.length > 0 ? Result.ok(address) : new Error("Invalid address")
 *
 * const result = pipe(
 *   user.address,
 *   Result.flatMap(validateAddress)
 * )
 *
 * expect(result).toEqual(Result.ok("123 Main St"))
 * ```
 */
export const flatMap: {
  <T, U>(f: (a: T) => Result<U>): (self: Result<T>) => Result<U>
  <T, U>(self: Result<T>, f: (a: T) => Result<U>): Result<U>
} = dual(
  2,
  <T, U>(self: Result<T>, f: (a: T) => Result<U>): Result<U> =>
    self instanceof Error ? self : f(self.val),
)

/**
 * `flatMapError` allows you to chain operations on Error values. It applies a function to the error value
 * and flattens the resulting Result. If the input is Ok, it remains unchanged.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * const handleError = (e: Error): Result.Result<number> =>
 *   e.message === "minor" ? Result.ok(0) : new Error("major")
 *
 * expect(Result.flatMapError(new Error("minor"), handleError))
 *   .toEqual(Result.ok(0))
 *
 * expect(Result.flatMapError(Result.ok(1), handleError))
 *   .toEqual(Result.ok(1))
 * ```
 */
export const flatMapError: {
  <T>(f: (e: Error) => Result<T>): (self: Result<T>) => Result<T>
  <T>(self: Result<T>, f: (e: Error) => Result<T>): Result<T>
} = dual(
  2,
  <T>(self: Result<T>, f: (e: Error) => Result<T>): Result<T> =>
    self instanceof Error ? f(self) : ok(self.val),
)

/**
 * Matches a Result against two functions: one for the Error case and one for the Ok case.
 * This is useful for handling both cases in a single expression.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Result.match(Result.ok(42),
 *   e => `Error: ${e.message}`,
 *   val => `The value is ${val}.`
 * )).toEqual("The value is 42.")
 *
 * expect(Result.match(new Error("error"),
 *   e => `Error: ${e.message}`,
 *   val => `The value is ${val}.`
 * )).toEqual("Error: error")
 * ```
 */
export const match: {
  <T, B>(onError: (e: Error) => B, onOk: (r: T) => B): (self: Result<T>) => B
  <T, B>(self: Result<T>, onError: (e: Error) => B, onOk: (r: T) => B): B
} = dual(
  3,
  (self, onError, onOk) =>
    self instanceof Error ? onError(self) : onOk(self.val),
)

/**
 * Returns the value inside an Ok, or the result of onError if the Result is an Error.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Result.getOrElse(Result.ok(1), () => 0)).toEqual(1)
 * expect(Result.getOrElse(new Error("error"), () => 0)).toEqual(0)
 * ```
 */
export const getOrElse: {
  <T, B>(onError: (e: Error) => B): (self: Result<T>) => T | B
  <T, B>(self: Result<T>, onError: (e: Error) => B): T | B
} = dual(
  2,
  <T, B>(self: Result<T>, onError: (e: Error) => B): T | B =>
    self instanceof Error ? onError(self) : self.val,
)

/**
 * Checks if a Result is an Ok value.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.isOk(Result.ok(1))).toEqual(true)
 * expect(Result.isOk(new Error("error"))).toEqual(false)
 * ```
 */
export function isOk<T>(self: Result<T>): self is Ok<T> {
  return !isError(self)
}

/**
 * Checks if a Result is an Error value.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.isError(Result.ok(1))).toEqual(false)
 * expect(Result.isError(new Error("error"))).toEqual(true)
 * ```
 */
export function isError(self: unknown): self is Error {
  return self instanceof Error
}

/**
 * Converts an Option to a Result. If the Option is Some, it returns Ok with the contained value;
 * if it is None, it returns the provided Error.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, Option } from "@jvlk/fp-tsm"
 *
 * expect(Result.fromOption(Option.some(1), () => new Error("error"))).toEqual(Result.ok(1))
 * expect(Result.fromOption(Option.none, () => new Error("error"))).toEqual(new Error("error"))
 * ```
 */
export function fromOption<T>(
  self: Option<T>,
  onNone: () => Error,
): Result<T> {
  return self._tag === "Some" ? ok(self.value) : onNone()
}

/**
 * Converts an Either to a Result. If the Either is Right, it returns Ok with the contained value;
 * if it is Left, it converts the left value to an Error.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, Either } from "@jvlk/fp-tsm"
 *
 * expect(Result.fromEither(Either.right(1))).toEqual(Result.ok(1))
 * expect(Result.fromEither(Either.left("error"))).toEqual(new Error("error"))
 * ```
 */
export function fromEither<E, A>(self: Either<E, A>): Result<A> {
  return self._tag === "Right"
    ? ok(self.right)
    : self.left instanceof Error
    ? self.left
    : new Error(String(self.left))
}
