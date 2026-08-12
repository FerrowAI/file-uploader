# file-uploader

A storage-agnostic upload pipeline: you give it a `Buffer` and a filename, it
validates the content, dedups by hash if you want, generates a safe unique
filename, and stores it via a pluggable driver.

## What this is
- `StorageDriver` interface — `{ put, get, delete, exists }` — implement it
  for any backend (S3, GCS, whatever). Two are bundled: `LocalDiskDriver`
  (real `fs` calls, every key is resolved and checked to stay inside the
  root directory before touching disk — no path traversal) and
  `InMemoryDriver` (for tests/demos).
- Validation: `maxSizeBytes`, and `allowedTypes` checked against **real
  magic-byte signatures** for `png`, `jpg`, `gif`, `pdf`, `zip` — never the
  filename extension.
- `sanitizeFilename()` / `uniqueFilename()` — strips directory components
  (`path.basename`), restricts to a safe character set, appends a random
  suffix so uploads never collide.
- `sha256()` content hashing, with an optional dedup mode on `UploadPipeline`
  that returns the existing key instead of storing a repeat.

## What this is NOT
- **No multipart/form-data parsing.** That's your HTTP framework's job
  (busboy, formidable, `req.formData()` — whatever you're already using).
  This pipeline starts from an already-extracted `Buffer`.
- Not a CDN or image-processing service — no resizing, no transforms.
- Not a virus scanner — magic-byte sniffing proves file *type*, not safety.

## Quickstart

```bash
npm install
npm run build
node dist/examples/demo.js
```

## API

```ts
import { UploadPipeline, LocalDiskDriver, InMemoryDriver } from 'file-uploader';

const driver = new LocalDiskDriver('./uploads'); // or new InMemoryDriver()
const pipeline = new UploadPipeline(driver);

const result = await pipeline.upload('photo.png', buffer, {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ['png', 'jpg'],
  dedup: true,
});
// { key: 'photo-a1b2c3d4e5f6.png', sniffedType: 'png', hash: '...', deduped: false }
```

### Demo

```
$ node dist/examples/demo.js
valid png accepted: key=photo-39c8bccc55de4ca2.png sniffed=png
spoofed extension rejected: file content sniffed as "unknown", not in allowed list [png, jpg]
traversal filename sanitized: "../../etc/passwd" -> "passwd"
dedup hit: deduped=true sameKey=true
```

## License
MIT

---
Sponsored by [Ferrow](https://ferrow.ai)

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
