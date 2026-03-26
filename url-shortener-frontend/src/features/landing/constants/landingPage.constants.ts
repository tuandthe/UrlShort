import { AtSign, BarChart3, Globe, Home, Link as LinkIcon, Share2, Shield, UserRound, Zap } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";

export const LANDING_PAGE_TEXT = {
    enterpriseTag: "Hạ tầng chuẩn doanh nghiệp",
    heroTitlePrefix: "Rút gọn, chia sẻ,",
    heroTitleHighlight: "theo dõi tự tin",
    heroDescription: "Nền tảng quản lý liên kết dành cho nhóm phát triển hiện đại, tối ưu tốc độ chuyển hướng và theo dõi hiệu quả theo thời gian thực.",
    createAccount: "Tạo tài khoản miễn phí",
    alreadyHasAccount: "Tôi đã có tài khoản",
    imageAlt: "Xem trước bảng phân tích",
    footerDescription: "Dịch vụ rút gọn liên kết ổn định cho quy mô lớn, tốc độ cao và khả năng theo dõi minh bạch.",
    sections: {
        platform: "Sản phẩm",
        resources: "Tài nguyên",
        connect: "Pháp lý",
    },
    platformLinks: {
        signIn: "Đăng nhập",
        register: "Đăng ký",
        dashboard: "Bảng điều khiển",
    },
    resourceLinks: {
        apiDocs: "Tài liệu",
        guides: "API",
        pricing: "Bảng giá",
    },
    copyrightSuffix: "Mọi quyền được bảo lưu.",
    legalLinks: {
        privacy: "Chính sách bảo mật",
        terms: "Điều khoản dịch vụ",
    },
    topLinks: {
        docs: "Tài liệu",
        api: "API",
        pricing: "Bảng giá",
    },
    topActions: {
        signIn: "Đăng nhập",
        getStarted: "Bắt đầu",
    },
    ctaTitle: "Sẵn sàng tối ưu liên kết của bạn?",
    ctaDescription: "Tham gia cùng hơn 10.000 người dùng đang tin tưởng UrlShort cho các liên kết quan trọng mỗi ngày.",
    ctaButton: "Bắt đầu miễn phí",
    mobileNav: {
        home: "Trang chủ",
        links: "Liên kết",
        stats: "Phân tích",
        profile: "Hồ sơ",
    },
} as const;

export const LANDING_FEATURES = [
    {
        title: "Rút gọn siêu nhanh",
        description: "Mạng máy chủ phân tán giúp liên kết phản hồi cực nhanh, dù người dùng ở bất kỳ đâu.",
        icon: Zap,
        iconClass: "text-primary",
    },
    {
        title: "Phân tích thời gian thực",
        description: "Theo dõi hành vi người dùng theo thiết bị, hệ điều hành và vị trí mà vẫn bảo toàn quyền riêng tư.",
        icon: BarChart3,
        iconClass: "text-chart-1",
    },
    {
        title: "Bảo mật và mở rộng",
        description: "Hạ tầng đạt chuẩn SOC2 với chống DDoS tự động và cụm dịch vụ sẵn sàng cao.",
        icon: Shield,
        iconClass: "text-destructive",
    },
] as const;

export const LANDING_PLATFORM_STATS = [
    { label: "Liên kết đã tạo", value: "10M+" },
    { label: "Người dùng hài lòng", value: "500k+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Hỗ trợ", value: "24/7" },
] as const;

export const LANDING_SOCIAL_LINKS = [
    { ariaLabel: "Website", icon: Globe },
    { ariaLabel: "Email", icon: AtSign },
    { ariaLabel: "Chia sẻ", icon: Share2 },
] as const;

export const LANDING_MOBILE_NAV = [
    { label: LANDING_PAGE_TEXT.mobileNav.home, icon: Home, isActive: true, href: ROUTES.HOME },
    { label: LANDING_PAGE_TEXT.mobileNav.links, icon: LinkIcon, isActive: false, href: ROUTES.URLS },
    { label: LANDING_PAGE_TEXT.mobileNav.stats, icon: BarChart3, isActive: false, href: ROUTES.ANALYTICS },
    { label: LANDING_PAGE_TEXT.mobileNav.profile, icon: UserRound, isActive: false, href: ROUTES.SETTINGS },
] as const;
