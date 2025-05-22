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
 */
export type Option<T> = Some<T> | None

type Some<T> = {
  _tag: "Some"
  value: T
}

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
 * import * as Option from "@jvlk/fp-tsm/Option"
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
 */
export const fromNullable = of
