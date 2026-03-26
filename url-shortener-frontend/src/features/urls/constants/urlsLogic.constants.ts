import { DATE_FORMATS } from "@/shared/constants/formats";

export const URLS_LOGIC_TEXT = {
    copiedSuccess: "Đã sao chép URL rút gọn",
    confirmDelete: "Bạn có chắc chắn muốn xóa URL này không?",
    passwordPrompt: "Nhập mật khẩu mới. Để trống để xóa mật khẩu.",
    expirationPrompt: `Nhập thời điểm hết hạn (${DATE_FORMATS.DATETIME_LOCAL_HINT}). Để trống để xóa thời hạn.`,
    invalidDatetime: `Định dạng thời gian không hợp lệ. Vui lòng dùng ${DATE_FORMATS.DATETIME_LOCAL_HINT}`,
} as const;
