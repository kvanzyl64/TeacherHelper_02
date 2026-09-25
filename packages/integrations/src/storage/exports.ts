export type ExportStorageReference = {
  bucket: string;
  key: string;
  signedUrl?: string;
  expiresAt?: Date;
};

export function createExportStorageReference(input: {
  bucket: string;
  key: string;
  expiresAt?: Date;
}): ExportStorageReference {
  return {
    bucket: input.bucket,
    key: input.key,
    expiresAt: input.expiresAt,
  };
}
