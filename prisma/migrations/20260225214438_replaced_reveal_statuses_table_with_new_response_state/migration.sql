/*
  Warnings:

  - You are about to drop the `reveal_statuses` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ResponseStatus" ADD VALUE 'REVEALED';

-- DropForeignKey
ALTER TABLE "reveal_statuses" DROP CONSTRAINT "reveal_statuses_moment_id_fkey";

-- DropForeignKey
ALTER TABLE "reveal_statuses" DROP CONSTRAINT "reveal_statuses_partner_id_fkey";

-- DropTable
DROP TABLE "reveal_statuses";
