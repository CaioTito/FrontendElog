export interface OdometerDataItem {
  vehicleIdTms: string;
  operationName: string;
  divisionName: string;
  licensePlate: string;
  odometerKm: number;
  speed: number;
  moving: boolean;
  ignitionStatus: string;
  driverName: string;
  dateProcess: string;
}

export interface OdometerApiResponse {
  data: OdometerDataItem[]; // Array de itens do hodômetro
  totalItems: number;
}