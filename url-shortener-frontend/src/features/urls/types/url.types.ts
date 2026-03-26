export type UrlStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export type UrlStatusFilter = "ALL" | UrlStatus;

export type UrlSortBy = "createdAt" | "clickCount" | "expiresAt";

export type UrlSortDir = "asc" | "desc";

export interface UrlQueryOptions {
  search?: string;
  status?: UrlStatusFilter;
  sortBy?: UrlSortBy;
  sortDir?: UrlSortDir;
}

export interface UrlDetail {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl?: string; // from backend response
  status?: UrlStatus;
  hasPassword?: boolean;
  expiresAt?: string | null;
  isActive: boolean;
  clickCount: number;
  qrCodeUrl?: string | null;
  ogImageUrl?: string | null;
  createdAt: string;
}

export interface PaginatedUrls {
  status: number;
  message: string;
  data: UrlDetail[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}
