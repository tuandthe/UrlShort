export const URL_MEDIA_TEXT = {
  backToUrls: "Quay về danh sách URL",
  pageTitle: "Media & QR",
  pageDescriptionPrefix: "Quản lý cách hiển thị và chia sẻ cho liên kết",
  og: {
    title: "Ảnh Open Graph",
    hint: "Khuyến nghị: 1200 x 630 px, tối đa 5MB",
    upload: "Tải ảnh mới",
    uploading: "Đang tải ảnh lên...",
    empty: "Chưa có ảnh Open Graph. Hãy tải ảnh để tối ưu khi chia sẻ.",
  },
  qr: {
    title: "Mã QR",
    download: "Tải PNG",
    copyUrl: "Sao chép URL",
    empty: "Chưa có mã QR cho liên kết này.",
  },
  ledger: {
    title: "Nhật ký hoạt động",
    items: [
      {
        title: "Đồng bộ ảnh Open Graph",
        description: "Ảnh chia sẻ được cập nhật lên hệ thống lưu trữ.",
        meta: "Vừa xong",
      },
      {
        title: "Làm mới bản xem trước",
        description: "Bản xem trước liên kết đã được cập nhật theo ảnh mới.",
        meta: "Tự động",
      },
      {
        title: "Sẵn sàng chia sẻ QR",
        description: "Bạn có thể tải mã QR để dùng cho in ấn hoặc trình chiếu.",
        meta: "Sẵn sàng",
      },
    ],
  },
  quickTipTitle: "Mẹo nhanh",
  quickTipDescription: "Liên kết có ảnh Open Graph tùy chỉnh thường nhận được nhiều lượt nhấp hơn khi chia sẻ trên mạng xã hội.",
  errors: {
    invalidImageType: "Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.",
    fileTooLarge: "Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.",
    uploadFailed: "Tải ảnh Open Graph thất bại.",
    copyFailed: "Không thể sao chép liên kết.",
    qrDownloadFailed: "Không thể tải mã QR lúc này.",
  },
  success: {
    uploadDone: "Đã cập nhật ảnh Open Graph.",
    copyDone: "Đã sao chép liên kết.",
  },
} as const;
