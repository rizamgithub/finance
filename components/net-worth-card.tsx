import { Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMYR } from "@/lib/format";

type Props = {
  cashBalance: number;
  goldValue: number;
};

export function NetWorthCard({ cashBalance, goldValue }: Props) {
  const total = cashBalance + goldValue;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Landmark className="h-4 w-4" /> Net worth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">
          {formatMYR(total)}
        </div>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Cash balance</span>
            <span className="font-medium text-foreground">{formatMYR(cashBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Gold value</span>
            <span className="font-medium text-foreground">{formatMYR(goldValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
