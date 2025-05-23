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
        { label: "Data Types", items: ["data-types/option"] },
        { label: "functions", items: ["functions/utility"] },
      ],
      customCss: [
        "./src/content/style.css",
      ],
    }),
  ],
})
