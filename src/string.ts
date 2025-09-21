// String refinements and utilities for functional programming.
// @module
import { dual } from "./internal.ts"

/**
 * Checks if a value is a string.
 *
 * @category Refinements
 * @example isString
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { isString } from "@jvlk/fp-tsm/string"
 *
 * expect(isString("hello")).toEqual(true)
 * expect(isString(123)).toEqual(false)
 * ```
 */
export function isString(u: unknown): u is string {
  return typeof u === "string"
}

/**
 * An empty string constant.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { empty } from "@jvlk/fp-tsm/string"
 *
 * expect(empty).toEqual("")
 * ```
 */
export const empty = ""

/**
 * Checks if a string is empty.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { isEmpty } from "@jvlk/fp-tsm/string"
 *
 * expect(isEmpty("")).toEqual(true)
 * expect(isEmpty("abc")).toEqual(false)
 * ```
 */
export function isEmpty(s: string): boolean {
  return s.length === 0
}

/**
 * Returns the number of characters in a string.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { size } from "@jvlk/fp-tsm/string"
 *
 * expect(size("")).toEqual(0)
 * expect(size("abc")).toEqual(3)
 * ```
 */
export function size(s: string): number {
  return s.length
}

/**
 * Checks if a string includes a substring.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { includes } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(includes("hello world", "world")).toEqual(true)
 * expect(includes("hello world", "foo")).toEqual(false)
 * expect(pipe("hello world", includes("world"))).toEqual(true)
 * ```
 */
export const includes: {
  (self: string, search: string): boolean
  (search: string): (self: string) => boolean
} = dual(2, (self: string, search: string) => self.includes(search))

/**
 * Checks if a string starts with a substring.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { startsWith } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(startsWith("hello world", "hello")).toEqual(true)
 * expect(startsWith("hello world", "world")).toEqual(false)
 * expect(pipe("hello world", startsWith("hello"))).toEqual(true)
 * ```
 */
export const startsWith: {
  (self: string, search: string): boolean
  (search: string): (self: string) => boolean
} = dual(2, (self: string, search: string) => self.startsWith(search))

/**
 * Checks if a string ends with a substring.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { endsWith } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(endsWith("hello world", "world")).toEqual(true)
 * expect(endsWith("hello world", "hello")).toEqual(false)
 * expect(pipe("hello world", endsWith("world"))).toEqual(true)
 * ```
 */
export const endsWith: {
  (self: string, search: string): boolean
  (search: string): (self: string) => boolean
} = dual(2, (self: string, search: string) => self.endsWith(search))

/**
 * Replaces a substring with another string.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { replace } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(replace("foo baz", "foo", "bar")).toEqual("bar baz")
 * expect(pipe("foo baz", replace("foo", "bar"))).toEqual("bar baz")
 * ```
 */
export const replace: {
  (self: string, searchValue: string | RegExp, replaceValue: string): string
  (searchValue: string | RegExp, replaceValue: string): (self: string) => string
} = dual(
  3,
  (self: string, searchValue: string | RegExp, replaceValue: string) =>
    self.replace(searchValue, replaceValue),
)

/**
 * Slices a string from start to end.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { slice } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(slice("hello", 1, 3)).toEqual("el")
 * expect(pipe("hello", slice(1, 3))).toEqual("el")
 * ```
 */
export const slice: {
  (self: string, start: number, end: number): string
  (start: number, end: number): (self: string) => string
} = dual(
  3,
  (self: string, start: number, end: number) => self.slice(start, end),
)

/**
 * Splits a string by a separator.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { split } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(split("a,b,c", ",")).toEqual(["a", "b", "c"])
 * expect(pipe("a,b,c", split(","))).toEqual(["a", "b", "c"])
 * ```
 */
export const split: {
  (self: string, separator: string | RegExp): string[]
  (separator: string | RegExp): (self: string) => string[]
} = dual(2, (self: string, separator: string | RegExp) => self.split(separator))

/**
 * Converts a string to lower case.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { toLowerCase } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(toLowerCase("ABC")).toEqual("abc")
 * expect(pipe("ABC", toLowerCase)).toEqual("abc")
 * ```
 */
export function toLowerCase(s: string): string {
  return s.toLowerCase()
}

/**
 * Converts a string to upper case.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { toUpperCase } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(toUpperCase("abc")).toEqual("ABC")
 * expect(pipe("abc", toUpperCase)).toEqual("ABC")
 * ```
 */
export function toUpperCase(s: string): string {
  return s.toUpperCase()
}

/**
 * Trims whitespace from both ends of a string.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { trim } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(trim("  hello  ")).toEqual("hello")
 * expect(pipe("  hello  ", trim)).toEqual("hello")
 * ```
 */
export function trim(s: string): string {
  return s.trim()
}

/**
 * Trims whitespace from the left side of a string.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { trimLeft } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(trimLeft("  hello  ")).toEqual("hello  ")
 * expect(pipe("  hello  ", trimLeft)).toEqual("hello  ")
 * ```
 */
export function trimLeft(s: string): string {
  return s.trimStart()
}

/**
 * Trims whitespace from the right side of a string.
 *
 * @category Utils
 * @example
 * ```ts
 * import { expect } from "jsr:@std/expect"
 * import { trimRight } from "@jvlk/fp-tsm/string"
 * import { pipe } from "@jvlk/fp-tsm"
 *
 * expect(trimRight("  hello  ")).toEqual("  hello")
 * expect(pipe("  hello  ", trimRight)).toEqual("  hello")
 * ```
 */
export function trimRight(s: string): string {
  return s.trimEnd()
}
