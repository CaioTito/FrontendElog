export interface OdometerRequest {
  StartDate?: string;
  EndDate?: string;
  IdTms?: string;
  LicensePlate?: string;
  DivisionId?: string;
  Rows: number;
  Page: number;
}