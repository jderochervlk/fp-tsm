import * as Json from "@jvlk/fp-tsm/Json"
import { expect } from "@std/expect/expect"

Deno.test("parse", () => {
  expect(Json.parse('{"a":1}')).toMatchObject({
    _tag: "Ok",
    ok: { a: 1 },
  })

  expect(Json.parse("a")._tag).toBe("Error")
  expect(Json.parse("a")).toMatchObject({
    _tag: "Error",
    error: expect.any(SyntaxError),
  })
})

Deno.test("stringify", () => {
  expect(Json.stringify({ a: 1 })).toMatchObject({
    _tag: "Ok",
    ok: '{"a":1}',
  })

  const circularObj: Record<string, unknown> = {}
  circularObj.self = circularObj

  expect(Json.stringify(circularObj)._tag).toBe("Error")
  expect(Json.stringify(circularObj)).toMatchObject({
    _tag: "Error",
    error: expect.any(TypeError),
  })
})
