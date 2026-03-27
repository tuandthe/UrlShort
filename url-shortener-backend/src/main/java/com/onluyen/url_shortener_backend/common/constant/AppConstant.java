package com.onluyen.url_shortener_backend.common.constant;

import java.time.Duration;
import java.util.List;

public final class AppConstant {

    private AppConstant() {
        // Prevent instantiation
    }

    // --- Security & JWT ---
    public static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    // --- Redis ---
    public static final String REDIS_URL_KEY_PREFIX = "url:";
    public static final String REDIS_COUNTER_KEY = "url:short_code:counter";
    public static final String REDIS_NULL_VALUE = "NULL";
    public static final String REDIS_REFRESH_TOKEN_PREFIX = "refresh_token:";

    // --- Messages ---
    public static final String MSG_REGISTER_SUCCESS = "Đăng ký thành công";
    public static final String MSG_LOGIN_SUCCESS = "Đăng nhập thành công";
    public static final String MSG_REFRESH_TOKEN_SUCCESS = "Làm mới token thành công";
    public static final String MSG_LOGOUT_SUCCESS = "Logout thành công";
    public static final String MSG_PROFILE_GET_SUCCESS = "Lấy thông tin cá nhân thành công";
    public static final String MSG_PROFILE_UPDATE_SUCCESS = "Cập nhật thông tin cá nhân thành công";
    public static final String MSG_URL_CREATE_SUCCESS = "Tạo URL mới thành công";
    public static final String MSG_URL_LIST_SUCCESS = "Lấy danh sách URL thành công";
    public static final String MSG_URL_DETAIL_SUCCESS = "Lấy chi tiết URL thành công";
    public static final String MSG_URL_UPDATE_SUCCESS = "Cập nhật URL thành công";
    public static final String MSG_URL_DELETE_SUCCESS = "Xóa URL thành công";
    public static final String MSG_URL_PASSWORD_UPDATE_SUCCESS = "Cập nhật mật khẩu URL thành công";
    public static final String MSG_URL_EXPIRATION_UPDATE_SUCCESS = "Cập nhật thời gian hết hạn URL thành công";
    public static final String MSG_URL_CLICKS_TIMELINE_SUCCESS = "Lấy dữ liệu click theo thời gian thành công";
    public static final String MSG_URL_AUTH_SUCCESS = "Xác thực thành công";
    public static final String MSG_URL_STATS_SUCCESS = "Lấy thống kê URL thành công";
    public static final String MSG_SYS_STATS_SUCCESS = "Lấy thống kê hệ thống thành công";
    public static final String MSG_ADMIN_CLICKS_TREND_SUCCESS = "Lấy xu hướng click hệ thống thành công";
    public static final String MSG_ADMIN_USERS_LIST_SUCCESS = "Lấy danh sách người dùng thành công";
    public static final String MSG_ADMIN_URLS_LIST_SUCCESS = "Lấy danh sách URL hệ thống thành công";
    public static final String MSG_ADMIN_USER_DEACTIVATE_SUCCESS = "Vô hiệu hóa người dùng thành công";
    public static final String MSG_ADMIN_USER_ACTIVATE_SUCCESS = "Kích hoạt người dùng thành công";
    public static final String ERROR_MSG_URL_PASSWORD_PROTECTED = "URL này được bảo vệ bởi mật khẩu";
    public static final String ERROR_MSG_INVALID_REFRESH_TOKEN = "Invalid refresh token";
    public static final String ERROR_MSG_USER_INACTIVE = "Tài khoản đã bị vô hiệu hóa";
    public static final String ERROR_MSG_CANNOT_DEACTIVATE_SELF = "Không thể vô hiệu hóa chính tài khoản admin hiện tại";

    // --- Redis Cache ---
    public static final Duration REDIS_CACHE_PENETRATION_TTL = Duration.ofMinutes(5);
    public static final Duration REDIS_CACHE_TTL = Duration.ofHours(24);
    public static final int REDIS_CACHE_JITTER_MAX_SECONDS = 300;

