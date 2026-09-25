export type ResourceVisibility = "guardian" | "restricted" | "internal";

export type SessionResource = {
  id: string;
  centreId: string;
  sessionId: string;
  name: string;
  storageReference: string;
  contentType: string;
  sizeBytes: number;
  visibility: ResourceVisibility;
  createdBy: string;
  createdAt: Date;
};

export type ResourceAccessContext = {
  relationshipActive: boolean;
  consentGranted: boolean;
  recordVisible: boolean;
};

export function validateResourceInput(input: Omit<SessionResource, "id" | "createdAt">): Omit<SessionResource, "id" | "createdAt"> {
  if (!input.centreId || !input.sessionId || !input.name || !input.storageReference) {
    throw new Error("The resource metadata is incomplete");
  }

  if (input.sizeBytes < 0) {
    throw new Error("The resource size must be non-negative");
  }

  return input;
}

export function canAccessResource(resource: SessionResource, context: ResourceAccessContext): boolean {
  return resource.visibility !== "internal" && context.relationshipActive && context.consentGranted && context.recordVisible;
}
