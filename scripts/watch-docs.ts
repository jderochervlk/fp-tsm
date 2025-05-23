import { exec } from "@bearz/exec"
import { debounce } from "jsr:@std/async/debounce"

const watcher = Deno.watchFs("./src")

const log = debounce((event: Deno.FsEvent) => {
  console.log("[%s] %s", event.kind, event.paths[0])
}, 200)

const run = debounce(async () => {
  await exec("deno task docs:json")
  await exec("deno task docs:md")
  await exec("deno check --doc-only")
  await exec("deno task tests:generate")
}, 200)

for await (const event of watcher) {
  if (
    event.paths[0].includes(".ts") &&
    event.kind === "modify" &&
    !event.paths[0].includes("test.ts")
  ) {
    log(event)
    run()
  }
}
