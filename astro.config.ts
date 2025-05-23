import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

export default defineConfig({
  integrations: [
    starlight({
      title: "fp-tsm",
      sidebar: [
        { slug: "getting-started" },
        { label: "Data Types", items: ["data-types/option"] },
        { label: "functions", items: ["functions/utility"] },
      ],
    }),
  ],
})
