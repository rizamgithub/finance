"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type TransactionType,
} from "@/lib/categories";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";

function dateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type TransactionFormInitial = {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: Date;
  note: string | null;
};

type Props = {
  mode?: "create" | "edit";
  initial?: TransactionFormInitial;
  onDone?: () => void;
  incomeCategories?: readonly string[];
  expenseCategories?: readonly string[];
};

export function TransactionForm({
  mode = "create",
  initial,
  onDone,
  incomeCategories,
  expenseCategories,
}: Props) {
  const incomeOpts = incomeCategories ?? INCOME_CATEGORIES;
  const expenseOpts = expenseCategories ?? EXPENSE_CATEGORIES;
  const optionsFor = (t: TransactionType) =>
    t === "INCOME" ? incomeOpts : expenseOpts;
  const [type, setType] = useState<TransactionType>(initial?.type ?? "EXPENSE");
  const [category, setCategory] = useState<string>(
    initial?.category ?? optionsFor(initial?.type ?? "EXPENSE")[0] ?? "",
  );
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : "",
  );
  const [date, setDate] = useState(
    dateInputValue(initial ? new Date(initial.date) : new Date()),
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [pending, startTransition] = useTransition();

  function handleTypeChange(next: TransactionType) {
    setType(next);
    const allowed = optionsFor(next);
    if (!allowed.includes(category)) {
      setCategory(allowed[0] ?? "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    const payload = {
      type,
      category,
      amount: amt,
      date: new Date(date),
      note: note || null,
    };
    startTransition(async () => {
      const res =
        mode === "edit" && initial
          ? await updateTransaction(initial.id, payload)
          : await createTransaction(payload);
      if (res.ok) {
        toast.success(mode === "edit" ? "Transaction updated" : "Transaction added");
        if (mode === "create") {
          setAmount("");
          setNote("");
        }
        onDone?.();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={(v) => handleTypeChange(v as TransactionType)}>
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {optionsFor(type).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (RM)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., groceries at Tesco"
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
