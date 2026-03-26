export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: string[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}
