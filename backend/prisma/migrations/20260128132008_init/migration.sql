-- CreateTable
CREATE TABLE "classifiers" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name_uz" TEXT,
    "name_ru" TEXT,
    "name_en" TEXT,
    "name_uzc" TEXT,
    "parent_code" TEXT,
    "level" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "classifiers_parent_code_fkey" FOREIGN KEY ("parent_code") REFERENCES "classifiers" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monthly_indices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classifier_code" TEXT NOT NULL,
    "period" DATETIME NOT NULL,
    "index_value" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "monthly_indices_classifier_code_fkey" FOREIGN KEY ("classifier_code") REFERENCES "classifiers" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingestion_runs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source_url" TEXT NOT NULL,
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "rows_loaded" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT
);

-- CreateIndex
CREATE INDEX "monthly_indices_classifier_code_period_idx" ON "monthly_indices"("classifier_code", "period");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_indices_classifier_code_period_key" ON "monthly_indices"("classifier_code", "period");
