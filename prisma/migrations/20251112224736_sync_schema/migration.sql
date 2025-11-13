/*
  Warnings:

  - You are about to drop the column `city` on the `Member` table. All the data in the column will be lost.
  - The `status` column on the `Member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `RegionManager` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,regionId,startAt]` on the table `RegionManager` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `managerId` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Delegate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."RegionManager_userId_key";

-- AlterTable
ALTER TABLE "Delegate" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "managerId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "city",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RegionManager" DROP COLUMN "createdAt",
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "public"."MemberStatus";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "delegateId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_memberId_idx" ON "Payment"("memberId");

-- CreateIndex
CREATE INDEX "Payment_delegateId_paidAt_idx" ON "Payment"("delegateId", "paidAt");

-- CreateIndex
CREATE INDEX "Delegate_managerId_idx" ON "Delegate"("managerId");

-- CreateIndex
CREATE INDEX "Region_name_idx" ON "Region"("name");

-- CreateIndex
CREATE INDEX "RegionManager_regionId_endAt_idx" ON "RegionManager"("regionId", "endAt");

-- CreateIndex
CREATE INDEX "RegionManager_userId_endAt_idx" ON "RegionManager"("userId", "endAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegionManager_userId_regionId_startAt_key" ON "RegionManager"("userId", "regionId", "startAt");

-- AddForeignKey
ALTER TABLE "Delegate" ADD CONSTRAINT "Delegate_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "RegionManager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Delegate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
