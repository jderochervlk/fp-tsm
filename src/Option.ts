import { dual } from "./internal.ts"

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

/**
 * `tryCatch` is a utility function that allows you to execute a function that may throw an error and return an `Option`.
 * You can also provide a function to call when there is an error, which is useful for logging or other side effects you might want to use when there is an error.
 *
 * @category Creating Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.tryCatch(() => 1)).toEqual(Option.some(1))
 *
 * expect(Option.tryCatch(() => { throw new Error("Error") })).toEqual(Option.none)
 *
 * expect(Option.tryCatch(() => { throw new Error("Error with logging") }, console.error)).toEqual(Option.none)
 * ```
 */
export function tryCatch<A>(
  fn: () => A,
  onError?: (e: unknown) => void,
): Option<A> {
  try {
    return of(fn())
  } catch (e) {
    if (onError) {
      onError(e)
    }
    return none
  }
}

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

/**
 * Applies a filter function to an `Option`, returning the `Option` itself if the value satisfies the predicate, or `None` if it does not.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.filter(Option.some(42), (n) => n > 40)).toEqual(Option.some(42))
 * expect(Option.filter(Option.some(42), (n) => n < 40)).toEqual(Option.none)
 *
 * expect(
 *  pipe(
 *    Option.some(42),
 *    Option.filter((n) => n > 40),
 *  )
 * ).toEqual(Option.some(42))
 *
 * expect(
 *  pipe(
 *    Option.some(42),
 *    Option.filter((n) => n < 40),
 *  )
 * ).toEqual(Option.none)
 * ```
 */
export const filter: {
  <A>(f: (a: A) => boolean): (self: Option<A>) => Option<A>
  <A>(self: Option<A>, f: (a: A) => boolean): Option<A>
} = dual(2, (self, f) => {
  if (self._tag === "Some" && f(self.value)) {
    return self
  }
  return none
})

/**
 * Matches an `Option` against two functions: one for the `Some` case and one for the `None` case.
 * This is useful for handling both cases in a single expression without needing to check the `_tag` manually.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Option.match(Option.some(42), val => `The value is ${val}.`, () => "There is no value.")).toEqual("The value is 42.")
 * expect(Option.match(Option.none, val => `The value is ${val}.`, () => "There is no value.")).toEqual("There is no value.")
 *
 * expect(
 *  pipe(
 *    Option.some(42),
 *    Option.match(
 *      (val) => `The value is ${val}.`,
 *      () => "There is no value.",
 *    )
 *  )
 * ).toEqual("The value is 42.")
 *
 * expect(
 *  pipe(
 *    Option.none,
 *    Option.match(
 *      (val) => `The value is ${val}.`,
 *      () => "There is no value.",
 *    )
 *  )
 * ).toEqual("There is no value.")
 * ```
 */
export const match: {
  <A, B>(some: (a: A) => B, none: () => B): (self: Option<A>) => B
  <A, B>(self: Option<A>, some: (a: A) => B, none: () => B): B
} = dual(3, (self, some, none) => {
  if (self._tag === "Some") {
    return some(self.value)
  }
  return none()
})

/**
 * Gets the value from an `Option`, or returns a fallback value if the `Option` is `None`.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Option.getOrElse(Option.some(42), () => 10)).toEqual(42)
 *
 * expect(Option.getOrElse(Option.none, () => 10)).toEqual(10)
 *
 * expect(
 *  pipe(
 *    Option.some(42),
 *    Option.getOrElse(() => 10),
 *  )
 * ).toEqual(42)
 *
 * expect(
 *  pipe(
 *    Option.none,
 *    Option.getOrElse(() => 10),
 *  )
 * ).toEqual(10)
 * ```
 */
export const getOrElse: {
  <A>(f: () => A): (self: Option<A>) => A
  <A>(self: Option<A>, f: () => A): A
} = dual(
  2,
  (self, fallback) => self._tag === "Some" ? self.value : fallback(),
)

/**
 * @private
 * @ignore
 * @deprecated Use `getOrElse` and return an `Option`. This exists for `fp-ts` compatibility and will be removed in the next major version.
 */
export const orElse = getOrElse

/**
 * @ignore
 * @deprecated Use `getOrElse` and return an `Option`. This exists for `fp-ts` compatibility and will be removed in the next major version.
 */
export const alt = getOrElse

// Typeguards

/**
 * Checks if an `Option` is a `Some` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Option` to `Some<T>` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.isSome(Option.some(1))).toEqual(true)
 * expect(Option.isSome(Option.none)).toEqual(false)
 * ```
 */
export function isSome<T>(self: Option<T>): self is Some<T> {
  return self._tag === "Some"
}

/**
 * Checks if an `Option` is a `None` value. This works as a valid type guard, allowing TypeScript to narrow the type of the `Option` to `None` when this function returns `true`.
 *
 * @category Type Guards
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.isNone(Option.some(1))).toEqual(false)
 * expect(Option.isNone(Option.none)).toEqual(true)
 * ```
 */
export function isNone<T>(self: Option<T>): self is None {
  return self._tag === "None"
}

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
 * @ignore
 * @deprecated Use `of` instead. This function will be removed in the next major version. This currently exists for fp-ts compatibility.
 */
export const fromNullable = of

/**
 * @ignore
 * @deprecated This only exists for fp-ts compatibility and will be removed in the next major version. Please switch to `flatMap`.
 */
export const chain = flatMap

/**
 * @ignore
 * @deprecated Use `match` instead. This exists for `fp-ts` compatibility and will be removed in the next major version.
 */
export const fold = match
