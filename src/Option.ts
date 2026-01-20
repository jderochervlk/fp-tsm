// deno-lint-ignore-file no-explicit-any
import { dual } from "./internal.ts"
import type { Either } from "./Either.ts"
import { Result } from "./Result.ts"

/**
 * The `Option` type represents optional values and is a replacement for using `null` or `undefined`.
 * An `Option<A>` can either be `Some<A>`, containing a value of type `A`, or `None`, representing the absence of a value.
 *
 * Passing around an `Option<string>` is more descriptive than passing around a `string | null | undefined`, as it clearly indicates that the value may or may not be present.
 *
 * @example We might have a function that takes in an optional argument that could also be undefined and we want to do something different if it's not provided versus when it is provided but not defined.
 * ```ts
 * function greet(name?: string) {
 *   // We have no way of knowing if the name is provided or not!
 *   if(!name)  {
 *     return "Hello, stranger!"
 *   } else {
 *     return `Hello, ${name}!`
 *   }
 * }
 * ```
 *
 * @example `null` is often used for this case, so now the type for name will be `string | null | undefined`, which is not very descriptive.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 *
 * function greet(name?: string | null) {
 *  // name can be undefined, null, or a string, even though we only defined it as string | null
 *
 *  // don't forget to not mix up === and ==!
 *  if (name === null) {
 *    // passing null means that we have a name, it's just null.
 *    return `Hello, anonymous!`
 *  } else if (name === undefined) {
 *    return `Hello, stranger!`
 *  }
 *  return `Hello, ${name}!`
 * }
 *
 * expect(greet()).toEqual("Hello, stranger!")
 * expect(greet(null)).toEqual("Hello, anonymous!")
 * expect(greet("John")).toEqual("Hello, John!")
 * ```
 *
 * @example Using `Option` makes it clear that the value may not be present, and we can handle both cases in a more type-safe way.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * // We can use default values for our functions arguments
 * function greet(name: Option.Option<string> = Option.of("stranger")) {
 *   return pipe(
 *     name,
 *     Option.map((n) => `Hello, ${n}!`),
 *     Option.getOrElse(() => "Hello, anonymous!"),
 *   )
 * }
 *
 * expect(greet()).toEqual("Hello, stranger!")
 * expect(greet(Option.none)).toEqual("Hello, anonymous!")
 * expect(greet(Option.of("John"))).toEqual("Hello, John!")
 * ```
 * An `Option` can be great to represent keys that are present on an Object vs ones that are not.
 * This allows you to treat `undefined` as something that truely doesn't exist, rather than just being a value that is not set or is empty.
 *
 * @example An object with `undefined` values.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 *
 * const obj: Record<string, string | undefined> = {
 *    name: "John",
 *    age: undefined,
 *    city: "New York",
 * }
 *
 * expect(obj["name"]).toEqual("John")
 * expect(obj["age"]).toEqual(undefined) // this is defined, but has no value
 * expect(obj["height"]).toEqual(undefined) // this key doesn't exist
 * ```
 *
 * @example An object with `Option` values.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * const obj: Record<string, Option.Option<string>> = {
 *    name: Option.some("John"),
 *    age: Option.none,
 *    city: Option.some("New York"),
 * }
 *
 * expect(obj["name"]).toEqual(Option.some("John"))
 * expect(obj["age"]).toEqual(Option.none) // this is defined, but has no value
 * expect(obj["height"]).toEqual(undefined) // this key doesn't exist
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
export function of<T>(value: T | null | undefined): Option<NonNullable<T>> {
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

export const none: None = {
  _tag: "None",
}

/**
 * You can create an `Option` based on a predicate, for example, to check if a value is positive.
 *
 * The `fromPredicate` function can be a (type predicate function)[https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates], meaning it can the type of the value.
 *
 * @category Creating Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * const isPositive = Option.fromPredicate((n: number): n is number => n >= 0)
 *
 * expect(isPositive(-1)).toEqual(Option.none)
 * expect(isPositive(1)).toEqual(Option.some(1))
 * ```
 */

