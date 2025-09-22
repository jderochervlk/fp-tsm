import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://jderochervlk.github.io",
  base: "/",
  integrations: [
    starlight({
      title: "fp-tsm",
      social: [{
        icon: "github",
        label: "GitHub",
        href: "https://github.com/jderochervlk/fp-tsm",
      }, {
        icon: "blueSky",
        label: "BlueSky",
        href: "https://bsky.app/profile/vlkpack.com",
      }],
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
          items: [
            {
              label: "Array",
              collapsed: true,
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
            "functions/json",
            "functions/number",
            "functions/record",
            "functions/string",
            "functions/utility",
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
