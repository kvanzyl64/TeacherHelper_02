export type StorageObject = { reference: string; contentType: string; sizeBytes: number };

export interface StorageProvider {
  put(input: { reference: string; content: Uint8Array; contentType: string }): Promise<StorageObject>;
  createSignedReadUrl(input: { reference: string; expiresInSeconds: number }): Promise<string>;
  delete(input: { reference: string }): Promise<void>;
}