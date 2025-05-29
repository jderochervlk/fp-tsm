import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

export default defineConfig({
  site: "https://jderochervlk.github.io",
  base: "/fp-tsm/",
  integrations: [
    starlight({
      title: "fp-tsm",
      sidebar: [
        { slug: "getting-started" },
        {
          label: "Data Types",
          items: [
            "data-types/option",
            "data-types/result",
            "data-types/either",
          ],
        },
        {
          label: "functions",
          items: ["functions/utility", "functions/array", "functions/record"],
        },
      ],
      customCss: [
        "./src/content/style.css",
      ],
    }),
  ],
})
