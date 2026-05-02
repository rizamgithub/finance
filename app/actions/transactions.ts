"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TransactionInput = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  note: z.string().optional().nullable(),
});

export type CreateTransactionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createTransaction(
  input: unknown,
): Promise<CreateTransactionResult> {
  const parsed = TransactionInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await prisma.transaction.create({
    data: {
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: parsed.data.date,
      note: parsed.data.note || null,
    },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true as const };
}

export async function listTransactions(limit = 100) {
  return prisma.transaction.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
}

export async function getMonthlySummary(reference: Date = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
  });
  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.type === "INCOME") income += r.amount;
    else if (r.type === "EXPENSE") expense += r.amount;
  }
  return { income, expense, net: income - expense };
}

export async function getCashBalance() {
  const rows = await prisma.transaction.findMany();
  let balance = 0;
  for (const r of rows) {
    if (r.type === "INCOME") balance += r.amount;
    else if (r.type === "EXPENSE") balance -= r.amount;
  }
  return balance;
}

export async function getCategoryBreakdown(reference: Date = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  const rows = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: start, lt: end } },
  });
  const byCategory = new Map<string, number>();
  for (const r of rows) {
    byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + r.amount);
  }
  return Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));
}

export async function getMonthlyTrend(months = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: start } },
  });
  const buckets: { key: string; income: number; expense: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const key = d.toLocaleDateString("en-MY", { month: "short", year: "2-digit" });
    buckets.push({ key, income: 0, expense: 0 });
  }
  for (const r of rows) {
    const idx =
      (r.date.getFullYear() - start.getFullYear()) * 12 +
      (r.date.getMonth() - start.getMonth());
    if (idx >= 0 && idx < months) {
      if (r.type === "INCOME") buckets[idx].income += r.amount;
      else if (r.type === "EXPENSE") buckets[idx].expense += r.amount;
    }
  }
  return buckets;
}
