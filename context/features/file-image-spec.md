# File Upload with Filebase (S3-Compatible Storage)

## Overview

Add file and image upload functionality using Filebase S3-compatible storage.

## Filebase Configuration

- **Endpoint**: `https://s3.filebase.io`
- **Region**: `auto`
- **Signature Version**: `v4` (AWS4-HMAC-SHA256 only)
- **Protocol**: HTTPS-only on port 443
- **Rate Limit**: 500 requests per second

## Requirements

- Create upload API route using AWS SDK v3 with Filebase S3 endpoint
- Configure S3Client with Filebase endpoint, region `auto`, signature version `v4`
- Stick to lib/db/items.ts for prisma/db functions
- Create FileUpload component with drag-and-drop
- Update create item modal to use FileUpload for file/image types
- Delete files from Filebase when items are deleted
- Create download proxy API route (avoids CORS issues)
- Add download button in ItemDrawer for file types
- Show upload progress indicator
- Display image preview for images, file info for files

## File Constraints

| Type   | Max Size | Extensions                                            |
| ------ | -------- | ----------------------------------------------------- |
| Images | 5 MB     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`      |
| Files  | 10 MB    | `.pdf`, `.txt`, `.md`, `.json`, `.yaml`, `.yml`, `.xml`, `.csv`, `.toml`, `.ini` |

## MIME Types

**Images:**
- `image/png`
- `image/jpeg`
- `image/gif`
- `image/webp`
- `image/svg+xml`

**Files:**
- `application/pdf`
- `text/plain`
- `text/markdown`
- `application/json`
- `application/x-yaml`, `text/yaml`
- `application/xml`, `text/xml`
- `text/csv`
- `application/toml`
- `text/plain` (for `.ini`)
