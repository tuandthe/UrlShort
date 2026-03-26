import { UrlStatus } from "../types/url.types";

export const URLS_TABLE_TEXT = {
    loading: "Đang tải danh sách URL...",
    error: "Không thể tải danh sách URL.",
    emptyTitle: "Chưa có URL nào",
    emptyDescription: "Hãy tạo liên kết rút gọn đầu tiên để bắt đầu theo dõi hiệu suất.",
    compactHeaders: {
        shortLink: "Liên kết rút gọn",
        destination: "Đích đến",
        clicks: "Lượt nhấp",
    },
    fullHeaders: {
        shortLink: "Liên kết rút gọn",
        originalUrl: "Đích gốc",
        status: "Trạng thái",
        clicks: "Lượt nhấp",
        createdAt: "Ngày tạo",
        actions: "Thao tác",
    },
    aria: {
        copyShortLink: "Sao chép liên kết rút gọn",
        manageMedia: "Quản lý media và mã QR",
        viewAnalytics: "Xem phân tích",
        editUrl: "Chỉnh sửa URL",
        deleteUrl: "Xóa URL",
    },
    statusLabel: {
        ACTIVE: "Đang hoạt động",
        EXPIRED: "Đã hết hạn",
        INACTIVE: "Không hoạt động",
    } as Record<UrlStatus, string>,
    pagination: {
        showingPage: "Trang",
        of: "trên",
        urlsSuffix: "trang URL",
        previous: "Trước",
        next: "Sau",
    },
} as const;

export const URLS_TABLE_STATUS_STYLE: Record<UrlStatus, string> = {
    ACTIVE: "bg-primary/15 text-primary",
    EXPIRED: "bg-muted text-muted-foreground",
    INACTIVE: "bg-accent text-foreground",
};

export const URLS_TABLE_STATUS_DOT_STYLE: Record<UrlStatus, string> = {
    ACTIVE: "bg-primary",
    EXPIRED: "bg-muted-foreground",
    INACTIVE: "bg-foreground",
};
