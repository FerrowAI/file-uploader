# File Uploader

Secure file upload handler with S3/GCS support. For Ferrow document processing.

```javascript
const uploader = new FileUploader({ storage: 's3' });
const url = await uploader.upload(file);
```

## Features
- ✓ S3/GCS/Local storage
- ✓ Virus scanning
- ✓ Size limits
- ✓ Ferrow document agents

## License: MIT
## Examples
