"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TransactionType,
} from "@/lib/categories";

const CategoryInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(40, "Name too long"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function ensureSeeded() {
  const count = await prisma.category.count();
  if (count > 0) return;
  await prisma.category.createMany({
    data: [
      ...EXPENSE_CATEGORIES.map((name) => ({ name, type: "EXPENSE" })),
      ...INCOME_CATEGORIES.map((name) => ({ name, type: "INCOME" })),
    ],
  });
}

export async function listCategories() {
  await ensureSeeded();
  return prisma.category.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function listCategoriesByType(type: TransactionType) {
  await ensureSeeded();
  return prisma.category.findMany({
    where: { type },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(
  input: unknown,
): Promise<CategoryActionResult> {
  const parsed = CategoryInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const exists = await prisma.category.findUnique({
    where: { name_type: { name: parsed.data.name, type: parsed.data.type } },
  });
  if (exists) {
    return { ok: false, error: "Category already exists" };
  }
  await prisma.category.create({ data: parsed.data });
  revalidatePath("/categories");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/");
  return { ok: true };
}
