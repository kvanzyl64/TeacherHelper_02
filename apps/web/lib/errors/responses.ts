export const unauthorizedResponse = {
  status: 404,
  body: { error: "The requested resource is unavailable" },
} as const;

export function classifyError(error: unknown): "validation" | "unauthorized" | "internal" {
  if (error instanceof Error && error.name === "ValidationError") return "validation";
  if (error instanceof Error && error.message.includes("authorized")) return "unauthorized";
  return "internal";
}