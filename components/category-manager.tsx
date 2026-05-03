"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus } from "lucide-react";
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
import type { TransactionType } from "@/lib/categories";
import { createCategory, deleteCategory } from "@/app/actions/categories";

type Category = {
  id: string;
  name: string;
  type: string;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const expense = categories.filter((c) => c.type === "EXPENSE");
  const income = categories.filter((c) => c.type === "INCOME");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a category name");
      return;
    }
    startTransition(async () => {
      const res = await createCategory({ name: trimmed, type });
      if (res.ok) {
        toast.success("Category added");
        setName("");
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete category "${label}"? Existing transactions keep this label.`)) {
      return;
    }
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteCategory(id);
      setDeletingId(null);
      if (res.ok) toast.success("Category deleted");
      else toast.error(res.error);
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="cat-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <SelectTrigger id="cat-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Category name</Label>
          <Input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries"
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          <Plus className="mr-1 h-4 w-4" />
          {pending ? "Adding..." : "Add"}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryGroup
          title="Expense categories"
          items={expense}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
        <CategoryGroup
          title="Income categories"
          items={income}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}

function CategoryGroup({
  title,
  items,
  onDelete,
  deletingId,
}: {
  title: string;
  items: Category[];
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm font-medium">{title}</div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="divide-y">
          {items.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span>{c.name}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${c.name}`}
                disabled={deletingId === c.id}
                onClick={() => onDelete(c.id, c.name)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
