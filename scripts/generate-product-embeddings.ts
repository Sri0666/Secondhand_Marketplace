import { loadEnvConfig } from "@next/env";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import OpenAI from "openai";
import { products } from "../lib/catalogue";
import { productToSearchableText } from "../lib/product-search-text";

loadEnvConfig(process.cwd());

async function main() {
  const model = process.env.CLASSGW_EMBED_MODEL || "openai/text-embedding-3-small";
  const apiKey = process.env.CLASSGW_KEY;
  const baseURL = process.env.CLASSGW_BASE_URL;

  if (!apiKey || !baseURL) {
    throw new Error("Missing CLASSGW_KEY or CLASSGW_BASE_URL. Add both to .env.local before generating embeddings.");
  }

  const client = new OpenAI({ apiKey, baseURL });
  const response = await client.embeddings.create({
    model,
    input: products.map(productToSearchableText),
    encoding_format: "float",
  });

  if (response.data.length !== products.length || response.data.some(({ embedding }) => !embedding.length)) {
    throw new Error("The gateway returned an incomplete embedding response.");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    model,
    source: "data/products.json",
    products: products.map((product, index) => ({
      id: product.id,
      embedding: response.data[index].embedding,
    })),
  };

  const outputPath = join(process.cwd(), "data", "product-embeddings.json");
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Saved ${output.products.length} product embeddings to data/product-embeddings.json.`);
}

main().catch((error: unknown) => {
  console.error("Could not generate product embeddings.", error);
  process.exitCode = 1;
});
