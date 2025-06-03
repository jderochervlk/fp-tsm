---
title: Overview
---

Functions with null parameters can quickly become hard to manage and compose.
The presences of `null` or `undefined` will quickly spread across your codebase
and add complexity due to the need to check for them constantly.

```ts
import { expect } from "jsr:@std/expect"
 *
// all of our functions are written to handle null and undefined values
const add = (a: number | null | undefined, b: number | null | undefined): number | null => {
  if (!a || !b) {
    return null
  }
  return a + b
}
 *
// and it quickly becomes a mess to handle them
const increment = (a: number | null | undefined): number | null => {
 if (a == null) {
   return null
 } else return a + 1
}
 *
const result1 = increment(add(1, 2))
 *
expect(result1).toEqual(4)
 *
const result2 = increment(add(null, 2))
 *
expect(result2).toEqual(null)
```

-

@example Using `Option` allows you to avoid the need to check for `null` or
`undefined` in your code. You can use the `Option` type to represent optional
values and use pattern matching to handle them.

```ts
import { expect } from "jsr:@std/expect"
import { Option, pipe } from "@jvlk/fp-tsm"
 *
// you can write functions that no longer need to check for null or undefined and use them with confidence!
const add = (a: number) => (b: number) => number => a + b
 *
// we can handle the possibility of `None` values in a clean way later on!
const increment = (a: number): number => Option.map(a, n => n + 1)
 *
// This fancy syntax is called "Do notation" and allows you to work with multiple `Option`s in a using TypeScript's yield syntax.
const result1 = Option.Do(function* () {
 const a = yield* Option.bind(Option.of(1))
 const b = yield* Option.bind(Option.of(2))
 *
 return increment(add(a, b))
})
expect(increment(add(Option.of(1), Option.of(2)))).toEqual(Option.some(4))
expect(increment(add(Option.of<number>(undefined), Option.of(2)))).toEqual(Option.none)
expect(increment(add(Option.of<number>(null), Option.of(2)))).toEqual(Option.none)
```

*/`
