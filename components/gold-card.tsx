"use client";

import { useState, useTransition } from "react";
import { Coins, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMYR, formatGrams } from "@/lib/format";
import { setGoldHolding } from "@/app/actions/gold";

type Props = {
  weightGrams: number;
  lastKnownPrice: number;
  updatedAt: Date;
};

export function GoldCard({ weightGrams, lastKnownPrice, updatedAt }: Props) {
  const [grams, setGrams] = useState(String(weightGrams));
  const [price, setPrice] = useState(String(lastKnownPrice));
  const [savingPending, startSave] = useTransition();
  const [refreshing, setRefreshing] = useState(false);

  const totalValue = (Number(grams) || 0) * (Number(price) || 0);

  function save() {
    startSave(async () => {
      const res = await setGoldHolding({
        weightGrams: grams,
        lastKnownPrice: price,
      });
      if (res.ok) toast.success("Gold holding updated");
      else toast.error(res.error);
    });
  }

  async function refreshFromApi() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/gold/refresh", { method: "POST" });
      const data = (await res.json()) as
        | { ok: true; price: number }
        | { ok: false; reason: string; detail?: string };
      if (data.ok) {
        setPrice(String(data.price));
        toast.success(`Live price: ${formatMYR(data.price)} / g`);
      } else if (data.reason === "no_api_key") {
        toast.message("No GOLD_API_KEY set", {
          description:
            "Add GOLD_API_KEY=... to .env and restart to enable live prices. Manual price still works.",
        });
      } else {
        toast.error(`Refresh failed: ${data.reason}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="h-4 w-4" /> Gold portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-muted/30 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Total value
          </div>
          <div className="text-2xl font-semibold">{formatMYR(totalValue)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {formatGrams(Number(grams) || 0)} × {formatMYR(Number(price) || 0)} / g
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="grams">Weight (grams)</Label>
            <Input
              id="grams"
              type="number"
              step="0.0001"
              min="0"
              inputMode="decimal"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price per gram (RM)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={save} disabled={savingPending}>
            {savingPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={refreshFromApi}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh from API"}
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            Updated {new Date(updatedAt).toLocaleString("en-MY")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
