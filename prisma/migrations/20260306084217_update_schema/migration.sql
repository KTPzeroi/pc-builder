-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "pcBuildId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_pcBuildId_fkey" FOREIGN KEY ("pcBuildId") REFERENCES "PCBuild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
