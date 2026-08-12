export class FileUploader {
  private storage: 's3' | 'local';
  constructor(options: { storage: string }) { this.storage = options.storage as any; }
  
  async upload(file: { name: string; data: Buffer }): Promise<string> {
    if (this.storage === 's3') {
      return `https://s3.amazonaws.com/bucket/${file.name}`;
    } else {
      return `/uploads/${file.name}`;
    }
  }
}
