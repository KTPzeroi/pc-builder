/*
  Warnings:

  - You are about to drop the column `readWriteSpeed` on the `Component` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Component" DROP COLUMN "readWriteSpeed",
ADD COLUMN     "chipset" TEXT,
ADD COLUMN     "coolingType" TEXT,
ADD COLUMN     "lengthMm" INTEGER,
ADD COLUMN     "maxCoolerHeight" INTEGER,
ADD COLUMN     "maxGpuLength" INTEGER,
ADD COLUMN     "psuFormFactor" TEXT,
ADD COLUMN     "readSpeed" INTEGER,
ADD COLUMN     "supportedMobo" TEXT,
ADD COLUMN     "tdp" INTEGER,
ADD COLUMN     "writeSpeed" INTEGER;

-- CreateTable
CREATE TABLE "PresetBuild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "description" TEXT,
    "components" JSONB NOT NULL,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresetBuild_pkey" PRIMARY KEY ("id")
);
