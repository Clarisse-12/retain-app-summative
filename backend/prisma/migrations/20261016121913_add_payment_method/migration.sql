-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';
