/**
 * The `Option` data type represents optional values. An `Option<A>` can either
 * be `Some<A>`, containing a value of type `A`, or `None`, representing the
 * absence of a value.
 *
 * **When to Use**
 *
 * You can use `Option` in scenarios like:
 *
 * - Using it for initial values
 * - Returning values from functions that are not defined for all possible
 *   inputs (referred to as “partial functions”)
 * - Managing optional fields in data structures
 * - Handling optional function arguments
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
 * Create an `Option`.
 *
 * Returns `None` if the value is `null` or `undefined`, otherwise wraps the value in a `Some`.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from '@jvlk/fp-tsm'
 *
 * expect(Option.of(undefined)).toEqual({ _tag: "None" })
 *
 * expect(Option.of(null)).toEqual({ _tag: "None" })
 *
 * expect(Option.of(1)).toEqual({ _tag: 'Some', value: 1 })
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
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from '@jvlk/fp-tsm'
 *
 * expect(Option.none).toEqual({ _tag: "None" })
 * ```
 */
export const none: Option<never> = { _tag: "None" }

/**
 * Constructs a `Some`. Represents an optional value that exists.
 * This value cannot be `null` or `undefined`.
 *
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from '@jvlk/fp-tsm'
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
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { Option } from '@jvlk/fp-tsm'
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