    // --- Kafka ---
    public static final String KAFKA_GROUP_ANALYTICS = "analytics-group";
    public static final String KAFKA_TOPIC_CLICK_EVENTS = "url-click-events";
    public static final String KAFKA_TOPIC_CLICK_EVENTS_DLT = KAFKA_TOPIC_CLICK_EVENTS + ".DLT";
    public static final String KAFKA_GROUP_EMAIL = "email-group";
    public static final String KAFKA_TOPIC_EMAIL_EVENTS = "email-events";
    public static final String KAFKA_TOPIC_EMAIL_EVENTS_DLT = KAFKA_TOPIC_EMAIL_EVENTS + ".DLT";
    public static final int KAFKA_PARTITIONS = 3;
    public static final int KAFKA_DLT_PARTITIONS = 1;
    public static final short KAFKA_REPLICAS = 1;

    public static final long KAFKA_BACKOFF_INITIAL_INTERVAL_MS = 1000L;
    public static final double KAFKA_BACKOFF_MULTIPLIER = 2.0;
    public static final long KAFKA_BACKOFF_MAX_ELAPSED_TIME_MS = 10000L;

    // --- Security & JWT ---
    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String ROLE_ADMIN_AUTHORITY = "ROLE_ADMIN";
    public static final String ROLE_ADMIN = "ADMIN";

    // --- API Common ---
    public static final int HTTP_STATUS_OK = 200;
    public static final String DEFAULT_PAGE = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";

    // --- Rate Limit ---
    public static final int MAX_REQUESTS_PER_MINUTE = 60;
    public static final String RATE_LIMIT_PREFIX = "rate_limit:";
    public static final long RATE_LIMIT_WINDOW_MILLISECONDS = 60_000L;

    // --- CORS ---
    public static final List<String> CORS_ALLOWED_METHODS = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    public static final List<String> CORS_EXPOSED_HEADERS = List.of("authorization", "x-auth-token");

    // --- URL Shortener ---
    public static final int SHORT_CODE_MIN_LENGTH = 6;
    public static final int SHORT_CODE_DEFAULT_LENGTH = 7;
    public static final int SHORT_CODE_MAX_RETRIES = 5;
    public static final String ALLOWED_STRING = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public static final String SHORT_CODE_REGEX_PATTERN = "[a-zA-Z0-9_\\-]+";
    public static final String SHORT_CODE_REDIRECT_PATH = "/{shortCode:" + SHORT_CODE_REGEX_PATTERN + "}";
    public static final String SHORT_CODE_VERIFY_PATH = SHORT_CODE_REDIRECT_PATH + "/verify";
    public static final String OAUTH2_GOOGLE_AUTH_PATH = "/oauth2/authorization/google";
    public static final String OAUTH_CALLBACK_PATH = "/oauth2/callback";
    public static final String OAUTH_ACCESS_TOKEN_PARAM = "token";
    public static final String OAUTH_REFRESH_TOKEN_PARAM = "refresh";

    // --- Storage (MinIO) ---
    public static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB
    public static final java.util.Set<String> ALLOWED_IMAGE_CONTENT_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");
    public static final String STORAGE_FOLDER_AVATARS = "avatars";
    public static final String STORAGE_FOLDER_QRCODES = "qrcodes";
    public static final String STORAGE_FOLDER_OG_IMAGES = "og-images";
    public static final String MSG_PRESIGNED_URL_GENERATED = "Presigned URL đã được tạo thành công";

    // --- Messages: Storage & Email ---
    public static final String MSG_AVATAR_UPLOAD_SUCCESS = "Upload ảnh đại diện thành công";
    public static final String MSG_FILE_UPLOAD_SUCCESS = "Upload file thành công";
    public static final String MSG_FILE_DELETE_SUCCESS = "Xóa file thành công";
    public static final String MSG_EMAIL_QUEUED = "Email đã được lên lịch gửi";
    public static final String MSG_URL_OG_IMAGE_UPLOAD_SUCCESS = "Cập nhật ảnh OG thành công";

}