export const fromPredicate: {
  <A>(
    predicate: (a: any) => a is A,
  ): (a: any) => Option<A>
  <A>(a: any, predicate: (a: any) => a is A): Option<A>
  <A>(
    predicate: (a: any) => boolean,
  ): (a: A) => Option<A>
  <A>(a: A, predicate: (a: any) => boolean): Option<A>
} = dual(2, <A>(a: A, predicate: (a: any) => a is A) => {
  return predicate(a) ? of(a) : none
})

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
 * expect(Option.tryCatch(() => { throw new Error("Error with logging") }, e => `Error!: ${e}`)).toEqual(Option.none)
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
    f: (a: A) => NonNullable<B>,
  ): (self: Option<A>) => Option<NonNullable<B>>
  <A, B>(self: Option<A>, f: (a: A) => NonNullable<B>): Option<NonNullable<B>>
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
 * import { Option, pipe } from "@jvlk/fp-tsm"
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
 *   Option.flatMap(({ street }) => street)
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
 * `forEach` applies a side effect to the value inside an `Option` if it is `Some` and returns the original `Option`.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * let counter = 0
 * const incrementCounter = () => counter++
 *
 * expect(Option.forEach(Option.some(42), () => incrementCounter())).toEqual(Option.some(42))
 * expect(counter).toEqual(1)
 *
 * expect(Option.forEach(Option.none, () => incrementCounter())).toEqual(Option.none)
 * expect(counter).toEqual(1)
 * ```
 */
export const forEach: {
  <A>(f: (a: A) => void): (self: Option<A>) => Option<A>
  <A>(self: Option<A>, f: (a: A) => void): Option<A>
} = dual(2, <A>(self: Option<A>, f: (a: A) => void): Option<A> => {
  if (self._tag === "Some") {
    f(self.value)
  }
  return self
})

/**
 * Applies a filter function to an `Option`, returning the `Option` itself if the value satisfies the predicate, or `None` if it does not.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
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
 * expect(Option.match(Option.some(42), () => "There is no value.", val => `The value is ${val}.`)).toEqual("The value is 42.")
 * expect(Option.match(Option.none, () => "There is no value.", val => `The value is ${val}.`)).toEqual("There is no value.")
 *
 * expect(
 *  pipe(
 *    Option.some(42),
 *    Option.match(
 *      () => "There is no value.",
 *      (val) => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("The value is 42.")
 *
 * expect(
 *  pipe(
 *    Option.none,
 *    Option.match(
 *      () => "There is no value.",
 *      (val) => `The value is ${val}.`
 *    )
 *  )
 * ).toEqual("There is no value.")
 * ```
 */
