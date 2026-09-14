CREATE TYPE "ActivityKind" AS ENUM ('LOGIN', 'COMPANY_CREATED', 'COMPANY_VIEWED');

CREATE TABLE "ActivityEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyId" TEXT,
  "kind" "ActivityKind" NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuthThrottle" (
  "key" TEXT NOT NULL,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminAuthThrottle_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "ActivityEvent_kind_createdAt_idx" ON "ActivityEvent"("kind", "createdAt");
CREATE INDEX "ActivityEvent_userId_kind_createdAt_idx" ON "ActivityEvent"("userId", "kind", "createdAt");
CREATE INDEX "ActivityEvent_companyId_kind_createdAt_idx" ON "ActivityEvent"("companyId", "kind", "createdAt");

ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityEvent" ADD CONSTRAINT "ActivityEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
