-- CreateTable
CREATE TABLE "public"."InvoiceAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceAudit_stripeInvoiceId_key" ON "public"."InvoiceAudit"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "InvoiceAudit_userId_idx" ON "public"."InvoiceAudit"("userId");

-- AddForeignKey
ALTER TABLE "public"."InvoiceAudit" ADD CONSTRAINT "InvoiceAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
