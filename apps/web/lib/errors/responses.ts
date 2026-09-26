export const unauthorizedResponse = {
  status: 404,
  body: { error: "The requested resource is unavailable" },
} as const;

export function classifyError(error: unknown): "validation" | "unauthorized" | "internal" {
  if (error instanceof Error) {
    const message = `${error.name} ${error.message}`.toLowerCase();
    if (message.includes("validationerror") || message.includes("invalid")) return "validation";
    if (message.includes("authorized") || message.includes("permission") || message.includes("unavailable")) return "unauthorized";
  }
  return "internal";
}