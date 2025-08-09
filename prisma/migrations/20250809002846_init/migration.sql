-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "employee_count_range" TEXT,
    "annual_revenue_range" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_submissions" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "submission_status" TEXT NOT NULL DEFAULT 'in_progress',
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "form_data" JSONB NOT NULL,
    "calculated_metrics" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "audit_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_reports" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'comprehensive',
    "report_data" JSONB NOT NULL,
    "pdf_url" TEXT,
    "pdf_data" BYTEA,
    "pdf_file_size" INTEGER,
    "pdf_filename" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "pdf_stored_at" TIMESTAMP(3),

    CONSTRAINT "audit_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "interaction_type" TEXT NOT NULL,
    "step_name" TEXT,
    "time_spent" INTEGER,
    "interaction_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_submissions_submission_status_idx" ON "audit_submissions"("submission_status");

-- CreateIndex
CREATE INDEX "audit_submissions_completed_at_idx" ON "audit_submissions"("completed_at");

-- CreateIndex
CREATE INDEX "audit_submissions_company_id_idx" ON "audit_submissions"("company_id");

-- CreateIndex
CREATE INDEX "audit_reports_generated_at_idx" ON "audit_reports"("generated_at");

-- CreateIndex
CREATE INDEX "audit_reports_opened_at_idx" ON "audit_reports"("opened_at");

-- CreateIndex
CREATE INDEX "audit_reports_pdf_stored_at_idx" ON "audit_reports"("pdf_stored_at");

-- CreateIndex
CREATE INDEX "user_interactions_submission_id_interaction_type_idx" ON "user_interactions"("submission_id", "interaction_type");

-- AddForeignKey
ALTER TABLE "audit_submissions" ADD CONSTRAINT "audit_submissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "audit_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "audit_submissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
