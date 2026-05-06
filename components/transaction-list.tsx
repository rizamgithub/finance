"use client";

import { useState, useTransition } from "react";
import { Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMYR } from "@/lib/format";
import { deleteTransaction } from "@/app/actions/transactions";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";

type Row = {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: Date;
  note: string | null;
};

export function TransactionList({
  transactions,
  incomeCategories,
  expenseCategories,
}: {
  transactions: Row[];
  incomeCategories?: readonly string[];
  expenseCategories?: readonly string[];
}) {
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<Row | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      await deleteTransaction(id);
      setToDelete(null);
      toast.success("Transaction deleted");
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No transactions yet. Add your first one above.
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Note</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[110px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => {
          const isIncome = t.type === "INCOME";
          return (
            <TableRow key={t.id}>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isIncome ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                  {isIncome ? "Income" : "Expense"}
                </span>
              </TableCell>
              <TableCell>{t.category}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(t.date).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {t.note ?? "—"}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  isIncome ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatMYR(t.amount)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <EditTransactionDialog
                    transaction={t}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() => setToDelete(t)}
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    <Dialog
      open={toDelete !== null}
      onOpenChange={(open) => {
        if (!open && !pending) setToDelete(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this transaction?</DialogTitle>
          <DialogDescription>
            {toDelete ? (
              <>
                {toDelete.type === "INCOME" ? "Income" : "Expense"} ·{" "}
                {toDelete.category} ·{" "}
                <span className="font-medium">{formatMYR(toDelete.amount)}</span>
                {" · "}
                {new Date(toDelete.date).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                . This cannot be undone.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setToDelete(null)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
