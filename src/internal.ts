// deno-lint-ignore-file no-explicit-any
/**
 * This is copied from `effect`
 */
export const dual: {
  <
    DataLast extends (...args: Array<any>) => any,
    DataFirst extends (...args: Array<any>) => any,
  >(
    arity: Parameters<DataFirst>["length"],
    body: DataFirst,
  ): DataLast & DataFirst
  <
    DataLast extends (...args: Array<any>) => any,
    DataFirst extends (...args: Array<any>) => any,
  >(
    isDataFirst: (args: IArguments) => boolean,
    body: DataFirst,
  ): DataLast & DataFirst
} = function (arity, body) {
  if (typeof arity === "function") {
    return function () {
      if (arity(arguments)) {
        // @ts-expect-error -- I should come back to this
        return body.apply(this, arguments)
      }
      return ((self: any) => body(self, ...arguments)) as any
    }
  }

  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`)

    case 2:
      return function (a, b) {
        if (arguments.length >= 2) {
          return body(a, b)
        }
        return function (self: any) {
          return body(self, a)
        }
      }

    case 3:
      return function (a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c)
        }
        return function (self: any) {
          return body(self, a, b)
        }
      }

    case 4:
      return function (a, b, c, d) {
        if (arguments.length >= 4) {
          return body(a, b, c, d)
        }
        return function (self: any) {
          return body(self, a, b, c)
        }
      }

    case 5:
      return function (a, b, c, d, e) {
        if (arguments.length >= 5) {
          return body(a, b, c, d, e)
        }
        return function (self: any) {
          return body(self, a, b, c, d)
        }
      }

    default:
      return function () {
        if (arguments.length >= arity) {
          // @ts-expect-error -- I should come back to this
          return body.apply(this, arguments)
        }
        const args = arguments
        return function (self: any) {
          return body(self, ...args)
        }
      }
  }
}
