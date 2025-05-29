import type { DocNode } from "jsr:@deno/doc@0.174.0"

type jsonDoc = { nodes: DocNode[] }

const colorsDoc = await Deno.readTextFile("./docs.json")

const docs = JSON.parse(colorsDoc) as jsonDoc

async function generate(module: string, category: string): Promise<void> {
  const categories: Array<string> = []

  const nodes: Map<string, DocNode> = new Map()

  let markdown = `
---
title: ${module}
---

`

  docs.nodes.filter((node) =>
    node.location.filename.includes(module) && node.jsDoc
  ).forEach((node) => {
    if (node.name !== "") {
      nodes.set(node.name, node)
    } else {
      nodes.set(module, node)
    }
  })

  for (const node of nodes.values()) {
    if (node.name === module) {
      const t = markdown.lastIndexOf("---") + 3
      const head = markdown.slice(0, t)
      const tail = markdown.slice(t)
      markdown = `${head}${node.jsDoc?.doc}\n${tail}`
    }
    if (node.declarationKind !== "private" && node.name !== module) {
      const category = node.jsDoc?.tags?.find((tag) => tag.kind === "category")
      if (
        category && category.kind == "category" &&
        !categories.includes(category.doc)
      ) {
        categories.push(category.doc)
        markdown += `## ${category.doc}\n\n`
      }

      if (node.name !== "") {
        markdown += `### ${node.name}\n\n`
      }

      markdown += `${node.jsDoc?.doc}\n`
    }
    const examples = node.jsDoc?.tags?.filter((tag) => tag.kind === "example")
    if (examples && examples.length > 0) {
      markdown += `#### Examples\n`
      for (const example of examples) {
        markdown += `${example.kind === "example" ? example.doc : ""}\n`
      }
    }
  }

  await Deno.mkdir(`./src/content/docs/${category}`, {
    recursive: true,
  })

  await Deno.writeTextFile(
    `./src/content/docs/${category}/${module}.md`,
    markdown,
  )
}

await generate("Option", "Data Types")
await generate("utility", "Functions")
await generate("Array", "Functions")
await generate("Record", "Functions")

// Copy the README.md file to src/content/docs/index.md
const readme = `
---
title: fp-tsm
---
${(await Deno.readTextFile("README.md"))}`

await Deno.writeTextFile("./src/content/docs/index.md", readme)
