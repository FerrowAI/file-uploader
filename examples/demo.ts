import { InMemoryDriver, UploadPipeline, sanitizeFilename } from '../src/index';

async function main(): Promise<void> {
  const driver = new InMemoryDriver();
  const pipeline = new UploadPipeline(driver);

  // 1. Valid PNG magic bytes -> accepted.
  const pngBuffer = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from('fake-png-body-for-demo'),
  ]);
  const result1 = await pipeline.upload('photo.png', pngBuffer, { allowedTypes: ['png', 'jpg'], dedup: true });
  console.log(`valid png accepted: key=${result1.key} sniffed=${result1.sniffedType}`);

  // 2. Spoofed extension (named .png, content is plain text) -> rejected by magic-byte sniffing.
  const fakeBuffer = Buffer.from('just some text pretending to be a png');
  try {
    await pipeline.upload('fake.png', fakeBuffer, { allowedTypes: ['png', 'jpg'] });
    console.log('spoofed extension accepted (this would be a bug)');
  } catch (err) {
    console.log(`spoofed extension rejected: ${(err as Error).message}`);
  }

  // 3. Path traversal in the filename -> sanitized to a bare, safe filename.
  console.log(`traversal filename sanitized: "../../etc/passwd" -> "${sanitizeFilename('../../etc/passwd')}"`);

  // 4. Uploading identical content again -> dedup hit, same key returned.
  const result2 = await pipeline.upload('photo-copy.png', pngBuffer, { allowedTypes: ['png', 'jpg'], dedup: true });
  console.log(`dedup hit: deduped=${result2.deduped} sameKey=${result2.key === result1.key}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
