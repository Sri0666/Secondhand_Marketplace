import { NextResponse } from "next/server";
import { addListingToCatalogue } from "@/lib/catalogue";
import { generateListingTags, validateAiTags } from "@/lib/generate-listing-tags";
import { listingId, persistListing, validateNewListing } from "@/lib/listing-store";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Expected a listing JSON body." }, { status: 400 }); }
  try {
    const input = validateNewListing(body);
    // An imported/migrated listing may already have persisted tags; do not regenerate them.
    const aiTags = Array.isArray(input.aiTags) ? validateAiTags(input.aiTags) : await generateListingTags(input);
    const listing: Product = { ...input, id: listingId(input), aiTags };
    const saved = await persistListing(listing);
    addListingToCatalogue(saved);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create listing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
