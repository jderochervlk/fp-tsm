/**
 * The `Option` type represents optional values and is a replacement for using `null` or `undefined`.
 * An `Option<A>` can either be `Some<A>`, containing a value of type `A`, or `None`, representing the absence of a value.
 *
 * It can be useful to distinguish values between each other: you can represent `Some(None)` with options, whereas `undefined` or `null` replace the value they intend to make optional.
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

/**
 * This is probaly way you will usually create an `Option`. It's similar to doing `Array.of` to create a new array.
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
 * @deprecated Use `of` instead. This function will be removed in the next major version. This currently exists for fp-ts compatibility.
 * @ignore
 */
export const fromNullable = of

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
