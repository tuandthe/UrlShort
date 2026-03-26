import { ROUTES } from "@/shared/constants/routes";

export const NAVBAR_TEXT = {
    adminPanel: "Quản trị",
    toggleTheme: "Đổi giao diện",
    themeToggle: "Giao diện",
    signOut: "Đăng xuất",
    premiumTagline: "Bảng điều khiển",
    topbarSearchPlaceholder: "Tìm nhanh...",
    notificationsAriaLabel: "Thông báo",
    dashboardErrorTitle: "Không thể tải nội dung bảng điều khiển.",
    dashboardErrorRetry: "Thử lại",
} as const;

export const NAVBAR_ITEMS = [
    { name: "Tổng quan", href: ROUTES.DASHBOARD },
    { name: "URL của tôi", href: ROUTES.URLS },
    { name: "Phân tích", href: ROUTES.ANALYTICS },
    { name: "Cài đặt", href: ROUTES.SETTINGS },
] as const;

export const NAVBAR_MOBILE_ITEMS = [
    { name: "Trang chủ", href: ROUTES.DASHBOARD },
    { name: "URL", href: ROUTES.URLS },
    { name: "Phân tích", href: ROUTES.ANALYTICS },
    { name: "Hồ sơ", href: ROUTES.SETTINGS },
] as const;
