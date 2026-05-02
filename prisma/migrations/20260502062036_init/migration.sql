-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "GoldHolding" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "weightGrams" REAL NOT NULL DEFAULT 0,
    "lastKnownPrice" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
