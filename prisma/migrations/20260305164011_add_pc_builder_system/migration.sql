-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Component" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "socket" TEXT,
    "ramType" TEXT,
    "formFactor" TEXT,
    "capacity" INTEGER,
    "cpuSingleScore" INTEGER,
    "cpuMultiScore" INTEGER,
    "gpuScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PCBuild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cpuId" TEXT,
    "gpuId" TEXT,
    "ramId" TEXT,
    "motherboardId" TEXT,
    "storageId" TEXT,
    "psuId" TEXT,
    "caseId" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gamingScore" DOUBLE PRECISION,
    "workingScore" DOUBLE PRECISION,
    "renderScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PCBuild_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PCBuild" ADD CONSTRAINT "PCBuild_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
