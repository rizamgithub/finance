import { PieChart as PieChartIcon, BarChart3, ListChecks, PlusCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionList } from "@/components/transaction-list";
import { SummaryCard } from "@/components/summary-card";
import { NetWorthCard } from "@/components/net-worth-card";
import { GoldCard } from "@/components/gold-card";
import { CategoryPie } from "@/components/charts/category-pie";
import { MonthlyBar } from "@/components/charts/monthly-bar";
import {
  listTransactions,
  getMonthlySummary,
  getCashBalance,
  getCategoryBreakdown,
  getMonthlyTrend,
} from "@/app/actions/transactions";
import { getGoldHolding } from "@/app/actions/gold";
import { listCategories } from "@/app/actions/categories";
import { refreshGoldPriceIfStale } from "@/lib/gold-price";

export const dynamic = "force-dynamic";

const ONE_HOUR_MS = 60 * 60 * 1000;

export default async function HomePage() {
  await refreshGoldPriceIfStale(ONE_HOUR_MS);

  const [
    transactions,
    summary,
    cashBalance,
    categoryBreakdown,
    monthlyTrend,
    gold,
    categories,
  ] = await Promise.all([
    listTransactions(50),
    getMonthlySummary(),
    getCashBalance(),
    getCategoryBreakdown(),
    getMonthlyTrend(6),
    getGoldHolding(),
    listCategories(),
  ]);

  const goldValue = gold.weightGrams * gold.lastKnownPrice;
  const incomeCategories = categories
    .filter((c) => c.type === "INCOME")
    .map((c) => c.name);
  const expenseCategories = categories
    .filter((c) => c.type === "EXPENSE")
    .map((c) => c.name);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
      <header className="flex items-center gap-3">
        <Logo className="h-9 w-9" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gold &amp; Finance Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Local-first dashboard for cash flow and physical gold (MYR).
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NetWorthCard cashBalance={cashBalance} goldValue={goldValue} />
        <SummaryCard
          income={summary.income}
          expense={summary.expense}
          net={summary.net}
        />
        <GoldCard
          weightGrams={gold.weightGrams}
          lastKnownPrice={gold.lastKnownPrice}
          updatedAt={gold.updatedAt}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChartIcon className="h-4 w-4" /> Spending by category (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPie data={categoryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Income vs expense (last 6 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBar data={monthlyTrend} />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlusCircle className="h-4 w-4" /> Add transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4" /> Recent transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={transactions}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
