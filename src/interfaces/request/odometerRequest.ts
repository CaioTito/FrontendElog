export interface OdometerRequest {
  StartDate?: string;
  EndDate?: string;
  IdTms?: string[];
  LicensePlate?: string[];
  DivisionId?: number[];
  Rows?: number;
  Page?: number;
}