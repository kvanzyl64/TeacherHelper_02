export type TenantFixture = {
  centreId: string;
  userId: string;
  role: "owner" | "admin" | "tutor";
};

export function createIsolatedTenantFixtures(): { centreA: TenantFixture; centreB: TenantFixture } {
  return {
    centreA: { centreId: "centre-a", userId: "user-a", role: "admin" },
    centreB: { centreId: "centre-b", userId: "user-b", role: "admin" },
  };
}