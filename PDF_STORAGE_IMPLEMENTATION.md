# PDF Storage Implementation for AI Audit System

## Overview

This implementation adds comprehensive PDF storage functionality to the AI Audit System. When the n8n webhook generates a PDF report, it automatically stores the PDF data in the database and links it back to the original audit submission.

## Architecture

### 1. Database Schema Updates

**New fields added to `audit_reports` table:**
- `pdf_file_size` (INTEGER) - Size of PDF file in bytes
- `pdf_filename` (TEXT) - Original filename of the PDF
- `pdf_stored_at` (TIMESTAMP) - When the PDF was stored in the database

### 2. API Endpoints

#### `/api/audit/webhook-response` (POST)
**Purpose:** Receives PDF data from n8n webhook and stores it in the database

**Expected Payload Format:**
```json
{
  "submissionId": "sub_1234567890_abcdef",
  "email": "user@example.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "business_overview": {
    "company_name": "TechStart Solutions",
    "industry": "Software Development"
  },
  "data": {
    "fileName": "Executive_Report.pdf",
    "fileExtension": "pdf",
    "mimeType": "application/pdf",
    "fileSize": 813000,
    "data": "JVBERi0xLjQKJcOkw7zDtsO4..." // Base64 encoded PDF data
  }
}
```

**Response:**
```json
{
  "success": true,
  "submissionId": "clx1234567890",
  "reportId": "clr9876543210",
  "pdfUrl": "/uploads/reports/1704447000000-Executive_Report.pdf",
  "pdfMetadata": {
    "filename": "Executive_Report.pdf",
    "fileSize": 813000,
    "mimeType": "application/pdf",
    "storedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "PDF successfully stored in database"
}
```

#### `/api/audit/reports` (GET)
**Purpose:** Retrieve audit reports with PDF information

**Query Parameters:**
- `submissionId` - Get report by submission ID
- `email` - Get all reports for an email address
- `includeMetadata=true` - Include full report and form data

**Example Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": "clr9876543210",
      "submissionId": "clx1234567890",
      "companyName": "TechStart Solutions",
      "email": "user@example.com",
      "reportType": "comprehensive",
      "submissionStatus": "completed",
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "completedAt": "2024-01-15T10:30:00.000Z",
      "pdf": {
        "available": true,
        "url": "/uploads/reports/1704447000000-Executive_Report.pdf",
        "filename": "Executive_Report.pdf",
        "fileSize": 813000,
        "fileSizeFormatted": "813.0 KB",
        "storedAt": "2024-01-15T10:30:00.000Z"
      },
      "emailSent": true,
      "emailSentAt": "2024-01-15T10:31:00.000Z",
      "emailOpened": false,
      "emailOpenedAt": null
    }
  ],
  "count": 1,
  "message": "Found 1 audit report(s)"
}
```

#### `/api/audit/test-pdf-storage` (GET/POST)
**Purpose:** Testing and debugging PDF storage functionality

### 3. N8N Workflow Integration

The n8n workflow has been updated with a new "Store PDF in Database" node that:

1. **Extracts PDF data** from the Google Drive download
2. **Sends HTTP POST request** to `/api/audit/webhook-response`
3. **Includes all necessary metadata** for database storage
4. **Handles errors gracefully** with retry logic

**Node Configuration:**
- **Method:** POST
- **URL:** `https://ai-audit.nfluencehub.com/api/audit/webhook-response`
- **Timeout:** 30 seconds
- **Retry:** 3 attempts
- **Continue on Fail:** Yes (to ensure email still sends)

### 4. User Identification Strategy

The system uses multiple strategies to match PDF data with audit submissions:

1. **Primary:** Match by `submissionId` in form data
2. **Secondary:** Match by `email` + `company_name`
3. **Fallback:** Match by `company_name` + recent timestamp (within 24 hours)

### 5. File Storage

PDFs are stored in the file system at:
- **Directory:** `public/uploads/reports/`
- **Filename Format:** `{timestamp}-{original_filename}`
- **Public URL:** `/uploads/reports/{filename}`

### 6. Utility Functions

**New utility functions in `src/lib/utils.ts`:**
- `getAuditReportBySubmissionId()` - Retrieve report by submission ID
- `getAuditReportByEmail()` - Retrieve all reports for an email
- `formatFileSize()` - Format file size in human-readable format

## Usage Examples

### 1. Testing the Implementation

```bash
# Create a test submission
curl -X POST http://localhost:3000/api/audit/test-pdf-storage \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "companyName": "Test Company"}'

# Check recent submissions
curl http://localhost:3000/api/audit/test-pdf-storage
```

### 2. Retrieving Reports

```bash
# Get report by submission ID
curl "http://localhost:3000/api/audit/reports?submissionId=sub_1234567890_abcdef"

# Get all reports for an email
curl "http://localhost:3000/api/audit/reports?email=user@example.com"

# Get reports with full metadata
curl "http://localhost:3000/api/audit/reports?email=user@example.com&includeMetadata=true"
```

### 3. Simulating N8N Webhook

```bash
curl -X POST http://localhost:3000/api/audit/webhook-response \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "sub_1234567890_abcdef",
    "email": "user@example.com",
    "timestamp": "2024-01-15T10:30:00Z",
    "business_overview": {
      "company_name": "Test Company",
      "industry": "Technology"
    },
    "data": {
      "fileName": "Test_Report.pdf",
      "fileExtension": "pdf",
      "mimeType": "application/pdf",
      "fileSize": 100000,
      "data": "JVBERi0xLjQKJcOkw7zDtsO4..."
    }
  }'
```

## Database Migration

Run the following to add the new columns:

```bash
cd ai-audit-system
npx prisma migrate dev --name add_pdf_metadata
npx prisma generate
```

## Error Handling

The implementation includes comprehensive error handling:

- **Invalid PDF data:** Validates base64 format and PDF header
- **Missing submissions:** Multiple fallback strategies for user identification
- **File storage errors:** Graceful degradation if file system issues occur
- **Database errors:** Proper transaction handling and rollback
- **Network timeouts:** Retry logic in n8n workflow

## Security Considerations

- **File validation:** All PDF data is validated before storage
- **Path sanitization:** Filenames are sanitized to prevent directory traversal
- **Access control:** PDF URLs are served through public directory (consider adding authentication)
- **File size limits:** Consider adding file size limits for production use

## Monitoring and Logging

All operations are logged with appropriate detail levels:
- **Info:** Successful PDF storage operations
- **Error:** Failed validations, missing submissions, storage errors
- **Debug:** Detailed payload information and processing steps
