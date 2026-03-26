import { BarChart3, ShieldCheck, Zap } from "lucide-react";

export const AUTH_LAYOUT_TEXT = {
    metadataTitle: "Xác thực - UrlShort",
    intro: "Nền tảng rút gọn liên kết đáng tin cậy cho đội ngũ cần tốc độ, ổn định và số liệu rõ ràng.",
} as const;

export const AUTH_LAYOUT_FEATURES = [
    {
        title: "Phân tích thông minh",
        description: "Theo dõi lưu lượng theo thời gian thực và nhận gợi ý tự động theo vòng đời liên kết.",
        icon: BarChart3,
    },
    {
        title: "Bảo mật nhiều lớp",
        description: "Liên kết được mã hóa và kiểm tra truy cập theo nhiều lớp để giảm rủi ro.",
        icon: ShieldCheck,
    },
    {
        title: "Tốc độ phân phối cao",
        description: "Độ trễ thấp nhờ hạ tầng máy chủ phân tán tại nhiều khu vực.",
        icon: Zap,
    },
] as const;

export const LOGIN_PAGE_TEXT = {
    title: "Chào mừng quay lại",
    description: "Nhập email và mật khẩu để tiếp tục.",
    noAccount: "Chưa có tài khoản?",
    signUp: "Tạo tài khoản",
} as const;

export const REGISTER_PAGE_TEXT = {
    title: "Tạo tài khoản",
    description: "Thiết lập thông tin để truy cập hệ thống.",
    hasAccount: "Đã có tài khoản?",
    signIn: "Đăng nhập",
} as const;

export const LOGIN_FORM_TEXT = {
    email: "Địa chỉ email",
    emailPlaceholder: "tenban@congty.com",
    password: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Quên mật khẩu?",
    signingIn: "Đang đăng nhập...",
    signIn: "Đăng nhập",
    continueWith: "Hoặc tiếp tục với",
    continueWithGoogle: "Google",
} as const;

export const REGISTER_FORM_TEXT = {
    fullName: "Họ và tên",
    fullNamePlaceholder: "Nguyễn Văn A",
    email: "Địa chỉ email",
    emailPlaceholder: "tenban@congty.com",
    password: "Mật khẩu",
    passwordPlaceholder: "••••••••",
    creatingAccount: "Đang tạo tài khoản...",
    createAccount: "Tạo tài khoản",
    continueWith: "Hoặc tiếp tục với",
    continueWithGoogle: "Google",
} as const;

export const OAUTH_CALLBACK_TEXT = {
    brandSubtitle: "Nền tảng URL cao cấp",
    title: "Đang hoàn tất đăng nhập",
    description: "Hệ thống đang đồng bộ thông tin tài khoản. Vui lòng không đóng cửa sổ này.",
    secureConnection: "ĐANG THIẾT LẬP KẾT NỐI BẢO MẬT...",
    loadingFallback: "Đang tải...",
    authError: "Xác thực thất bại.",
    redirectingLogin: "Đang chuyển về trang đăng nhập...",
    links: {
        privacy: "Chính sách bảo mật",
        terms: "Điều khoản dịch vụ",
        help: "Trung tâm trợ giúp",
    },
} as const;

export const AUTH_TOAST_TEXT = {
    missingTokenResponse: "Phản hồi đăng nhập thiếu token xác thực.",
    invalidCredentials: "Email hoặc mật khẩu không chính xác.",
    loginSuccess: "Đăng nhập thành công.",
    unexpectedError: "Đã xảy ra lỗi không mong muốn.",
    registerSuccess: "Tạo tài khoản thành công. Vui lòng đăng nhập.",
    registerFailed: "Đăng ký thất bại. Email có thể đã tồn tại.",
    oauthMissingTokens: "Thiếu token xác thực từ Google.",
    oauthSuccess: "Đăng nhập Google thành công.",
    oauthFailed: "Xác thực thông tin Google thất bại.",
} as const;
