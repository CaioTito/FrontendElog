export interface SimpleTableHeader {
  title: string;
  value: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

export interface CurrentTableOptionsInitialization {
  page: number;
  itemsPerPage: number;
  sortBy: any[]; // Pode ser mais específico se os valores de sortBy forem conhecidos
  sortDesc: boolean[];
  groupBy: any[]; // Pode ser mais específico se os valores de groupBy forem conhecidos
  groupDesc: boolean[];
  multiSort: boolean;
  mustSort: boolean;
} 