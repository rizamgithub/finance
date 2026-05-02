import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMYR } from "@/lib/format";

type Props = {
  income: number;
  expense: number;
  net: number;
};

export function SummaryCard({ income, expense, net }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="h-4 w-4" /> This month
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Income
          </span>
          <span className="font-medium text-emerald-600">{formatMYR(income)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-rose-600" /> Expense
          </span>
          <span className="font-medium text-rose-600">{formatMYR(expense)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground">Net</span>
          <span
            className={`font-semibold ${
              net >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatMYR(net)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
