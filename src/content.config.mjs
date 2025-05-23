import { defineCollection } from "astro:content"
import { docsLoader } from "@astrojs/starlight/loaders"
import { docsSchema } from "@astrojs/starlight/schema"

/**
 * @private
 */
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
}
