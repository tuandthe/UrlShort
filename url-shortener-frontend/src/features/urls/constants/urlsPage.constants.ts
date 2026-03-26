import { UrlSortBy, UrlSortDir, UrlStatusFilter } from "../types/url.types";

export type SortValue = `${UrlSortBy}:${UrlSortDir}`;

export const URLS_PAGE_TEXT = {
    title: "URL của tôi",
    subtitle: "Quản lý, sắp xếp và theo dõi các liên kết rút gọn.",
    createNew: "Tạo liên kết mới",
    shortenUrl: "Tạo liên kết mới",
    shortenDescription: "Tạo liên kết rút gọn mới với tùy chọn theo dõi và bảo mật.",
    searchPlaceholder: "Tìm theo đích hoặc slug...",
    filterButton: "Lọc",
    sortButton: "Sắp xếp",
    filterTitle: "Lọc liên kết",
    filterDescription: "Chọn trạng thái để thu hẹp danh sách URL.",
    sortTitle: "Sắp xếp theo",
    sortDescription: "Chọn cách sắp xếp danh sách URL.",
    clearAll: "Xóa tất cả",
    applyFilters: "Áp dụng lọc",
    applySort: "Áp dụng sắp xếp",
} as const;

export const URLS_FILTER_STATUS_OPTIONS: Array<{
    value: UrlStatusFilter;
    label: string;
    description: string;
}> = [
        { value: "ALL", label: "Tất cả", description: "Hiển thị toàn bộ liên kết" },
        { value: "ACTIVE", label: "Đang hoạt động", description: "Chỉ hiện liên kết còn hiệu lực" },
        { value: "EXPIRED", label: "Đã hết hạn", description: "Chỉ hiện liên kết đã hết hạn" },
        { value: "INACTIVE", label: "Không hoạt động", description: "Chỉ hiện liên kết không hoạt động" },
    ];

export const URLS_SORT_OPTIONS: Array<{
    value: SortValue;
    label: string;
    description: string;
}> = [
        { value: "createdAt:desc", label: "Ngày tạo", description: "Mới nhất trước" },
        { value: "createdAt:asc", label: "Ngày tạo", description: "Cũ nhất trước" },
        { value: "clickCount:desc", label: "Lượt nhấp", description: "Cao đến thấp" },
        { value: "clickCount:asc", label: "Lượt nhấp", description: "Thấp đến cao" },
        { value: "expiresAt:asc", label: "Ngày hết hạn", description: "Hết hạn sớm nhất" },
        { value: "expiresAt:desc", label: "Ngày hết hạn", description: "Hết hạn muộn nhất" },
    ];
