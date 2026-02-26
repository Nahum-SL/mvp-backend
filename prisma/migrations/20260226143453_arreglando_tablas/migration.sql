/*
  Warnings:

  - The `status` column on the `JobApplication` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `IntranetLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `JobApplication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobAppStatus" AS ENUM ('PENDIENTE', 'REVISADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "IntranetLink" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "JobAppStatus" NOT NULL DEFAULT 'PENDIENTE';
