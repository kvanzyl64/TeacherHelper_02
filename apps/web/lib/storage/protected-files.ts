import {
  assertProtectedObjectAccess,
  createProtectedObjectPath,
  type ProtectedObject,
} from "@teacher-helper/integrations/src/storage/protected-path";

export function createPrivateFileReference(input: Omit<ProtectedObject, "objectId">): ProtectedObject {
  return createProtectedObjectPath(input);
}

export function authorizePrivateFile(input: {
  object: ProtectedObject;
  centreId: string;
  recordId: string;
}): void {
  assertProtectedObjectAccess({
    object: input.object,
    centreId: input.centreId,
    authorizedRecordId: input.recordId,
  });
}