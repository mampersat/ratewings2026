-- AlterTable
ALTER TABLE "User" ADD COLUMN "trustedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trustedById_fkey" FOREIGN KEY ("trustedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
