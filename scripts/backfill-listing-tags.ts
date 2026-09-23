import { loadEnvConfig } from "@next/env";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateListingTags } from "../lib/generate-listing-tags";
import type { Product } from "../lib/types";

loadEnvConfig(process.cwd());
const listingsPath = join(process.cwd(), "data", "products.json");

async function main() {
  const listings = JSON.parse(await readFile(listingsPath, "utf8")) as Array<Omit<Product, "aiTags"> & { aiTags?: unknown }>;
  let generated = 0;
  for (const listing of listings) {
    // Preserve every already-persisted value, including an intentionally empty array.
    if (Array.isArray(listing.aiTags)) continue;
    listing.aiTags = await generateListingTags(listing);
    generated += 1;
  }
  await writeFile(listingsPath, `${JSON.stringify(listings, null, 2)}\n`, "utf8");
  console.log(`Saved aiTags for ${generated} listing${generated === 1 ? "" : "s"}.`);
}

main().catch((error: unknown) => { console.error("Could not backfill listing tags.", error); process.exitCode = 1; });
