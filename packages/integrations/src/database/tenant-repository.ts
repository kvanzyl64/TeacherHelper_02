export type TenantCentreSummary = {
  centreId: string;
  name: string;
  status: string;
};

export type TenantStudentSummary = {
  id: string;
  reference: string;
  name: string;
  enrolmentStatus: string;
};

export interface TenantRepository {
  getCurrentCentre(): Promise<TenantCentreSummary>;
  listStudents(): Promise<readonly TenantStudentSummary[]>;
}