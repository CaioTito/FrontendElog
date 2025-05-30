export interface SimpleTableHeader {
  title: string;
  value: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
}

export interface CurrentTableOptionsInitialization {
  page: number;
  itemsPerPage: number;
  sortBy: any[]; 
  sortDesc: boolean[];
  groupBy: any[]; 
  groupDesc: boolean[];
  multiSort: boolean;
  mustSort: boolean;
} 