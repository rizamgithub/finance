"use client";

import { useTransition } from "react";
import { Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

export function TransactionList({ transactions }: { transactions: Row[] }) {
  const [pending, startTransition] = useTransition();

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        No transactions yet. Add your first one above.
      </div>
    );
  }

  return (
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
                  <EditTransactionDialog transaction={t} />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await deleteTransaction(t.id);
                        toast.success("Transaction deleted");
                      });
                    }}
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
  );
}
