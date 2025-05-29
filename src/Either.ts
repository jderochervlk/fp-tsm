import { dual } from "./internal.ts"
import type { Option } from "./Option.ts"

/**
 * The `Either` type represents values that can be one of two types: a `Left` containing an error value, or a `Right` containing a success value.
 *
 * It is commonly used for error handling and expressing computations that may fail. Instead of throwing exceptions, functions can return an `Either`
 * that explicitly represents both success and failure cases.
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
 * @example Using `Either` makes error handling explicit and composable. The error cases are handled through the type system rather than exceptions.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either, pipe } from "@jvlk/fp-tsm"
 *
 * const divide = (a: number, b: number): Either.Either<string, number> =>
 *   b === 0 ? Either.left("Division by zero") : Either.right(a / b)
 *
 * const increment = (a: Either.Either<string, number>): Either.Either<string, number> =>
 *   pipe(
 *     a,
 *     Either.map(x => x + 1)
 *   )
 *
 * expect(increment(divide(6, 2))).toEqual(Either.right(4))
 * expect(increment(divide(6, 0))).toEqual(Either.left("Division by zero"))
 * ```
 *
 * @module
 */
export type Either<L, R> = Left<L> | Right<R>

/**
 * The `Left` type represents the failure case of an `Either`, containing a value of type `L`.
 */
type Left<L> = {
  readonly _tag: "Left"
  readonly left: L
}

/**
 * The `Right` type represents the success case of an `Either`, containing a value of type `R`.
 */
type Right<R> = {
  readonly _tag: "Right"
  readonly right: R
}

// Generators

/**
 * Constructs a `Right`. Represents a successful value in an Either.
 *
 * @category Creating Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // when creating an Either using `left` or `right` you should provide the type parameters
 * expect(Either.right<string, number>(1)).toEqual({ _tag: "Right", right: 1 })
 * expect(Either.right<string, string>("hello")).toEqual({ _tag: "Right", right: "hello" })
 * ```
 */
export const right = <L, R>(r: R): Either<L, R> => ({ _tag: "Right", right: r })

/**
 * Constructs a `Left`. Represents a failure value in an Either.
 *
 * @category Creating Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // when creating an Either using `left` or `right` you should provide the type parameters
 * expect(Either.left<string, string>("error")).toEqual({ _tag: "Left", left: "error" })
 * expect(Either.left<number, number>(404)).toEqual({ _tag: "Left", left: 404 })
 * ```
 */
export const left = <L, R>(l: L): Either<L, R> => ({ _tag: "Left", left: l })

/**
 * `tryCatch` is a utility function that allows you to execute a function that may throw an `unknown` error and return an `Either`.
 *
 * It can take an optional second argument, `catchFn`, which is a function that transforms the `unknown` error into something else.
 *
 * @category Creating Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * expect(Either.tryCatch(() => 1)).toEqual(Either.right(1))
 *
 * expect(Either.tryCatch(() => { throw new Error("Error") }))
 *   .toEqual(Either.left(Error("Error")))
 *
 * expect(Either.tryCatch(() => { throw new Error("something went wrong") }, (e) => `Caught: ${e}`)).toEqual(Either.left("Caught: Error: something went wrong"))
 * ```
 */

export function tryCatch<L, R>(
  fn: () => R,
  catchFn: (e: unknown) => L,
): Either<L, R>
export function tryCatch<R>(fn: () => R): Either<unknown, R>
export function tryCatch<L, R>(
  fn: () => R,
  catchFn?: (e: unknown) => L,
) {
  try {
    return right(fn())
  } catch (e) {
    return catchFn ? left(catchFn(e)) : left(e)
  }
}

/**
 * You can create an `Either` based on a predicate, for example, to check if a value is positive.
 *
 * @category Creating Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * const isPositive = Either.fromPredicate(
 *   (n: number): n is number => n >= 0,
 *   () => "Number must be positive"
 * )
 *
 * expect(isPositive(-1)).toEqual(Either.left("Number must be positive"))
 * expect(isPositive(1)).toEqual(Either.right(1))
 * ```
 */
export const fromPredicate: {
  <L, R>(
    predicate: (a: any) => a is R,
    failure: () => L,
  ): (a: any) => Either<L, R>
  <L, R>(a: any, predicate: (a: any) => a is R, failure: () => L): Either<L, R>
} = dual(3, <L, R>(a: any, predicate: (a: any) => a is R, failure: () => L) => {
  return predicate(a) ? right(a) : left(failure())
})

// working with Eithers
/**
 * The `Either.map` function lets you transform the value inside an `Either` without manually unwrapping and re-wrapping it.
 * If the `Either` holds a right value (`Right`), the transformation function is applied.
 * If the `Either` is `Left`, the function is ignored, and the `Left` value remains unchanged.
 *
 * @category Working with Eithers
 * @example Mapping a Value in Right
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // Transform the value inside Right
 * expect(Either.map(Either.right<string, number>(1), (n: number) => n + 1)).toEqual(Either.right(2))
 * ```
 *
 * @example Mapping over Left
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // Mapping over Left results in the same Left
 * expect(Either.map(Either.left<string, number>("error"), (n: number) => n + 1)).toEqual(Either.left("error"))
 * ```
 */
