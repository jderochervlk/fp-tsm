import { doc, DocNode } from "jsr:@deno/doc@0.174.0"

type jsonDoc = { nodes: DocNode[] }

const colorsDoc = await Deno.readTextFile("./docs.json")

const docs = JSON.parse(colorsDoc) as jsonDoc

let markdown = ""

let title = ""

// console.log(docs)

for (const node of docs.nodes) {
  if (node.declarationKind !== "private") {
    if (!node.name && node.kind === "moduleDoc") {
      title = node.location.filename.split("/").slice(-1)[0].split(".")[0]
      markdown += `# ${title}\n\n`
    } else {
      if (node.name !== title) {
        markdown += `## ${node.name}\n\n`
      }
      markdown += `${node.jsDoc?.doc}\n`
      const examples = node.jsDoc?.tags?.filter((tag) => tag.kind === "example")
      if (examples && examples.length > 0) {
        markdown += `### Examples\n\n`
        for (const example of examples) {
          markdown += `${example.kind === "example" ? example.doc : ""}\n`
        }
      }
    }
  }
}

await Deno.writeTextFile("./docs/docs.md", markdown)
