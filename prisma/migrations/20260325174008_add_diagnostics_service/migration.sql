-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateTable
CREATE TABLE "business_diagnostics" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "ruc" VARCHAR(11),
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "responses" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "overallRisk" "RiskLevel" NOT NULL DEFAULT 'MEDIO',
    "source" TEXT DEFAULT 'radar_general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_diagnostics_pkey" PRIMARY KEY ("id")
);
