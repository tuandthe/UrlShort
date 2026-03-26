import { UrlStatus } from "@/features/urls/types/url.types";

export const ADMIN_DASHBOARD_TEXT = {
    pageTitle: "Bảng điều khiển quản trị",
    pageSubtitle: "Tổng quan trí tuệ hệ thống và hoạt động người dùng",
    globalSearchPlaceholder: "Tìm kiếm tài nguyên...",
    userSearchPlaceholder: "Tìm theo tên hoặc email...",
    notificationsAriaLabel: "Thông báo",
    growthLabel: "+12% so với cùng kỳ",
    usersSectionTitle: "Người dùng mới nhất",
    clickTrendSectionTitle: "Xu hướng click toàn hệ thống",
    viewAllButton: "Làm mới",
    usersLoading: "Đang tải người dùng...",
    usersError: "Không thể tải danh sách người dùng.",
    usersEmpty: "Không có người dùng nào.",
    statsError: "Không thể tải số liệu quản trị.",
    totalUsersLabel: "Tổng người dùng",
    paginationLabel: "Trang",
    previousPage: "Trang trước",
    nextPage: "Trang sau",
    deleteUserButton: "Xóa",
    activateUserButton: "Kích hoạt",
    userActions: "Thao tác",
    userFilterAll: "Tất cả",
    userFilterActive: "Đang hoạt động",
    userFilterInactive: "Đã vô hiệu",
    trendFilterWeek: "Theo tuần",
    trendFilterMonth: "Theo tháng",
    trendLoading: "Đang tải dữ liệu click...",
    trendError: "Không thể tải xu hướng click hệ thống.",
    trendEmpty: "Chưa có dữ liệu click để hiển thị.",
    fallbackValue: "-",
    tableHeaders: {
        avatar: "Avatar",
        user: "Người dùng",
        email: "Email",
        provider: "Nhà cung cấp",
        status: "Trạng thái",
        joinedAt: "Ngày tham gia",
        role: "Vai trò",
        actions: "Thao tác",
    },
} as const;

export const ADMIN_STAT_CARD_TEXT = {
    totalUsers: {
        title: "Tổng người dùng",
        description: "Tài khoản đã đăng ký",
    },
    totalUrls: {
        title: "Tổng URL",
        description: "Liên kết rút gọn đã tạo",
    },
    totalClicks: {
        title: "Tổng lượt nhấp",
        description: "Tổng lưu lượng đã theo dõi",
    },
} as const;

export const ADMIN_STATUS_BADGE = {
    active: {
        className: "bg-primary/15 text-primary",
        label: "Đang hoạt động",
    },
    inactive: {
        className: "bg-muted text-muted-foreground",
        label: "Chờ xử lý",
    },
} as const;

export const ADMIN_DEFAULT_USER_STATUS: UrlStatus = "INACTIVE";
