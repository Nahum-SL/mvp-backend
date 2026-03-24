/*
  Warnings:

  - Added the required column `name` to the `contactos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contactos" ADD COLUMN     "name" TEXT NOT NULL;
