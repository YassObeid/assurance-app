-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GM', 'REGION_MANAGER', 'DELEGATE');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionManager" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegionManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delegate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "regionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delegate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "cin" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "delegateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RegionManager_userId_key" ON "RegionManager"("userId");

-- CreateIndex
CREATE INDEX "RegionManager_regionId_idx" ON "RegionManager"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Delegate_userId_key" ON "Delegate"("userId");

-- CreateIndex
CREATE INDEX "Delegate_regionId_idx" ON "Delegate"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cin_key" ON "Member"("cin");

-- CreateIndex
CREATE INDEX "Member_delegateId_idx" ON "Member"("delegateId");

-- AddForeignKey
ALTER TABLE "RegionManager" ADD CONSTRAINT "RegionManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionManager" ADD CONSTRAINT "RegionManager_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegate" ADD CONSTRAINT "Delegate_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delegate" ADD CONSTRAINT "Delegate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Delegate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
