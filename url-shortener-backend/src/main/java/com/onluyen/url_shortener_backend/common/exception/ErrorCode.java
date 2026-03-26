package com.onluyen.url_shortener_backend.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // Common Errors
    BAD_REQUEST("ERR_001", "Thông tin yêu cầu không hợp lệ"),
    UNAUTHORIZED("ERR_002", "Không có quyền truy cập"),
    FORBIDDEN("ERR_003", "Bị từ chối truy cập"),
    INTERNAL_SERVER_ERROR("ERR_004", "Lỗi hệ thống"),

    // User Errors
    USER_NOT_FOUND("USR_001", "Không tìm thấy người dùng"),
    EMAIL_ALREADY_EXISTS("USR_002", "Email đã tồn tại"),
    INVALID_CREDENTIALS("USR_003", "Sai email hoặc mật khẩu"),
    OAUTH_PASSWORD_CHANGE_NOT_ALLOWED("USR_004", "Tài khoản Google không hỗ trợ đổi mật khẩu"),
    USER_INACTIVE("USR_005", "Tài khoản đã bị vô hiệu hóa"),

    // URL Errors
    URL_NOT_FOUND("URL_001", "Không tìm thấy URL"),
    URL_EXPIRED("URL_002", "URL đã hết hạn"),
    SHORT_CODE_ALREADY_EXISTS("URL_003", "Mã rút gọn (Alias) đã tồn tại"),
    RATE_LIMIT_EXCEEDED("URL_004", "Vượt quá giới hạn request cho phép"),
    INVALID_PASSWORD("URL_005", "Mật khẩu cho URL không chính xác"),

    // Storage Errors
    MSG_FILE_MUST_NOT_BE_EMPTY("STO_001", "File không được để trống"),
    MSG_FILE_SIZE_EXCEEDS_LIMIT("STO_002", "Kích thước file vượt quá giới hạn cho phép"),
    MSG_UNSUPPORTED_FILE_TYPE("STO_003", "Loại file không được hỗ trợ. Chỉ cho phép: JPEG, PNG, WEBP, GIF");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
