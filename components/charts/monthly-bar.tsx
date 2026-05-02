"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMYR } from "@/lib/format";

type Bucket = { key: string; income: number; expense: number };

export function MonthlyBar({ data }: { data: Bucket[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="key" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip formatter={(v: number) => formatMYR(v)} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" name="Income" />
        <Bar dataKey="expense" fill="#ef4444" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}
