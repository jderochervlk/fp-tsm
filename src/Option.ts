import { dual } from "./internal.ts"
import { pipe } from "./utility.ts"

/**
 * The `Option` type represents optional values and is a replacement for using `null` or `undefined`.
 * An `Option<A>` can either be `Some<A>`, containing a value of type `A`, or `None`, representing the absence of a value.
 *
 * It can be useful to distinguish values between each other: you can represent `Some(None)` with options, whereas `undefined` or `null` replace the value they intend to make optional.
 *
 * @example Functions with null parameters can quickly become hard to manage and compose. The presences of `null` or `undefined` will quickly spread across your codebase and add complexity due to the need to check for them constantly.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 *
 * const add = (a: number | null | undefined, b: number | null | undefined): number | null => {
 *   if (!a || !b) {
 *     return null
 *   }
 *   return a + b
 * }
 *
 * const increment = (a: number | null | undefined): number | null => {
 *  if (a == null) {
 *    return null
 *  } else return a + 1
 * }
 *
 * expect(increment(add(1, 2))).toEqual(4)
 * expect(increment(add(undefined, 2))).toEqual(null)
 * expect(increment(add(null, 2))).toEqual(null)
 * ```
 *
 * @example Using `Option` allows you to avoid the need to check for `null` or `undefined` in your code. You can use the `Option` type to represent optional values and use pattern matching to handle them.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * const add = (a: Option.Option<number>, b: Option.Option<number>): Option.Option<number> =>
 *   Option.map2(a, b, (a, b) => a + b)
 *
 * const increment = (a: Option.Option<number>): Option.Option<number> =>
 *  pipe(
 *   a,
 *   Option.map(a => a + 1),
 *  )
 *
 * expect(increment(add(Option.of(1), Option.of(2)))).toEqual(Option.some(4))
 * expect(increment(add(Option.of<number>(undefined), Option.of(2)))).toEqual(Option.none)
 * expect(increment(add(Option.of<number>(null), Option.of(2)))).toEqual(Option.none)
 * ```
 *
 * @module
 */
export type Option<T> = Some<T> | None

/**
 * Represents a value of type `T` that is present.
 */
type Some<T> = {
  _tag: "Some"
  value: T
}

/**
 * Represents the absence of a value.
 */
type None = {
  _tag: "None"
}

// Generators

/**
 * This is the main way to create an `Option`. It's similar to doing `Array.of` to create a new array.
 *
 * Returns `None` if the value is `null` or `undefined`, otherwise wraps the value in a `Some`.
 *
 * @category Creating Options
 * @example Creating an option
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.of(undefined)).toEqual({ _tag: "None" })
 *
 * expect(Option.of(null)).toEqual({ _tag: "None" })
 *
 * expect(Option.of(1)).toEqual({ _tag: "Some", value: 1 })
 * ```
 */
export function of<T>(value: T | null | undefined): Option<T> {
  if (value == null) {
    return { _tag: "None" }
  }
  return { _tag: "Some", value }
}

/**
 * Constructs a `Some`. Represents an optional value that exists.
 * This value cannot be `null` or `undefined`.
 *
 * @category Creating Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.some(1)).toEqual({ _tag: "Some", value: 1 })
 * expect(Option.some("hello")).toEqual({ _tag: "Some", value: "hello" })
 * ```
 */
export function some<A>(a: NonNullable<A>): Option<A> {
  return { _tag: "Some", value: a }
}

/**
 * `None` doesn't have a constructor, instead you can use it directly as a value. Represents a missing value.
 *
 * @category Creating Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.none).toEqual({ _tag: "None" })
 * ```
 */
export const none: Option<never> = { _tag: "None" }

/**
 * You can create an `Option` based on a predicate, for example, to check if a value is positive.
 *
 * @category Creating Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * const isPositive = Option.fromPredicate((n: number) => n >= 0)
 *
 * expect(isPositive(-1)).toEqual(Option.none)
 * expect(isPositive(1)).toEqual(Option.some(1))
 * ```
 */
export function fromPredicate<A>(
  predicate: (a: A) => boolean,
): (a: A) => Option<A> {
  return (a) => (predicate(a) ? of(a) : none)
}

// TODO: lookup - this is the same as R.lookup - It makes more sense to use here
// TODO: tryCatch - this should take in an optional parameter for logging

// Working with Options

