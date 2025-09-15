import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://jderochervlk.github.io",
  base: "/fp-tsm/",
  integrations: [
    starlight({
      title: "fp-tsm",
      sidebar: [
        { label: "Getting Started", items: ["getting-started/installation"] },
        {
          label: "Data Types",
          items: [
            "data-types/option",
            "data-types/either",
            "data-types/future",
          ],
        },
        {
          label: "Functions",
          items: ["functions/utility", "functions/record"],
        },
        {
          label: "Arrays",
          items: [
            "arrays/arrays-types",
            "arrays/arrays-creating",
            "arrays/arrays-mapping",
            "arrays/arrays-filtering",
            "arrays/arrays-folding",
            "arrays/arrays-refining",
            "arrays/arrays-sequencing",
            "arrays/arrays-traversing",
            "arrays/arrays-utils",
          ],
        },
      ],
      customCss: [
        "./src/content/style.css",
      ],
      components: {
        TableOfContents: "./components/TableOfContents.astro",
      },
    }),
  ],
})
