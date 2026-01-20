import type { DocNode } from "@deno/doc"
import { kebabCase, upperFirst } from "es-toolkit/string"

type jsonDoc = { nodes: DocNode[] }

const colorsDoc = await Deno.readTextFile("./docs.json")

const docs = JSON.parse(colorsDoc) as jsonDoc

async function generate(
  module: string,
  category: string,
  subcategories: Array<string> = [],
): Promise<void> {
  const categories: Array<string> = []

  const nodes: Map<string, DocNode> = new Map()

  const markdownTitle = kebabCase(module).split("-").map(upperFirst)

  const sidebarLabel = markdownTitle.length === 2 ? markdownTitle[1] : markdownTitle[0]

  let markdown = `
---
title: ${
    markdownTitle.includes("Types")
      ? markdownTitle.map((text, index) =>
        // remove the trailing "s" if it's the last word
        index === 0 ? text.slice(0, text.length - 1) : text
      ).join(" ")
      : markdownTitle.reverse().join(" ")
  }
sidebar:
  label: ${sidebarLabel}
---\n
`

  if (subcategories.length > 0) {
    for (const subcategory of subcategories) {
      await generate(
        `${module}${subcategory.split(" ").reverse().join("")}`,
        module,
      )
    }
    return
  }

  docs.nodes.filter((node) => node.location.filename.includes(module) && node.jsDoc).forEach(
    (node) => {
      if (node.name !== "") {
        nodes.set(node.name, node)
      } else {
        nodes.set(module, node)
      }
    },
  )

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

  const markdownFileName = kebabCase(module).split("-")[1]

  await Deno.writeTextFile(
    `./src/content/docs/${category}/${markdownFileName ?? module}.md`,
    markdown,
  )
}

await generate("Option", "Data Types")
await generate("Either", "Data Types")
await generate("Future", "Data Types")
await generate("utility", "Functions")
await generate("Arrays", "", [
  "Types",
  "Creating",
  "Mapping",
  "Filtering",
  "Folding",
  "Refining",
  "Sequencing",
  "Traversing",
  "Utils",
])
await generate("Record", "Functions")
await generate("Json", "Functions")
await generate("string", "Functions")
await generate("number", "Functions")

// Copy the README.md file to src/content/docs/index.md
const readme = `
---
title: fp-tsm
---
${(await Deno.readTextFile("README.md"))}`

await Deno.writeTextFile("./src/content/docs/index.md", readme)
