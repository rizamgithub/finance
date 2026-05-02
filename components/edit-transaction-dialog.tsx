"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TransactionForm,
  type TransactionFormInitial,
} from "@/components/transaction-form";
import type { TransactionType } from "@/lib/categories";

type Row = {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: Date;
  note: string | null;
};

export function EditTransactionDialog({ transaction }: { transaction: Row }) {
  const [open, setOpen] = useState(false);

  const initial: TransactionFormInitial = {
    id: transaction.id,
    type: transaction.type as TransactionType,
    category: transaction.category,
    amount: transaction.amount,
    date: new Date(transaction.date),
    note: transaction.note,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit transaction">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit transaction</DialogTitle>
          <DialogDescription>
            Update the details and save your changes.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          mode="edit"
          initial={initial}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
