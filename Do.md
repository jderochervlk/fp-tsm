# Do notation

**Cheatsheet**

| Haskell       | TypeScript                     |
| ------------- | ------------------------------ |
| `a <- action` | `bind('a', (scope) => action)` |
| `_ <- action` | `tap((scope) => action)`       |
| `return ...`  | `map((scope) => ...)`          |

**Example**

Haskell

```Haskell
nameDo :: IO ()
nameDo = do putStrLn "What is your first name? "
            first <- getLine
            putStrLn "And your last name? "
            last <- getLine
            let full = first ++ " " ++ last
            putStrLn ("Pleased to meet you, " ++ full ++ "!")
```

TypeScript

```ts
import { pipe } from '@jvlk/fp-tsm/function.js'
import * as T from '@jvlk/fp-tsm/Task.js''

declare const putStrLn: (s: string) => T.Task<void>
declare const getLine: T.Task<string>

const nameDo: T.Task<void> = pipe(
  T.Do,
  T.tap(() => putStrLn('What is your first name? ')),
  T.bind('first', () => getLine),
  T.tap(() => putStrLn('And your last name? ')),
  T.bind('last', () => getLine),
  T.bind('full', ({ first, last }) => T.of(first + ' ' + last)),
  T.flatMap(({ full }) => putStrLn('Pleased to meet you, ' + full + '!'))
)
```
