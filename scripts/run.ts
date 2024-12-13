import { fold } from '../src/Either.js'
import { TaskEither } from '../src/TaskEither.js'

export function run<A>(eff: TaskEither<Error, A>): void {
  eff()
    .then(
      fold(
        (e) => {
          throw e
        },
        (_) => {
          process.exitCode = 0
        }
      )
    )
    .catch((e) => {
      console.error(e) // tslint:disable-line no-console

      process.exitCode = 1
    })
}
