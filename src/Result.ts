// deno-lint-ignore-file no-explicit-any
import { dual } from "./internal.ts"
import type { Option } from "./Option.ts"

/**
 * `Result` can replace exception flows.
 *
 * Instead of throwing exceptions, functions can return a `Result` that explicitly represents both success and failure cases.
 *
 * Throwing exceptions complicates control flow and hides exceptions from the type system, making it harder to reason about error handling in your code.
 *
 * @example Which of these is a more helpful type?
 * ```ts
 * import { Result } from '@jvlk/fp-tsm'
 *
 * // This is the correct type :(
 * const toCaps = (str: string): string => {
 *   if(typeof str !== "string") {
 *      throw new Error("This is not a string!")
 *   } else {
 *     return str.toUpperCase()
 *   }
 * }
 *
 * const toCaps = (str: string): Result<string, InvalidStringError> => {
 *   if(typeof str !== "string") {
 *      return Result.error(InvalidStringError("This is not a string!"))
 *   } else {
 *     return Result.ok(str.toUpperCase())
 *   }
 * }
 * ```
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
 * const divide = (a: number, b: number): Result.Result<number, string> =>
 *   b === 0 ? Result.error("Division by zero") : Result.ok(a / b)
 *
 * const increment = (a: Result.Result<number, string>): Result.Result<number, string> =>
 *   pipe(
 *     a,
 *     Result.map(x => x + 1)
 *   )
 *
 * expect(increment(divide(6, 2))).toEqual(Result.ok(4))
 * expect(increment(divide(6, 0))).toEqual(Result.error("Division by zero"))
 * ```
 *
 * @module
 */
export type Result<OK, ERROR = unknown> = Ok<OK> | Err<ERROR>

/**
 * The `Err` type represents the failure case of a `Result`, containing a value of type `ERROR`.
 * @ignore
 */
export type Err<ERROR = unknown> = {
  readonly _tag: "Error"
  readonly error: ERROR
}

/**
 * The `Ok` type represents the success case of a `Result`, containing a value of type `OK`.
 * @ignore
 */
export type Ok<OK> = {
  readonly _tag: "Ok"
  readonly ok: OK
}

// Generators

/**
 * Constructs a `Ok`. Represents a successful value in a Result.
 *
 * @category Creating Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // when creating a Result using `Err` or `Ok` you should provide the type parameters
 * expect(Result.ok(1)).toEqual({ _tag: "Ok", ok: 1 })
 * expect(Result.ok("hello")).toEqual({ _tag: "Ok", ok: "hello" })
 * ```
 */
export const ok = <OK>(r: OK): Ok<OK> => ({ _tag: "Ok", ok: r })

/**
 * Constructs a `Err`. Represents a failure value in a Result.
 *
 * @category Creating Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // when creating a Result using `Err` or `Ok` you should provide the type parameters
 * expect(Result.error("error")).toEqual({ _tag: "Error", error: "error" })
 * expect(Result.error(404)).toEqual({ _tag: "Error", error: 404 })
 * ```
 */
export const error = <ERROR>(l: ERROR): Err<ERROR> => ({ _tag: "Error", error: l })

/**
 * `tryCatch` is a utility function that allows you to execute a function that may throw an `unknown` error and return a `Result`.
 *
 * It can take an optional second argument, `catchFn`, which is a function that transforms the `unknown` error into something else.
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
 *   .toEqual(Result.error(Error("Error")))
 *
 * expect(Result.tryCatch(() => { throw new Error("something went wrong") }, (e) => `Caught: ${e}`)).toEqual(Result.error("Caught: Error: something went wrong"))
 * ```
 */

