import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://jderochervlk.github.io",
  base: "/",
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
            "arrays/types",
            "arrays/creating",
            "arrays/mapping",
            "arrays/filtering",
            "arrays/folding",
            "arrays/refining",
            "arrays/sequencing",
            "arrays/traversing",
            "arrays/utils",
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
