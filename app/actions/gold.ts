"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const GOLD_ID = "default";

const GoldInput = z.object({
  weightGrams: z.coerce.number().min(0),
  lastKnownPrice: z.coerce.number().min(0),
});

export async function getGoldHolding() {
  const existing = await prisma.goldHolding.findUnique({ where: { id: GOLD_ID } });
  if (existing) return existing;
  return prisma.goldHolding.create({
    data: { id: GOLD_ID, weightGrams: 0, lastKnownPrice: 0 },
  });
}

export async function setGoldHolding(input: unknown) {
  const parsed = GoldInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await prisma.goldHolding.upsert({
    where: { id: GOLD_ID },
    create: {
      id: GOLD_ID,
      weightGrams: parsed.data.weightGrams,
      lastKnownPrice: parsed.data.lastKnownPrice,
    },
    update: {
      weightGrams: parsed.data.weightGrams,
      lastKnownPrice: parsed.data.lastKnownPrice,
    },
  });
  revalidatePath("/");
  return { ok: true as const };
}
