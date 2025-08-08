-- Add PDF metadata columns to audit_reports table
ALTER TABLE "audit_reports" ADD COLUMN "pdf_file_size" INTEGER;
ALTER TABLE "audit_reports" ADD COLUMN "pdf_filename" TEXT;
ALTER TABLE "audit_reports" ADD COLUMN "pdf_stored_at" TIMESTAMP(3);

-- Create index on pdf_stored_at for performance
CREATE INDEX "audit_reports_pdf_stored_at_idx" ON "audit_reports"("pdf_stored_at");