export function tryCatch<OK, ERROR>(
  fn: () => OK,
  catchFn: (e: unknown) => ERROR,
): Result<OK, ERROR>
export function tryCatch<OK>(fn: () => OK): Result<unknown, OK>
export function tryCatch<OK, ERROR>(
  fn: () => OK,
  catchFn?: (e: unknown) => ERROR,
) {
  try {
    return ok(fn())
  } catch (e) {
    return catchFn ? error(catchFn(e)) : error(e)
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
 *   (n: number): n is number => n >= 0,
 *   () => "Number must be positive"
 * )
 *
 * expect(isPositive(-1)).toEqual(Result.error("Number must be positive"))
 * expect(isPositive(1)).toEqual(Result.ok(1))
 * ```
 */
export const fromPredicate: {
  <OK, ERROR>(
    predicate: (a: any) => a is OK,
    failure: () => ERROR,
  ): (a: any) => Result<OK, ERROR>
  <OK, ERROR>(a: any, predicate: (a: any) => a is OK, failure: () => ERROR): Result<OK, ERROR>
} = dual(3, <OK, ERROR>(a: any, predicate: (a: any) => a is OK, failure: () => ERROR) => {
  return predicate(a) ? ok(a) : error(failure())
})

// working with Results
/**
 * The `Result.map` function lets you transform the value inside a `Result` without manually unwrapping and re-wrapping it.
 * If the `Result` holds a ok value (`Ok`), the transformation function is applied.
 * If the `Result` is `Err`, the function is ignored, and the `Err` value remains unchanged.
 *
 * @category Working with Results
 * @example Mapping a Value in Ok
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Transform the value inside Ok
 * expect(Result.map(Result.ok(1), (n: number) => n + 1)).toEqual(Result.ok(2))
 * ```
 *
 * @example Mapping over Err
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Mapping over Err results in the same Err
 * expect(Result.map(Result.error("error"), (n: number) => n + 1)).toEqual(Result.error("error"))
 * ```
 */
export const map: {
  <OK1, OK2 = OK1, ERROR = unknown>(
    f: (a: OK1) => OK2,
  ): (self: Result<OK1, ERROR>) => Result<OK2, ERROR>
  <OK1, OK2 = OK1, ERROR = unknown>(
    self: Result<OK1, ERROR>,
    f: (a: OK1) => OK2,
  ): Result<OK2, ERROR>
} = dual(
  2,
  <OK1, OK2 = OK1, ERROR = unknown>(
    self: Result<OK1, ERROR>,
    f: (a: OK1) => OK2,
  ): Result<OK2, ERROR> => self._tag === "Ok" ? ok(f(self.ok)) : error(self.error),
)

/**
 * The `Result.mapErr` function lets you transform the error value inside a `Result` without manually unwrapping and re-wrapping it.
 * If the `Result` holds a error value (`Err`), the transformation function is applied.
 * If the `Result` is `Ok`, the function is ignored, and the `Ok` value remains unchanged.
 *
 * @category Working with Results
 * @example Mapping an Error Value in Err
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Transform the error value inside Err
 * expect(Result.mapErr(Result.error("error"), (s: string) => s.toUpperCase()))
 *   .toEqual(Result.error("ERROR"))
 * ```
 *
 * @example Mapping Err over Ok
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * // Mapping Err over Ok results in the same Ok
 * expect(Result.mapErr(Result.ok(1), (s: string) => s.toUpperCase()))
 *   .toEqual(Result.ok(1))
 * ```
 */
export const mapErr: {
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    f: (a: ERROR1) => ERROR2,
  ): (self: Result<OK, ERROR1>) => Result<OK, ERROR2>
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK, ERROR1>,
    f: (a: ERROR1) => ERROR2,
  ): Result<OK, ERROR2>
} = dual(
  2,
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK, ERROR1>,
    f: (a: ERROR1) => ERROR2,
  ): Result<OK, ERROR2> => self._tag === "Error" ? error(f(self.error)) : ok(self.ok),
)

/**
 * Maps over both parts of a Result simultaneously using two functions.
 * If the Result is Err, applies the first function; if Ok, applies the second function.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Result.bimap(Result.ok(1),
 *   (e: string) => e.toUpperCase(),
 *   (n: number) => n + 1
 * )).toEqual(Result.ok(2))
 *
 * expect(Result.bimap(Result.error("error"),
 *   (e: string) => e.toUpperCase(),
 *   (n: number) => n + 1
 * )).toEqual(Result.error("ERROR"))
 *
 * expect(
 *  pipe(
 *    Result.ok(1),
 *    Result.bimap(
 *      (e: string) => e.toUpperCase(),
 *      (n: number) => n + 1
 *    )
 *  )
 * ).toEqual(Result.ok(2))
 * ```
 */
export const bimap: {
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    f: (l: ERROR1) => ERROR2,
    g: (r: OK1) => OK2,
  ): (self: Result<OK1, ERROR1>) => Result<OK2, ERROR2>
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK1, ERROR1>,
    f: (l: ERROR1) => ERROR2,
    g: (r: OK1) => OK2,
  ): Result<OK2, ERROR2>
} = dual(
  3,
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK1, ERROR1>,
    f: (l: ERROR1) => ERROR2,
    g: (r: OK1) => OK2,
  ): Result<OK2, ERROR2> => self._tag === "Error" ? error(f(self.error)) : ok(g(self.ok)),
)

