const sensitiveKeys = /token|password|secret|code|authorization|phone|email/i;

export function safeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, sensitiveKeys.test(key) ? "[REDACTED]" : value]),
  );
}