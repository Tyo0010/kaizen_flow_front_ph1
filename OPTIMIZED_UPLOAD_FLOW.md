# Optimized File Upload Flow Documentation

## Overview

The file upload system has been optimized to prevent unnecessary AI processing costs. The system now uses **precise billing calculations** and **deferred processing** to ensure efficiency.

## Key Improvements

1. **🎯 Precise Billing**: Downloads and analyzes actual files for exact page calculations
2. **💰 Cost Optimization**: AI processing only starts AFTER usage validation passes
3. **🔒 Usage Protection**: Prevents overages with exact calculations before processing
4. **⚡ Efficient Resource Usage**: No wasted AI processing on files that exceed limits

---

## Upload Methods

### Method 1: Direct Upload (≤ 5MB)

**Unchanged** - immediate processing after upload

### Method 2: Presigned URL Upload

**Optimized** - 3-step flow with deferred processing

---

## Optimized Presigned URL Flow

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
      "filename": "large_document.pdf",
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
      "filename": "large_document.pdf",
      "upload_url": "https://s3.amazonaws.com/...",
      "s3_key": "companies/123/users/456/documents/session/file.pdf",
      "unique_filename": "uuid-generated-name.pdf"
    }
  ],
  "validation_required": true,
  "note": "Files uploaded via these URLs will NOT be processed until usage validation is confirmed via /upload-confirm"
}
```

**What happens internally:**

- ✅ Basic validation (file types, format exists, not already over limit)
- ✅ Creates `.pending_validation` marker in S3
- ⚠️ **NO AI processing triggered yet**

---

### Step 2: Upload to S3

Upload files directly to S3 using the presigned URLs.

**Important:**

- Files are stored in S3 but **NOT processed**
- No `.batch_complete` signal is sent yet
- AI handler remains idle

---

### Step 3: Confirm Upload & Trigger Processing

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
      "filename": "large_document.pdf",
      "size": 15728640
    }
  ]
}
```

#### Response (Success)

```json
{
  "message": "Confirmed 1 document(s) successfully",
  "upload_session_id": "20240127_143022_123",
  "created_documents": [...],
  "completion_signal_sent": true,
  "summary": {
    "total_pages_consumed": 47  // PRECISE calculation
  },
  "usage_info": {
    "pages_consumed_this_upload": 47,
    "monthly_usage": 547,
    "monthly_limit": 1000
  }
}
```

#### Response (Usage Limit Exceeded)

```json
{
  "error": "Monthly page limit exceeded",
  "usage_info": {
    "current_usage": 950,
    "monthly_limit": 1000,
    "pages_calculated": 75, // PRECISE calculation
    "would_total": 1025
  },
  "message": "Precise calculation shows 75 pages, which would exceed your monthly limit of 1000 pages."
}
```

**What happens internally:**

1. 🔍 **Downloads each file from S3**
2. 🧮 **Calculates PRECISE pages** (PDF pages, Excel cells, Word words, etc.)
3. ✅ **Validates against usage limits**
4. 🗃️ **Creates document metadata**
5. 📊 **Updates usage tracking**
6. 🚀 **ONLY THEN triggers AI processing** by uploading `.batch_complete`

---

## Key Benefits

### 1. **Cost Optimization**

- **Before**: AI processing started immediately, wasted on files exceeding limits
- **After**: AI processing only starts after successful usage validation

### 2. **Precise Billing**

- **Before**: Estimated pages based on file size (inaccurate)
- **After**: Downloads and analyzes actual content for exact billing

### 3. **Better User Experience**

- Clear feedback on exact page consumption
- No surprise overages
- Transparent billing

### 4. **Resource Efficiency**

- No wasted AI processing cycles
- Better cost control
- Predictable resource usage

---

## Error Scenarios

### Usage Limit Exceeded After Precise Calculation

If the precise calculation shows the files would exceed the user's limit:

1. ❌ Document metadata is **NOT created**
2. ❌ Usage is **NOT updated**
3. ❌ AI processing is **NOT triggered**
4. ✅ Files remain in S3 (user can delete manually or they'll expire)
5. ✅ Clear error message with exact page counts

### File Analysis Failure

If a file cannot be analyzed for billing:

1. ❌ That specific file is marked as failed
2. ✅ Other files in the batch continue processing
3. ✅ Detailed error information provided

---

## Technical Implementation Details

### S3 Markers

- `.pending_validation`: Created during presigned URL generation
- `.batch_complete`: Created only after successful usage validation

### Precise Calculation Methods

- **PDF**: PyPDF2 page count
- **Excel**: openpyxl/xlrd cell count ÷ 500
- **Word**: python-docx word count ÷ 500
- **Images**: 1 page per image
- **Text**: Word count ÷ 500

### Processing Flow

```
Presigned URL → S3 Upload → [Files in S3 but NOT processing]
                                    ↓
Upload Confirm → Download & Analyze → Usage Check → AI Processing Trigger
```

---

## Frontend Implementation Notes

1. **Handle Validation Response**: Check `validation_required: true` in presigned URL response
2. **Mandatory Confirmation**: Always call `/upload-confirm` after S3 upload
3. **Error Handling**: Handle usage limit errors gracefully
4. **Progress Indication**: Show users that files are uploaded but awaiting validation
5. **Clear Messaging**: Explain that processing starts after confirmation

This optimized flow ensures both cost efficiency and billing accuracy while maintaining a smooth user experience.