/**
 * The `Option.map` function lets you transform the value inside an `Option` without manually unwrapping and re-wrapping it.
 * If the `Option` holds a value (`Some`), the transformation function is applied.
 * If the `Option` is `None`, the function is ignored, and the `Option` remains unchanged.
 *
 * @category Working with Options
 * @example Mapping a Value in Some.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * // Transform the value inside Some
 * expect(Option.map(Option.some(1), (n: number) => n + 1)).toEqual(Option.some(2))
 * ```
 *
 * @example Mapping over None.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * // Mapping over None results in None
 * expect(Option.map(Option.none, (n: number) => n + 1)).toEqual(Option.none)
 * ```
 */
export const map: {
  <A, B>(
    f: (a: A) => B,
  ): (self: Option<A>) => Option<B>
  <A, B>(self: Option<A>, f: (a: A) => B): Option<B>
} = dual(
  2,
  <A, B extends NonNullable<C>, C>(
    self: Option<A>,
    f: (a: A) => B,
  ): Option<B> => self._tag === "Some" ? some(f(self.value)) : none,
)

/**
 * Applies a function to the value of a `Some` and flattens the resulting
 * `Option`. If the input is `None`, it remains `None`.
 *
 * **Details**
 *
 * This function allows you to chain computations that return `Option` values.
 * If the input `Option` is `Some`, the provided function `f` is applied to the
 * contained value, and the resulting `Option` is returned. If the input is
 * `None`, the function is not applied, and the result remains `None`.
 *
 * This utility is particularly useful for sequencing operations that may fail
 * or produce optional results, enabling clean and concise workflows for
 * handling such cases.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * type Address = {
 *   readonly city: string
 *   readonly street: Option.Option<string>
 * }
 *
 * type User = {
 *   readonly id: number
 *   readonly username: string
 *   readonly email: Option.Option<string>
 *   readonly address: Option.Option<Address>
 * }
 *
 * const user: User = {
 *   id: 1,
 *   username: "john_doe",
 *   email: Option.some("john.doe@example.com"),
 *   address: Option.some({
 *     city: "New York",
 *     street: Option.some("123 Main St")
 *   })
 * }
 *
 * // Use flatMap to extract the street value
 * const street = pipe(
 *   user.address,
 *   Option.flatMap((address) => address.street)
 * )
 *
 * expect(street).toEqual(Option.some("123 Main St"))
 * ```
 * @category Working with Options
 */
export const flatMap: {
  <A, B>(f: (a: A) => Option<B>): (self: Option<A>) => Option<B>
  <A, B>(self: Option<A>, f: (a: A) => Option<B>): Option<B>
} = dual(
  2,
  <A, B>(self: Option<A>, f: (a: A) => Option<B>): Option<B> =>
    self._tag === "Some" ? f(self.value) : none,
)

// TODO: filter
// TODO: match
// TODO: fold - mark as deprecated and use `match` instead

/**
 * @category Working with Options
 */
// getOrElse

/**
 * @private
 * @ignore
 * @deprecated Use `getOrElse` and return an `Option`. This exists for `fp-ts` compatibility and will be removed in the next major version.
 */
// orElse

/**
 * @private
 * @ignore
 * @deprecated Use `getOrElse` and return an `Option`. This exists for `fp-ts` compatibility and will be removed in the next major version.
 */
// alt

// Multiple options

/**
 * @category Working with multiple Options
 */
export function map2<T1, T2, U extends NonNullable<V>, V>(
  fa: Option<T1>,
  fb: Option<T2>,
  f: (a: T1, b: T2) => U,
): Option<V> {
  if (fa._tag === "Some" && fb._tag === "Some") {
    return some(f(fa.value, fb.value))
  }
  return none
}

// Typeguards
// todo: isSome
// todo: isNone

// Conversion
// TODO: fromEither
// TODO: fromResult
// TODO: toNullable
// TODO: toUndefined
//

// Do notation
// I am not sure I want this? It seems complicated and could be solved with `mapA2`, `mapA3`, etc...
// It should be here for fp-ts compat and migration

/**
 * @deprecated Use `of` instead. This function will be removed in the next major version. This currently exists for fp-ts compatibility.
 * @ignore
 */
export const fromNullable = of

/**
 * @private
 * @deprecated This only exists for fp-ts compatibility and will be removed in the next major version. Please switch to `flatMap`.
 */
export const chain = flatMap
