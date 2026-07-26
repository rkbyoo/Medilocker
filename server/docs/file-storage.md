# File Storage Documentation

## Overview
Medical report files (lab results, imaging, scans, documents) are attached to patient visits as **URL references** stored in the `reports` table. The file URL points to wherever the file is actually hosted (e.g., a cloud bucket, a hospital's internal storage server, or a direct upload endpoint).

> **Current Implementation:** The `reports` table stores `file_url TEXT` — a URL string pointing to the hosted file. The server does **not** act as a file hosting service itself. File upload/download infrastructure (e.g., cloud storage, a separate upload server) is configured separately per deployment.

## Database Schema

### `reports` Table (Prisma Schema)
```prisma
model Report {
  report_id   String   @id @default(uuid())
  visit_id    String
  file_url    String   @db.Text   // URL pointing to the hosted file
  file_name   String?             // Optional display name
  file_type   String?             // e.g. "pdf", "image/jpeg"
  description String?
  uploaded_at DateTime @default(now())

  visit Visit @relation(fields: [visit_id], references: [visit_id])
}
```

## Supported File Types

### Common Medical Documents
- **PDF**: Medical reports, lab results, prescriptions, radiology reports
- **JPEG / PNG**: X-rays, scan images, photos
- **DICOM**: Medical imaging standard (if your storage layer supports it)

## API Endpoints

### Attach a Report URL to a Visit
```http
POST /api/visits/:visitId/reports
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "file_url": "https://storage.your-domain.com/reports/patient-123/xray-2025.pdf",
  "file_name": "Chest X-Ray Jan 2025",
  "file_type": "application/pdf",
  "description": "Chest X-Ray — Radiology Department"
}
```

### Get Reports for a Visit
```http
GET /api/visits/:visitId
Authorization: Bearer <access_token>

// Response includes:
{
  "visit_id": "uuid",
  "diagnosis": "...",
  "reports": [
    {
      "report_id": "uuid",
      "file_url": "https://...",
      "file_name": "Chest X-Ray",
      "file_type": "application/pdf",
      "uploaded_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Mobile App — PDF Viewing (Flutter)

In the Flutter mobile app (`app-client/`), patients can view PDF reports using the **Syncfusion PDF Viewer** package:

```dart
// Using syncfusion_flutter_pdfviewer to open a report URL
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';

SfPdfViewer.network(
  report.fileUrl,
  headers: {'Authorization': 'Bearer $accessToken'},
)
```

Prescription PDFs are generated on-device using the `pdf` + `printing` packages — they do **not** require a file upload endpoint.

## File Storage Options for Deployment

Since the server only stores a URL reference, you can host files using any of the following:

| Option | Description |
|--------|-------------|
| **Cloud Storage (AWS S3, GCP GCS, Azure Blob)** | Recommended for production. Generate a signed upload URL and store the resulting public/pre-signed URL. |
| **Cloudinary** | Simple media hosting with image transformation support. |
| **Hospital's own server** | Files hosted on a local NAS or internal server; URL points to that server. |
| **Supabase Storage** | Convenient if already using Supabase as a PostgreSQL host. |

## Security Considerations

- **Access Control**: Since the server only stores URLs, access control for the files themselves is enforced at the storage layer (e.g., S3 bucket policy, signed URLs).
- **Signed URLs**: For sensitive medical files, use pre-signed URLs (with short expiry) so that files are not publicly accessible without authentication.
- **Patient Privacy**: Only the patient's own reports and reports from authorized doctors should be accessible. Enforce this via the JWT auth + RBAC middleware in the Express API.
- **Audit Trail**: All `visit` and `report` access is logged in `access_logs`.

## Notes
- Reports are always linked to a `visit` — standalone file uploads are not supported without a visit context.
- The `file_url` field is a plain `TEXT` column — no size limit enforced at the DB level, but keep URLs reasonable in length.
- Deleting a report record from the DB does **not** delete the actual file from external storage — that must be handled separately in your storage layer.