/**
 * Applies a function to the value of a `Ok` and flattens the resulting
 * `Result`. If the input is `Err`, it remains `Err`.
 *
 * This function allows you to chain computations that return `Result` values.
 * If the input `Result` is `Ok`, the provided function `f` is applied to the
 * contained value, and the resulting `Result` is returned. If the input is
 * `Err`, the function is not applied, and the result remains `Err`.
 *
 * This utility is particularly useful for sequencing operations that may fail,
 * enabling clean and concise workflows for handling error cases.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * type Error = string
 * type User = {
 *   readonly id: number
 *   readonly address: Result.Result<Error, string>
 * }
 *
 * const user: User = {
 *   id: 1,
 *   address: Result.ok("123 Main St")
 * }
 *
 * const validateAddress = (address: string): Result.Result<Error, string> =>
 *   address.length > 0 ? Result.ok(address) : Result.error("Invalid address")
 *
 * const result = pipe(
 *   user.address,
 *   Result.flatMap(validateAddress)
 * )
 *
 * expect(result).toEqual(Result.ok("123 Main St"))
 * ```
 * @category Working with Results
 */
export const flatMap: {
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    f: (a: OK1) => Result<OK2, ERROR2>,
  ): (self: Result<OK1, ERROR1>) => Result<OK2, ERROR1 | ERROR2>
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK1, ERROR1>,
    f: (a: OK1) => Result<OK2, ERROR2>,
  ): Result<OK2, ERROR1 | ERROR2>
} = dual(
  2,
  <OK1, OK2 = OK1, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK1, ERROR1>,
    f: (a: OK1) => Result<OK2, ERROR2 | ERROR1>,
  ): Result<OK2, ERROR1 | ERROR2> => self._tag === "Ok" ? f(self.ok) : self,
)

/**
 * Applies a function to the value of a `Err` and flattens the resulting
 * `Result`. If the input is `Ok`, it remains `Ok`.
 *
 * This function is the error-sided equivalent of `flatMap`. It allows you to chain
 * computations on the `Err` value while preserving any `Ok` value unchanged.
 *
 * @example
 * ```ts
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * const result = pipe(
 *   Result.error("error"),
 *   Result.flatMapErr(error => Result.error(error.toUpperCase()))
 * )
 * // Result: Result.error("ERROR")
 * ```
 * @category Working with Results
 */
export const flatMapErr: {
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    f: (a: ERROR1) => Result<OK, ERROR2>,
  ): (self: Result<OK, ERROR1>) => Result<OK, ERROR2>
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK, ERROR1>,
    f: (a: ERROR1) => Result<OK, ERROR2>,
  ): Result<OK, ERROR2>
} = dual(
  2,
  <OK, ERROR1 = unknown, ERROR2 = ERROR1>(
    self: Result<OK, ERROR1>,
    f: (a: ERROR1) => Result<OK, ERROR2>,
  ): Result<OK, ERROR2> => self._tag === "Error" ? f(self.error) : ok(self.ok),
)

/**
 * Matches a `Result` against two functions: one for the `Err` case and one for the `Ok` case.
 * This is useful for handling both cases in a single expression without needing to check the `_tag` manually.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Result.match(Result.ok(42), e => `Error: ${e}`, val => `The value is ${val}.`)).toEqual("The value is 42.")
 * expect(Result.match(Result.error("error"), e => `Error: ${e}`, val => `The value is ${val}.`)).toEqual("Error: error")
 *
 * expect(
 *  pipe(
 *    Result.ok(42),
 *    Result.match(
 *      e => `Error: ${e}`,
 *      val => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("The value is 42.")
 *
 * expect(
 *  pipe(
 *    Result.error("error"),
 *    Result.match(
 *      e => `Error: ${e}`,
 *      val => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("Error: error")
 * ```
 */
export const match: {
  <OK, T, ERROR = unknown>(
    onErr: (l: ERROR) => T,
    onOk: (r: OK) => T,
  ): (self: Result<OK, ERROR>) => T
  <OK, T, ERROR = unknown>(self: Result<OK, ERROR>, onErr: (l: ERROR) => T, onOk: (r: OK) => T): T
} = dual(3, (self, onErr, onOk) => {
  if (self._tag === "Ok") {
    return onOk(self.ok)
  }
  return onErr(self.error)
})

/**
 * Returns the value inside a `Ok`, or the result of `onErr` if the `Result` is a `Err`.
 *
 * @category Working with Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Result.getOrElse(Result.ok(1), () => 0)).toEqual(1)
 * expect(Result.getOrElse(Result.error("error"), () => 0)).toEqual(0)
 *
 * expect(
 *  pipe(
 *    Result.ok(42),
 *    Result.getOrElse(() => 10),
 *  )
 * ).toEqual(42)
 *
 * expect(
 *  pipe(
 *    Result.error("error"),
 *    Result.getOrElse(() => 10),
 *  )
 * ).toEqual(10)
 *
 * ```
 */
export const getOrElse: {
  <OK, ERROR>(onErr: (l: ERROR) => OK): (self: Result<OK, ERROR>) => OK
  <OK, ERROR>(self: Result<OK, ERROR>, onErr: (l: ERROR) => OK): OK
} = dual(2, <OK, ERROR>(
  self: Result<OK, ERROR>,
  onErr: (l: ERROR) => OK,
): OK => self._tag === "Ok" ? self.ok : onErr(self.error))