export const match: {
  <A, B>(none: () => B, some: (a: A) => B): (self: Option<A>) => B
  <A, B>(self: Option<A>, none: () => B, some: (a: A) => B): B
} = dual(3, (self, none, some) => {
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
 * Provides an alternative `Option` value if the current `Option` is `None`.
 * If the current `Option` is `Some`, it returns the current value.
 * If it's `None`, it returns the result of evaluating the provided function.
 *
 * @category Working with Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * expect(Option.alt(Option.some(1), () => Option.some(2))).toEqual(Option.some(1))
 * expect(Option.alt(Option.none, () => Option.some(2))).toEqual(Option.some(2))
 *
 * // Using pipe
 * expect(
 *   pipe(
 *     Option.some(1),
 *     Option.alt(() => Option.some(2))
 *   )
 * ).toEqual(Option.some(1))
 *
 * expect(
 *   pipe(
 *     Option.none,
 *     Option.alt(() => Option.some(2))
 *   )
 * ).toEqual(Option.some(2))
 * ```
 */
export const alt: {
  <A>(
    fn: () => Option<A>,
  ): <A>(self: Option<A>) => Option<A>
  <A>(self: Option<A>, fn: () => Option<A>): Option<A>
} = dual(
  2,
  <A>(self: Option<A>, fn: () => Option<A>) => self._tag === "Some" ? self : fn(),
)

export const ap: <A extends NonNullable<T>, T>(
  fa: Option<A>,
) => <B extends NonNullable<U>, U>(fab: Option<(a: T) => B>) => Option<B> = (fa) => (fab) =>
  isNone(fab) ? none : isNone(fa) ? none : some(fab.value(fa.value))

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

// Conversion
/**
 * Converts a `Result` into an `Option`, mapping the `Ok` value to `Some` and the `Err` value to `None`.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, Result } from "@jvlk/fp-tsm"
 *
 * expect(Option.fromResult(Result.ok(1))).toEqual(Option.some(1))
 * expect(Option.fromResult(Result.error("error"))).toEqual(Option.none)
 * ```
 */
export function fromResult<R>(
  self: Result<R, unknown>,
): Option<NonNullable<R>> {
  return self._tag === "Ok" ? of(self.ok) : none
}

/**
 * Converts an `Either` into an `Option`, mapping the `Right` value to `Some` and the `Left` value to `None`.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, Either } from "@jvlk/fp-tsm"
 *
 * expect(Option.fromEither(Either.right(1))).toEqual(Option.some(1))
 * expect(Option.fromEither(Either.left("error"))).toEqual(Option.none)
 * ```
 */
export function fromEither<R>(
  self: Either<unknown, R>,
): Option<NonNullable<R>> {
  return self._tag === "Right" ? of(self.right) : none
}

/**
 * Converts an `Option` to a nullable value. If the `Option` is `Some`, it returns the contained value; if it is `None`, it returns `null`.
 * This should be used only when you are doing interop with other libraries that expect `null` values.
 * If you are using `Option` as a type, you should prefer to use `None` instead of `null`.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.toNullable(Option.some(1))).toEqual(1)
 * expect(Option.toNullable(Option.none)).toEqual(null)
 * ```
 */
export function toNullable<T>(self: Option<T>): T | null {
  return self._tag === "Some" ? self.value : null
}

/**
 * Converts an `Option` to an `undefined` value. If the `Option` is `Some`, it returns the contained value; if it is `None`, it returns `undefined`.
 * This should be used only when you are doing interop with other libraries that expect `undefined` values.
 * If you are using `Option` as a type, you should prefer to use `None` instead of `undefined`.
 *
 * @category Conversion
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * expect(Option.toUndefined(Option.some(1))).toEqual(1)
 * expect(Option.toUndefined(Option.none)).toEqual(undefined)
 * ```
 */
export function toUndefined<T>(self: Option<T>): T | undefined {
  return self._tag === "Some" ? self.value : undefined
}

// Multiple options

/**
 * Do notation allows you to yield `Option` values and combine them in a sequential manner without having to manually check for `None` at each step.
 *
 * The `yield*` operator is used to work with multiple `Option` values in a generator function. Each value must be yielded with `Option.bind()`.
 *
 * @category Working with multiple Options
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from "@jvlk/fp-tsm"
 *
 * const age = Option.some(30)
 * const name = Option.some("John")
 * const city = Option.some("New York")
 *
 * const data = Option.Do(function* () {
 *   const personAge = yield* Option.bind(age)
 *   const personName = yield* Option.bind(name)
 *   const personCity = yield* Option.bind(city)
 *   return `Hello ${personName}! You are ${personAge} years old and live in ${personCity}.`
 * })
 *
 * expect(data).toEqual(Option.some("Hello John! You are 30 years old and live in New York."))
 *
 * // If any Option is None, the entire result is None
 * const data2 = Option.Do(function* () {
 *   const personAge = yield* Option.bind(Option.none)
 *   const personName = yield* Option.bind(name)
 *   return `Hello ${personName}! You are ${personAge} years old.`
 * })
 *
 * expect(data2).toEqual(Option.none)
 * ```
 *
 * @example Without Do notation, the same code would be much more verbose.
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option, pipe } from "@jvlk/fp-tsm"
 *
 * const age = Option.some(30)
 * const name = Option.some("John")
 * const city = Option.some("New York")
 *
 * const result = pipe(
 *   age,
 *   Option.flatMap(personAge =>
 *     pipe(
 *       name,
 *       Option.flatMap(personName =>
 *         pipe(
 *           city,
 *           Option.map(personCity =>
 *             `Hello ${personName}! You are ${personAge} years old and live in ${personCity}.`
 *           )
 *         )
 *       )
 *     )
 *   )
 * )
 *
 * expect(result).toEqual(Option.some("Hello John! You are 30 years old and live in New York."))
 * ```
 */

export function Do<A, U = any>(
  generator: () => Generator<Option<unknown>, A, U>,
): Option<A> {
  const iterator = generator()
  let result = iterator.next()

  while (!result.done) {
    if (result.value._tag === "None") {
      return result.value
    }
    result = iterator.next(
      result.value.value as U,
    )
  }
  return of(result.value)
}

/**
 * Binds the value of an `Option` to a new key in an object, using a function that transforms the value.
 * Useful for when you want to work with multiple `Option`s and only do something if they are all `Some`.
 *
 * @ignore
 * See {@link Do} for an example of how to use this.
 */
export function* bind<A>(self: Option<A>): Generator<Option<A>, A, A> {
  if (self._tag === "None") {
    return yield self
  }
  return self.value
}
