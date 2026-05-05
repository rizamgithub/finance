import { prisma } from "@/lib/prisma";

const GOLD_ID = "default";

export type RefreshResult =
  | { ok: true; price: number }
  | { ok: false; reason: string; status?: number; detail?: string };

export async function fetchAndStoreGoldPrice(): Promise<RefreshResult> {
  const apiKey = process.env.GOLD_API_KEY;
  if (!apiKey) return { ok: false, reason: "no_api_key" };

  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/MYR", {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        ok: false,
        reason: "upstream_error",
        status: res.status,
        detail: text.slice(0, 300),
      };
    }

    const data = (await res.json()) as { price_gram_24k?: number };
    const price = data.price_gram_24k;
    if (typeof price !== "number" || !Number.isFinite(price)) {
      return { ok: false, reason: "bad_response" };
    }

    await prisma.goldHolding.upsert({
      where: { id: GOLD_ID },
      create: { id: GOLD_ID, weightGrams: 0, lastKnownPrice: price },
      update: { lastKnownPrice: price },
    });

    return { ok: true, price };
  } catch (err) {
    return {
      ok: false,
      reason: "fetch_failed",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function refreshGoldPriceIfStale(maxAgeMs: number) {
  const existing = await prisma.goldHolding.findUnique({ where: { id: GOLD_ID } });
  const isStale =
    !existing ||
    existing.lastKnownPrice <= 0 ||
    Date.now() - new Date(existing.updatedAt).getTime() > maxAgeMs;
  if (!isStale) return { refreshed: false as const };
  const result = await fetchAndStoreGoldPrice();
  return { refreshed: result.ok, result };
}