// Typeguards

/**
 * Checks if a `Result` is a `Ok` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Result` to `Ok<OK>` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.isOk(Result.ok(1))).toEqual(true)
 * expect(Result.isOk(Result.error("error"))).toEqual(false)
 * ```
 */
export function isOk<OK, ERROR>(self: Result<OK, ERROR>): self is Ok<OK> {
  return self._tag === "Ok"
}

/**
 * Checks if a `Result` is a `Err` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Result` to `Err<ERROR>` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * expect(Result.isErr(Result.ok(1))).toEqual(false)
 * expect(Result.isErr(Result.error("error"))).toEqual(true)
 * ```
 */
export function isErr<OK, ERROR>(self: Result<OK, ERROR>): self is Err<ERROR> {
  return self._tag === "Error"
}

/**
 * Converts an `Option` to a `Result`. If the `Option` is `Some`, it returns `Ok` with the contained value; if it is `None`, it returns `Err` with the provided error value.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, Option } from "@jvlk/fp-tsm"
 *
 * expect(Result.fromOption(Option.some(1), () => "error")).toEqual(Result.ok(1))
 * expect(Result.fromOption(Option.none, () => "error")).toEqual(Result.error("error"))
 * ```
 */
export const fromOption: {
  <OK, ERROR = unknown>(
    self: Option<OK>,
    onNone: () => ERROR,
  ): Result<OK, ERROR>
  <OK, ERROR = unknown>(
    onNone: () => ERROR,
  ): (self: Option<OK>) => Result<OK, ERROR>
} = dual(2, <OK, ERROR = unknown>(
  self: Option<OK>,
  onNone: () => ERROR,
): Result<OK, ERROR> => {
  return self._tag === "Some" ? ok(self.value) : error(onNone())
})

// Multiple Results

/**
 * Do notation allows you to yield `Result` values and combine them in a sequential manner without having to manually check for `Err` at each step.
 *
 * The `yield*` operator is used to work with multiple `Result` values in a generator function. Each value must be yielded with `Result.bind()`.
 *
 * @category Working with multiple Results
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result } from "@jvlk/fp-tsm"
 *
 * const age = Result.ok(30)
 * const name = Result.ok("John")
 * const city = Result.ok("New York")
 *
 * const data = Result.Do(function* () {
 *   const personAge = yield* Result.bind(age)
 *   const personName = yield* Result.bind(name)
 *   const personCity = yield* Result.bind(city)
 *   return `Hello ${personName}! You are ${personAge} years old and live in ${personCity}.`
 * })
 *
 * expect(data).toEqual(Result.ok("Hello John! You are 30 years old and live in New York."))
 *
 * // If any Result is Err, the entire result is Err
 * const data2 = Result.Do(function* () {
 *   const personAge = yield* Result.bind(Result.error("Error"))
 *   const personName = yield* Result.bind(name)
 *   return `Hello ${personName}! You are ${personAge} years old.`
 * })
 *
 * expect(data2).toEqual(Result.error("Error"))
 * ```
 *
 * @example Without Do notation, the same code would be much more verbose.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Result, pipe } from "@jvlk/fp-tsm"
 *
 * const age = Result.ok(30)
 * const name = Result.ok("John")
 * const city = Result.ok("New York")
 *
 * const result = pipe(
 *   age,
 *   Result.flatMap(personAge =>
 *     pipe(
 *       name,
 *       Result.flatMap(personName =>
 *         pipe(
 *           city,
 *           Result.map(personCity =>
 *             `Hello ${personName}! You are ${personAge} years old and live in ${personCity}.`
 *           )
 *         )
 *       )
 *     )
 *   )
 * )
 *
 * expect(result).toEqual(Result.ok("Hello John! You are 30 years old and live in New York."))
 * ```
 */

export function Do<A, ERROR = unknown, U = any>(
  generator: () => Generator<Result<unknown, ERROR>, A, U>,
): Result<A, ERROR> {
  const iterator = generator()
  let result = iterator.next()

  while (!result.done) {
    if (result.value._tag === "Error") {
      return result.value
    }
    result = iterator.next(
      result.value.ok as U,
    )
  }
  return ok(result.value)
}

/**
 * Binds the value of a `Result` to a new key in an OK2ject, using a function that transforms the value.
 * Useful for when you want to work with multiple `Result`s and only do something if they are all `Ok`.
 *
 * @ignore
 * See {@link Do} for an example of how to use this.
 */
export function* bind<OK, ERROR = unknown>(
  self: Result<OK, ERROR>,
): Generator<Result<OK, ERROR>, OK, OK> {
  if (self._tag === "Error") {
    return yield self
  }
  return self.ok
}
