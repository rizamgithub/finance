import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const GOLD_ID = "default";

export async function POST() {
  const apiKey = process.env.GOLD_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: "no_api_key" });
  }

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
      return NextResponse.json(
        { ok: false, reason: "upstream_error", status: res.status, detail: text.slice(0, 300) },
        { status: 200 },
      );
    }

    const data = (await res.json()) as { price_gram_24k?: number };
    const price = data.price_gram_24k;
    if (typeof price !== "number" || !Number.isFinite(price)) {
      return NextResponse.json({ ok: false, reason: "bad_response" });
    }

    await prisma.goldHolding.upsert({
      where: { id: GOLD_ID },
      create: { id: GOLD_ID, weightGrams: 0, lastKnownPrice: price },
      update: { lastKnownPrice: price },
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, price });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      reason: "fetch_failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
