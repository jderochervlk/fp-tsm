import { expect } from "@std/expect/expect"
import * as Either from "./Either.ts"
import * as Option from "./Option.ts"
import { pipe } from "./utility.ts"
import { assertSpyCalls, spy } from "jsr:@std/testing/mock"
import * as Task from "./Task.ts"

const t: Task.Task<number, never> = () =>
  Promise.resolve(
    Option.of(42),
  )

Deno.test("Task resolves to Option and functions are lazy and multiple maps can be applied", async () => {
  const logSpy = spy()
  const x = pipe(
    t,
    Task.map((x) => {
      logSpy()
      return x + 1
    }),
    Task.map((x) => x + 1),
  )

  assertSpyCalls(logSpy, 0)

  expect(await x()).toEqual(Option.of(44))

  assertSpyCalls(logSpy, 1)
})

const t1 = pipe(
  Task.fetch("https://example.com"),
  //   @ts-expect-error
  Task.promise((res) => res.json().then(Either.right).catch(Either.left)),
  Task.map((x) => {
    console.log(x)
    return x
  }),
)

await t1().then(console.log)

Deno.test("You can create a Task from an Option", async () => {
  const task = Task.of(Option.of(42))
  expect(await task()).toEqual(Option.of(42))
})

Deno.test("You can create a Task from an Either", async () => {
  const task = Task.of(Either.right(42))
  expect(await task()).toEqual(Either.right(42))
})
