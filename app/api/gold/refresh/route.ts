import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { fetchAndStoreGoldPrice } from "@/lib/gold-price";

export async function POST() {
  const result = await fetchAndStoreGoldPrice();
  if (result.ok) revalidatePath("/");
  return NextResponse.json(result);
}