export const map: {
  <L, RA, RB>(
    f: (a: RA) => RB,
  ): (self: Either<L, RA>) => Either<L, RB>
  <L, RA, RB>(self: Either<L, RA>, f: (a: RA) => RB): Either<L, RB>
} = dual(
  2,
  <L, RA, RB>(
    self: Either<L, RA>,
    f: (a: RA) => RB,
  ): Either<L, RB> =>
    self._tag === "Right" ? right(f(self.right)) : left(self.left),
)

/**
 * The `Either.mapLeft` function lets you transform the error value inside an `Either` without manually unwrapping and re-wrapping it.
 * If the `Either` holds a left value (`Left`), the transformation function is applied.
 * If the `Either` is `Right`, the function is ignored, and the `Right` value remains unchanged.
 *
 * @category Working with Eithers
 * @example Mapping an Error Value in Left
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // Transform the error value inside Left
 * expect(Either.mapLeft(Either.left<string, number>("error"), (s: string) => s.toUpperCase()))
 *   .toEqual(Either.left("ERROR"))
 * ```
 *
 * @example Mapping Left over Right
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * // Mapping Left over Right results in the same Right
 * expect(Either.mapLeft(Either.right<string, number>(1), (s: string) => s.toUpperCase()))
 *   .toEqual(Either.right(1))
 * ```
 */
export const mapLeft: {
  <LA, LB, R>(
    f: (a: LA) => LB,
  ): (self: Either<LA, R>) => Either<LB, R>
  <LA, LB, R>(self: Either<LA, R>, f: (a: LA) => LB): Either<LB, R>
} = dual(
  2,
  <LA, LB, R>(
    self: Either<LA, R>,
    f: (a: LA) => LB,
  ): Either<LB, R> =>
    self._tag === "Left" ? left(f(self.left)) : right(self.right),
)

/**
 * Maps over both parts of an Either simultaneously using two functions.
 * If the Either is Left, applies the first function; if Right, applies the second function.
 *
 * @category Working with Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * expect(Either.bimap(Either.right<string, number>(1),
 *   (e: string) => e.toUpperCase(),
 *   (n: number) => n + 1
 * )).toEqual(Either.right(2))
 *
 * expect(Either.bimap(Either.left<string, number>("error"),
 *   (e: string) => e.toUpperCase(),
 *   (n: number) => n + 1
 * )).toEqual(Either.left("ERROR"))
 *
 * expect(
 *  pipe(
 *    Either.right<string, number>(1),
 *    Either.bimap(
 *      (e: string) => e.toUpperCase(),
 *      (n: number) => n + 1
 *    )
 *  )
 * ).toEqual(Either.right(2))
 * ```
 */
export const bimap: {
  <LA, LB, RA, RB>(
    f: (l: LA) => LB,
    g: (r: RA) => RB,
  ): (self: Either<LA, RA>) => Either<LB, RB>
  <LA, LB, RA, RB>(
    self: Either<LA, RA>,
    f: (l: LA) => LB,
    g: (r: RA) => RB,
  ): Either<LB, RB>
} = dual(
  3,
  <LA, LB, RA, RB>(
    self: Either<LA, RA>,
    f: (l: LA) => LB,
    g: (r: RA) => RB,
  ): Either<LB, RB> =>
    self._tag === "Left" ? left(f(self.left)) : right(g(self.right)),
)

/**
 * Applies a function to the value of a `Right` and flattens the resulting
 * `Either`. If the input is `Left`, it remains `Left`.
 *
 * This function allows you to chain computations that return `Either` values.
 * If the input `Either` is `Right`, the provided function `f` is applied to the
 * contained value, and the resulting `Either` is returned. If the input is
 * `Left`, the function is not applied, and the result remains `Left`.
 *
 * This utility is particularly useful for sequencing operations that may fail,
 * enabling clean and concise workflows for handling error cases.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either, pipe } from "@jvlk/fp-tsm"
 *
 * type Error = string
 * type User = {
 *   readonly id: number
 *   readonly address: Either.Either<Error, string>
 * }
 *
 * const user: User = {
 *   id: 1,
 *   address: Either.right("123 Main St")
 * }
 *
 * const validateAddress = (address: string): Either.Either<Error, string> =>
 *   address.length > 0 ? Either.right(address) : Either.left("Invalid address")
 *
 * const result = pipe(
 *   user.address,
 *   Either.flatMap(validateAddress)
 * )
 *
 * expect(result).toEqual(Either.right("123 Main St"))
 * ```
 * @category Working with Eithers
 */
export const flatMap: {
  <L, RA, RB>(
    f: (a: RA) => Either<L, RB>,
  ): (self: Either<L, RA>) => Either<L, RB>
  <L, RA, RB>(self: Either<L, RA>, f: (a: RA) => Either<L, RB>): Either<L, RB>
} = dual(
  2,
  <L, RA, RB>(
    self: Either<L, RA>,
    f: (a: RA) => Either<L, RB>,
  ): Either<L, RB> => self._tag === "Right" ? f(self.right) : left(self.left),
)

