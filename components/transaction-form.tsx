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
import { categoriesFor, type TransactionType } from "@/lib/categories";
import { createTransaction } from "@/app/actions/transactions";

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TransactionForm() {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [category, setCategory] = useState<string>(categoriesFor("EXPENSE")[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(categoriesFor(next)[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    startTransition(async () => {
      const res = await createTransaction({
        type,
        category,
        amount: amt,
        date: new Date(date),
        note: note || null,
      });
      if (res.ok) {
        toast.success("Transaction added");
        setAmount("");
        setNote("");
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
            {categoriesFor(type).map((c) => (
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
          {pending ? "Saving..." : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}
