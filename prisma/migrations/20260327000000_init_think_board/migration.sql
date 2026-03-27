-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('IDEATION', 'TODO', 'IN_PROGRESS', 'IMPLEMENTED', 'GO_LIVE');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "summary" VARCHAR(280),
    "content" JSONB,
    "status" "TaskStatus" NOT NULL DEFAULT 'IDEATION',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "content" JSONB,
    "parentId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_status_order_idx" ON "Task"("status", "order");

-- CreateIndex
CREATE INDEX "Task_updatedAt_idx" ON "Task"("updatedAt");

-- CreateIndex
CREATE INDEX "Document_parentId_position_idx" ON "Document"("parentId", "position");

-- CreateIndex
CREATE INDEX "Document_updatedAt_idx" ON "Document"("updatedAt");

-- AddForeignKey
ALTER TABLE "Document"
ADD CONSTRAINT "Document_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "Document"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
