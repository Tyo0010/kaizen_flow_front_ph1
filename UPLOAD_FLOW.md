# File Upload Flow Documentation

## Overview

The file upload system now supports two methods:

1. **Direct Upload** (for files ≤ 5MB) - Original `/upload` endpoint
2. **Presigned URL Upload** (for files > 5MB) - New 3-step flow

## Method 1: Direct Upload (≤ 5MB)

### Endpoint

```
POST /api/documents/upload
```

### Request Format

```
Content-Type: multipart/form-data
```

**Form Fields:**

- `file` or `files`: File(s) to upload
- `format_id`: Output format ID

### Response

```json
{
  "message": "Document uploaded successfully",
  "document": { ... },
  "upload_session_id": "20240127_143022_123",
  "completion_signal_sent": true,
  "usage_info": { ... }
}
```

---

## Method 2: Presigned URL Upload

### Step 1: Request Presigned URLs

#### Endpoint

```
POST /api/documents/presigned-upload
```

#### Request Body

```json
{
  "files": [
    {
      "filename": "document.pdf",
      "content_type": "application/pdf",
      "size": 15728640
    }
  ],
  "format_id": "format-uuid-here"
}
```

#### Response

```json
{
  "upload_session_id": "20240127_143022_123",
  "presigned_urls": [
    {
      "filename": "document.pdf",
      "upload_url": "https://s3.amazonaws.com/...",
      "s3_key": "companies/123/users/456/documents/session/file.pdf",
      "unique_filename": "uuid-generated-name.pdf"
    }
  ]
}
```

#### Error Response (Validation Failed)

```json
{
  "error": "Monthly page limit exceeded",
  "usage_info": {
    "current_usage": 450,
    "monthly_limit": 500,
    "pages_requested": 75,
    "would_total": 525,
    "subscription_tier": "basic"
  },
  "message": "This upload would consume 75 pages, exceeding your monthly limit of 500 pages."
}
```

### Step 2: Upload to S3

#### Request

```
PUT {upload_url}
Content-Type: {content_type}
Content-Length: {exact_file_size}

[binary file data]
```

**Important:**

- Use the exact `upload_url` from Step 1
- Set `Content-Type` to match the original file
- Set `Content-Length` to the **exact** file size
- If size doesn't match exactly, S3 will reject the upload

#### Response

- **Success**: HTTP 200
- **Failure**: HTTP 4xx with error details

### Step 3: Confirm Upload

#### Endpoint

```
POST /api/documents/upload-confirm
```

#### Request Body

```json
{
  "upload_session_id": "20240127_143022_123",
  "format_id": "format-uuid-here",
  "files": [
    {
      "s3_key": "companies/123/users/456/documents/session/file.pdf",
      "filename": "document.pdf",
      "size": 15728640
    }
  ]
}
```

#### Response

```json
{
  "message": "Confirmed 1 document(s) successfully",
  "upload_session_id": "20240127_143022_123",
  "created_documents": [
    {
      "document_id": "doc-uuid-here",
      "document_name": "document.pdf",
      "processing_status": "uploaded",
      "pages_consumed": 32,
      ...
    }
  ],
  "failed_confirmations": [],
  "completion_signal_sent": true,
  "summary": {
    "total_files": 1,
    "successful_confirmations": 1,
    "failed_confirmations": 0,
    "total_pages_consumed": 32
  },
  "usage_info": {
    "pages_consumed_this_upload": 32,
    "monthly_usage": 482,
    "monthly_limit": 500,
    "remaining_pages": 18,
    "subscription_tier": "basic"
  }
}
```

---

## Error Handling

### Common Error Responses

#### File Type Not Allowed

```json
{
  "error": "File type not allowed: document.xyz",
  "status": 400
}
```

#### Usage Limit Exceeded

```json
{
  "error": "Monthly page limit exceeded",
  "status": 429,
  "usage_info": { ... }
}
```

#### File Not Found in S3 (Confirmation Step)

```json
{
  "error": "File not found in S3: NoSuchKey",
  "status": 400
}
```

#### Invalid Format

```json
{
  "error": "Invalid output format",
  "status": 400
}
```

---

## Validation Rules

### Pre-Upload Validations (Both Methods)

- ✅ User authentication
- ✅ File extension allowed
- ✅ Output format exists and active
- ✅ Usage limit check

### Presigned URL Additional Validations

- ✅ Exact file size enforcement via `Content-Length`
- ✅ Content type validation
- ✅ S3 file existence verification (confirmation step)

### Post-Upload Processing

- ✅ Document metadata creation
- ✅ Usage tracking update
- ✅ AI processing trigger (completion signal)

---

## Supported File Types

```
'pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'xls',
'jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'
```

---

## Notes for Frontend Implementation

1. **File Size Check**: Implement client-side file size check to determine which upload method to use
2. **Error Handling**: Handle validation errors from Step 1 before attempting S3 upload
3. **Progress Tracking**: For large files, consider implementing upload progress indicators
4. **Retry Logic**: Implement retry for failed S3 uploads in Step 2
5. **Timeout Handling**: S3 uploads can take longer than API calls - implement appropriate timeouts
6. **Security**: Never modify the presigned URL or its parameters
