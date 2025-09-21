import * as Either from "./Either.ts"

/**
 * Safely parses a JSON string, returning an `Either` with a `SyntaxError` on failure or the parsed value on success.
 *
 * @example parse
 * ```ts
 * import { parse } from "@jvlk/fp-tsm/Json"
 * import { expect } from "@std/expect/expect"
 *
 * expect(parse('{"a":1}')).toMatchObject({ _tag: "Right", right: { a: 1 } })
 * expect(parse('a')._tag).toBe("Left")
 * expect(parse('a')).toMatchObject({ _tag: "Left", left: expect.any(SyntaxError) })
 * ```
 */
export const parse = (s: string): Either.Either<SyntaxError, unknown> => {
  try {
    const result = JSON.parse(s)
    return Either.right(result)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Either.left(err)
    }
  }
  return Either.left(new SyntaxError("Unknown error"))
}

/**
 * Safely stringifies a value to JSON, returning an `Either` with a `TypeError` on failure or the JSON string on success.
 *
 * @example stringify
 * ```ts
 * import { stringify } from "@jvlk/fp-tsm/Json"
 * import { expect } from "@std/expect/expect"
 *
 * expect(stringify({ a: 1 })).toMatchObject({ _tag: "Right", right: '{"a":1}' })
 *
 * const circularObj: Record<string, unknown> = {}
 * circularObj.self = circularObj
 * expect(stringify(circularObj)._tag).toBe("Left")
 * expect(stringify(circularObj)).toMatchObject({ _tag: "Left", left: expect.any(TypeError) })
 * ```
 */
export const stringify = (data: unknown): Either.Either<TypeError, string> => {
  try {
    const result = JSON.stringify(data)
    return Either.right(result)
  } catch (err) {
    if (err instanceof TypeError) {
      return Either.left(err)
    }
  }
  return Either.left(new TypeError("Unknown error"))
}