/**
 * Applies a function to the value of a `Left` and flattens the resulting
 * `Either`. If the input is `Right`, it remains `Right`.
 *
 * This function is the left-sided equivalent of `flatMap`. It allows you to chain
 * computations on the `Left` value while preserving any `Right` value unchanged.
 *
 * @example
 * ```ts
 * import { Either, pipe } from "@jvlk/fp-tsm"
 *
 * const result = pipe(
 *   Either.left("error"),
 *   Either.flatMapLeft(error => Either.left(error.toUpperCase()))
 * )
 * // Result: Either.left("ERROR")
 * ```
 * @category Working with Eithers
 */
export const flatMapLeft: {
  <LA, LB, R>(
    f: (a: LA) => Either<LB, R>,
  ): (self: Either<LA, R>) => Either<LB, R>
  <LA, LB, R>(self: Either<LA, R>, f: (a: LA) => Either<LB, R>): Either<LB, R>
} = dual(
  2,
  <LA, LB, R>(
    self: Either<LA, R>,
    f: (a: LA) => Either<LB, R>,
  ): Either<LB, R> => self._tag === "Left" ? f(self.left) : right(self.right),
)

/**
 * Matches an `Either` against two functions: one for the `Left` case and one for the `Right` case.
 * This is useful for handling both cases in a single expression without needing to check the `_tag` manually.
 *
 * @category Working with Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Either.match(Either.right(42), e => `Error: ${e}`, val => `The value is ${val}.`)).toEqual("The value is 42.")
 * expect(Either.match(Either.left("error"), e => `Error: ${e}`, val => `The value is ${val}.`)).toEqual("Error: error")
 *
 * expect(
 *  pipe(
 *    Either.right(42),
 *    Either.match(
 *      e => `Error: ${e}`,
 *      val => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("The value is 42.")
 *
 * expect(
 *  pipe(
 *    Either.left("error"),
 *    Either.match(
 *      e => `Error: ${e}`,
 *      val => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("Error: error")
 * ```
 */
export const match: {
  <L, R, B>(
    onLeft: (l: L) => B,
    onRight: (r: R) => B,
  ): (self: Either<L, R>) => B
  <L, R, B>(self: Either<L, R>, onLeft: (l: L) => B, onRight: (r: R) => B): B
} = dual(3, (self, onLeft, onRight) => {
  if (self._tag === "Right") {
    return onRight(self.right)
  }
  return onLeft(self.left)
})

/**
 * Returns the value inside a `Right`, or the result of `onLeft` if the `Either` is a `Left`.
 *
 * @category Working with Eithers
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Either.getOrElse(Either.right(1), () => 0)).toEqual(1)
 * expect(Either.getOrElse(Either.left("error"), () => 0)).toEqual(0)
 *
 * expect(
 *  pipe(
 *    Either.right(42),
 *    Either.getOrElse(() => 10),
 *  )
 * ).toEqual(42)
 *
 * expect(
 *  pipe(
 *    Either.left("error"),
 *    Either.getOrElse(() => 10),
 *  )
 * ).toEqual(10)
 *
 * ```
 */
export const getOrElse: {
  <L, R, B>(onLeft: (l: L) => B): (self: Either<L, R>) => R | B
  <L, R, B>(self: Either<L, R>, onLeft: (l: L) => B): R | B
} = dual(2, <L, R, B>(
  self: Either<L, R>,
  onLeft: (l: L) => B,
): R | B => self._tag === "Right" ? self.right : onLeft(self.left))

// Typeguards

/**
 * Checks if an `Either` is a `Right` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Either` to `Right<R>` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * expect(Either.isRight(Either.right(1))).toEqual(true)
 * expect(Either.isRight(Either.left("error"))).toEqual(false)
 * ```
 */
export function isRight<L, R>(self: Either<L, R>): self is Right<R> {
  return self._tag === "Right"
}

/**
 * Checks if an `Either` is a `Left` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Either` to `Left<L>` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either } from "@jvlk/fp-tsm"
 *
 * expect(Either.isLeft(Either.right(1))).toEqual(false)
 * expect(Either.isLeft(Either.left("error"))).toEqual(true)
 * ```
 */
export function isLeft<L, R>(self: Either<L, R>): self is Left<L> {
  return self._tag === "Left"
}

/**
 * Converts an `Option` to an `Either`. If the `Option` is `Some`, it returns `Right` with the contained value; if it is `None`, it returns `Left` with the provided error value.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Either, Option } from "@jvlk/fp-tsm"
 *
 * expect(Either.fromOption(Option.some(1), () => "error")).toEqual(Either.right(1))
 * expect(Either.fromOption(Option.none, () => "error")).toEqual(Either.left("error"))
 * ```
 */
export function fromOption<L, R>(
  self: Option<R>,
  onNone: () => L,
): Either<L, R> {
  return self._tag === "Some" ? right(self.value) : left(onNone())
}
