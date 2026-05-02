export const EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Subscriptions",
  "Utilities",
  "Transport",
  "Entertainment",
  "Healthcare",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance"] as const;

export const ALL_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
] as const;

export type TransactionType = "INCOME" | "EXPENSE";

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
