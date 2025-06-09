import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

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
          items: ["functions/utility", "functions/array", "functions/record"],
        },
      ],
      customCss: [
        "./src/content/style.css",
      ],
    }),
  ],
})
