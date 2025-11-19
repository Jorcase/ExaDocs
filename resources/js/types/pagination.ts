export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Pagination {
  links: PaginationLink[];
  total: number;
  from: number;
  to: number;
}
