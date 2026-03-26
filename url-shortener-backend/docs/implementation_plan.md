# MinIO & Mailpit Integration — Implementation Plan

## Tổng quan Kiến trúc Hiện tại

| Thành phần | Công nghệ | Ghi chú |
|---|---|---|
| Backend | Spring Boot **4.0.3**, Java **21**, Gradle | |
| Database | MySQL 8.0 + Flyway | Entity: [User](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/shared/types/next-auth.d.ts#15-23), [Url](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/url/entity/Url.java#11-56), [ClickEvent](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/analytics/dto/ClickEventDto.java#10-21) |
| Cache | Redis 7 | Token, URL cache, Rate limiting |
| Message Queue | Kafka (Confluent 7.5) + Zookeeper | Batch consumer, DLQ, ExponentialBackOff |
| Auth | JWT + Google OAuth2 | [OAuth2LoginSuccessHandler](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/auth/security/OAuth2LoginSuccessHandler.java#27-91) |
| Monitoring | Actuator + Prometheus (Micrometer) | |

**Kafka Pattern đã có:** [ClickEventProducer](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/analytics/kafka/ClickEventProducer.java#12-33) → topic `url-click-events` → [ClickEventConsumer](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/analytics/kafka/ClickEventConsumer.java#22-72) (batch) → `url-click-events.DLT` (dead letters). Tất cả constants trong [AppConstant.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/constant/AppConstant.java).

---

## PHẦN 1: Hạ tầng Docker Compose

### 1.1 Thêm MinIO

#### [MODIFY] [docker-compose.yml](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/docker-compose.yml)

```yaml
  minio:
    image: minio/minio:latest
    container_name: url_shortener_minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Web Console
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin123}
    volumes:
      - minio_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 1.2 Thêm Mailpit

```yaml
  mailpit:
    image: axllent/mailpit:latest
    container_name: url_shortener_mailpit
    ports:
      - "8025:8025"   # Web UI (xem email)
      - "1025:1025"   # SMTP Server
    environment:
      MP_DATABASE: /data/mailpit.db
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
    volumes:
      - mailpit_data:/data
    networks:
      - app-network
```

### 1.3 Bổ sung volumes

```yaml
volumes:
  mysql_data:
  redis_data:
  minio_data:      # ← NEW
  mailpit_data:    # ← NEW
```

### 1.4 Bổ sung env cho [app](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28dashboard%29/urls/page.tsx#88-92) service

```yaml
  app:
    environment:
      # ... existing ...
      - MINIO_ENDPOINT=http://minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ROOT_USER:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_ROOT_PASSWORD:-minioadmin123}
      - MINIO_BUCKET=${MINIO_BUCKET:-url-shortener}
      - MAIL_HOST=mailpit
      - MAIL_PORT=1025
    depends_on:
      # ... existing ...
      minio:
        condition: service_healthy
```

---

## PHẦN 2: Tích hợp MinIO (Backend)

### 2.1 Dependencies

#### [MODIFY] [build.gradle](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/build.gradle)

```groovy
// MinIO (AWS S3 Compatible)
implementation 'io.minio:minio:8.5.17'

// Email
implementation 'org.springframework.boot:spring-boot-starter-mail'
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

### 2.2 Configuration

#### [MODIFY] [application-dev.yml](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/resources/application-dev.yml)

```yaml
# --- MinIO ---
minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin123
  bucket: url-shortener

# --- Mail (Mailpit) ---
spring:
  mail:
    host: localhost
    port: 1025
    properties:
      mail.smtp.auth: false
      mail.smtp.starttls.enable: false

# --- App ---
app:
  mail:
    from: noreply@urlshort.io
    from-name: UrlShort
```

### 2.3 Kiến trúc Module `storage`

```
src/main/java/.../storage/
├── config/
│   └── MinioConfig.java          # Bean MinioClient + auto-create bucket
├── service/
│   ├── StorageService.java       # Interface (abstraction)
│   └── MinioStorageService.java  # Implementation
├── controller/
│   └── FileController.java       # REST API for upload/download
├── dto/
│   ├── FileUploadResponse.java   # { fileName, url, size, contentType }
│   └── PresignedUrlResponse.java # { uploadUrl, fileKey }
└── constant/
    └── StorageConstant.java      # Max size, allowed types, bucket paths
```

#### [NEW] MinioConfig.java — Key Logic

```java
@Configuration
@ConfigurationProperties(prefix = "minio")
@Data
public class MinioConfig {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
            .endpoint(endpoint)
            .credentials(accessKey, secretKey)
            .build();
    }

    @PostConstruct
    public void initBucket() {
        // Auto-create bucket if not exists (idempotent)
    }
}
```

#### [NEW] StorageService.java — Interface

```java
public interface StorageService {
    FileUploadResponse upload(MultipartFile file, String folder);
    void delete(String fileKey);
    String getPresignedUrl(String fileKey, int expiryMinutes);
    PresignedUrlResponse generatePresignedUploadUrl(String fileName, String folder);
}
```

#### [NEW] MinioStorageService.java — Key Logic

- **Upload flow:** Validate file type/size → Generate unique key (`folder/uuid_filename`) → `minioClient.putObject()` → return `FileUploadResponse`
- **Delete flow:** `minioClient.removeObject()`
- **Presigned URL:** `minioClient.getPresignedObjectUrl()` (GET for download, PUT for direct upload)
- File organization: `avatars/{userId}/`, `qrcodes/{urlId}/`, `og-images/{urlId}/`

#### [NEW] FileController.java

```java
@RestController
@RequestMapping("/api/files")
public class FileController {
    @PostMapping("/upload")        // General upload
    @DeleteMapping("/{fileKey}")   // Delete file
    @GetMapping("/presigned/{fileKey}")  // Get presigned download URL
}
```

### 2.4 Tính năng ứng dụng MinIO

| Tính năng | Mô tả | API Endpoint |
|---|---|---|
| **User Avatar** | Upload ảnh đại diện | `PUT /api/users/me/avatar` |
| **QR Code** | Auto-generate QR cho mỗi short URL | Tự động khi tạo URL |
| **OG Image** | Upload custom Open Graph image cho link preview | `POST /api/urls/{id}/og-image` |

#### [MODIFY] User entity — Thêm field

```java
@Column(name = "avatar_url")
private String avatarUrl;   // MinIO file key: "avatars/{userId}/avatar.jpg"
```

#### [MODIFY] Url entity — Thêm fields

```java
@Column(name = "qr_code_url")
private String qrCodeUrl;   // MinIO file key: "qrcodes/{urlId}/qr.png"

@Column(name = "og_image_url")
private String ogImageUrl;  // MinIO file key: "og-images/{urlId}/preview.jpg"
```

#### Flyway migrations

```sql
-- V3__add_avatar_url.sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL;

-- V4__add_url_media_fields.sql
ALTER TABLE urls ADD COLUMN qr_code_url VARCHAR(500) NULL;
ALTER TABLE urls ADD COLUMN og_image_url VARCHAR(500) NULL;
```

---

## PHẦN 3: Tích hợp Mailpit & Kafka Async Email

### 3.1 Kiến trúc Event-Driven Email

```
┌─────────────────┐     Kafka Topic          ┌──────────────────┐
│  API Controller  │──→ "email-events" ──────→│ EmailEventConsumer│
│  (non-blocking)  │     (fire & forget)      │  (batch listener) │
└─────────────────┘                           ├──────────────────┤
                                              │ TemplateEngine   │
                                              │ JavaMailSender   │
                                              │ → Render HTML    │
                                              │ → Send SMTP      │
                                              └────────┬─────────┘
                                                 fail  │
                                              ┌────────▼─────────┐
                                              │ "email-events.DLT│
                                              │ (Dead Letter)     │
                                              └──────────────────┘
```

### 3.2 Module Structure

```
src/main/java/.../notification/
├── config/
│   └── MailConfig.java           # JavaMailSender bean
├── dto/
│   └── EmailEventDto.java        # { to, subject, templateName, variables, type }
├── kafka/
│   ├── EmailEventProducer.java   # Fire event to Kafka
│   └── EmailEventConsumer.java   # Consume → render template → send
├── service/
│   ├── EmailService.java         # High-level API: sendWelcome(), sendReport()...
│   └── EmailTemplateRenderer.java # Thymeleaf rendering
└── constant/
    └── EmailConstant.java        # Template names, topic names

src/main/resources/templates/email/
├── welcome.html                  # Welcome email after registration
├── password-reset.html           # Password reset confirmation
├── link-expired.html             # Notify when link expires
└── weekly-report.html            # Weekly click summary
```

### 3.3 Kafka Topics & Constants

#### [MODIFY] [AppConstant.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/constant/AppConstant.java)

```java
// --- Kafka Email ---
public static final String KAFKA_GROUP_EMAIL = "email-group";
public static final String KAFKA_TOPIC_EMAIL_EVENTS = "email-events";
public static final String KAFKA_TOPIC_EMAIL_EVENTS_DLT = KAFKA_TOPIC_EMAIL_EVENTS + ".DLT";

// --- MinIO ---
public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
public static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
    "image/jpeg", "image/png", "image/webp", "image/gif"
);
public static final String STORAGE_FOLDER_AVATARS = "avatars";
public static final String STORAGE_FOLDER_QRCODES = "qrcodes";
public static final String STORAGE_FOLDER_OG_IMAGES = "og-images";

// --- Email ---
public static final String MSG_AVATAR_UPLOAD_SUCCESS = "Upload ảnh đại diện thành công";
public static final String MSG_FILE_UPLOAD_SUCCESS = "Upload file thành công";
public static final String MSG_FILE_DELETE_SUCCESS = "Xóa file thành công";
```

#### [MODIFY] [KafkaConfig.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/KafkaConfig.java)

Thêm 2 beans:
```java
@Bean
public NewTopic emailEventsTopic() {
    return TopicBuilder.name(AppConstant.KAFKA_TOPIC_EMAIL_EVENTS)
            .partitions(AppConstant.KAFKA_PARTITIONS)
            .replicas(AppConstant.KAFKA_REPLICAS)
            .build();
}

@Bean
public NewTopic emailEventsDltTopic() {
    return TopicBuilder.name(AppConstant.KAFKA_TOPIC_EMAIL_EVENTS_DLT)
            .partitions(AppConstant.KAFKA_DLT_PARTITIONS)
            .replicas(AppConstant.KAFKA_REPLICAS)
            .build();
}
```

### 3.4 Key Classes

#### [NEW] EmailEventDto.java

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmailEventDto {
    private String to;
    private String subject;
    private String templateName;    // "welcome", "password-reset", etc.
    private Map<String, Object> variables;  // Template context
    private EmailType type;         // Enum: WELCOME, PASSWORD_RESET, LINK_EXPIRED, WEEKLY_REPORT
    private int retryCount;
    private LocalDateTime createdAt;
}
```

#### [NEW] EmailEventProducer.java

Follows exact same pattern as [ClickEventProducer](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/analytics/kafka/ClickEventProducer.java#12-33):
```java
public void publishEmailEvent(EmailEventDto dto) {
    kafkaTemplate.send(AppConstant.KAFKA_TOPIC_EMAIL_EVENTS, dto.getTo(), dto);
}
```

#### [NEW] EmailEventConsumer.java

```java
@KafkaListener(topics = AppConstant.KAFKA_TOPIC_EMAIL_EVENTS, groupId = AppConstant.KAFKA_GROUP_EMAIL)
public void consume(List<EmailEventDto> events) {
    for (EmailEventDto event : events) {
        String html = templateRenderer.render(event.getTemplateName(), event.getVariables());
        mailSender.send(buildMimeMessage(event.getTo(), event.getSubject(), html));
    }
}
```

#### [NEW] EmailService.java — High-level API

```java
@Service
public class EmailService {
    public void sendWelcomeEmail(User user) {
        EmailEventDto dto = EmailEventDto.builder()
            .to(user.getEmail())
            .subject("Welcome to UrlShort!")
            .templateName("welcome")
            .variables(Map.of("fullName", user.getFullName()))
            .type(EmailType.WELCOME)
            .build();
        emailEventProducer.publishEmailEvent(dto);
    }

    public void sendLinkExpiredNotification(User user, Url url) { ... }
    public void sendWeeklyReport(User user, List<UrlStats> stats) { ... }
    public void sendPasswordResetConfirmation(User user) { ... }
}
```

### 3.5 Thymeleaf Email Templates

#### [NEW] `templates/email/welcome.html`

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
  <div style="max-width:600px; margin:0 auto; font-family:'Inter',sans-serif;">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed); padding:32px; color:white; border-radius:12px 12px 0 0;">
      <h1>Welcome to UrlShort! 🎉</h1>
    </div>
    <div style="padding:32px; background:#ffffff; border:1px solid #e2e8f0;">
      <p>Hi <strong th:text="${fullName}">User</strong>,</p>
      <p>Your account has been created successfully.</p>
      <a th:href="${dashboardUrl}" style="...button styles...">Go to Dashboard</a>
    </div>
    <div style="padding:16px; text-align:center; color:#94a3b8; font-size:12px;">
      © 2026 UrlShort. All rights reserved.
    </div>
  </div>
</body>
</html>
```

Tương tự cho `password-reset.html`, `link-expired.html`, `weekly-report.html` (có bảng stats).

### 3.6 Integration Points

| Sự kiện | Gọi EmailService | Khi nào |
|---|---|---|
| User đăng ký | `sendWelcomeEmail()` | Sau `AuthController.register()` thành công |
| User đổi password | `sendPasswordResetConfirmation()` | Sau `UserController.updateMyProfile()` có `newPassword` |
| URL hết hạn | `sendLinkExpiredNotification()` | Scheduler `@Scheduled(cron="0 0 * * * *")` check `expiresAt < now()` |
| Weekly report | `sendWeeklyReport()` | Scheduler `@Scheduled(cron="0 0 9 ? * MON")` |

---

## PHẦN 4: Edge Cases & Rủi ro

### 4.1 MinIO Cleanup — Saga Pattern

**Vấn đề:** User upload OG image → MinIO lưu OK → Nhưng `UPDATE urls SET og_image_url=...` bị lỗi DB → File rác trên MinIO.

**Giải pháp: Compensating Transaction**

```java
public UrlDetailResponse uploadOgImage(Long urlId, MultipartFile file) {
    // 1. Upload to MinIO first
    FileUploadResponse uploaded = storageService.upload(file, "og-images");

    try {
        // 2. Update DB
        Url url = urlRepository.findById(urlId).orElseThrow();
        String oldKey = url.getOgImageUrl();
        url.setOgImageUrl(uploaded.getFileKey());
        urlRepository.save(url);

        // 3. Cleanup old file if exists
        if (oldKey != null) storageService.delete(oldKey);

        return mapper.toDetailResponse(url);
    } catch (Exception e) {
        // COMPENSATE: Delete the just-uploaded file
        storageService.delete(uploaded.getFileKey());
        throw new RuntimeException("Failed to save URL metadata", e);
    }
}
```

**Bổ sung: Scheduled Cleanup Job** — chạy hàng ngày, scan MinIO objects không có reference trong DB → xóa (orphan cleanup).

### 4.2 Kafka DLQ cho Email

**Vấn đề:** Mailpit/SMTP server sập → EmailEventConsumer throw → retry → vẫn fail → DLQ.

**Giải pháp: Đã có pattern sẵn**

Reuse `DefaultErrorHandler` + `DeadLetterPublishingRecoverer` giống [KafkaConfig.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/KafkaConfig.java) hiện tại. Modify error handler:

```java
DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template,
    (record, ex) -> {
        // Route click events to click DLT, email events to email DLT
        String originalTopic = record.topic();
        return new TopicPartition(originalTopic + ".DLT", -1);
    });
```

**Monitor:** Dùng Kafka-UI (port `8090`) để xem DLQ messages. Có thể viết thêm Actuator endpoint `/admin/dlq/retry` để replay DLQ messages.

### 4.3 File Upload Security

- **Validate MIME type** server-side, không tin content-type từ client
- **Max file size:** 5MB (configurable via [AppConstant](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/constant/AppConstant.java#6-93))
- **Presigned URL expiry:** 15 phút cho upload, 60 phút cho download
- **Sanitize file name:** Remove special chars, normalize Unicode

---

## PHẦN 5: Stitch UI Design Prompts

Sử dụng các prompt sau với Google Stitch để thiết kế UI cho các tính năng mới:

### Prompt 1: User Avatar Upload (Settings Page)

> Design a Settings page for a URL shortener web app. The page has two sections side by side: "Profile Information" on the left with a large circular avatar upload area at the top (with camera icon overlay on hover), followed by email (read-only), full name (editable), and provider badge ("Google" or "Local"). The right section is "Change Password" with new password and confirm password fields. Use a clean, minimal design with subtle shadows and rounded corners. Color scheme: dark blue primary (#2563eb), white background, gray borders.

### Prompt 2: URL Management with QR & OG Image

> Design a URL detail/edit dialog for a link shortener app. The dialog has tabs: "General" (edit original URL, custom alias, password, expires date) and "Media" (QR code preview with download button, OG Image upload area with drag-and-drop). Include a preview of how the link appears when shared on social media. Use modern card-based UI with rounded corners and subtle gradients.

### Prompt 3: Enhanced Dashboard with Stats

> Design a dashboard overview page for a URL shortener app. Top section: welcome greeting "Good morning, [Name]!" with subtitle. Below: 3 stat cards in a row (Total URLs with link icon, Total Clicks with chart icon, Active Links with check icon) - each card has large number, percentage change badge, and subtle gradient background. Below cards: a "Create New URL" compact form and a "Recent URLs" table with status badges (Active/Expired), click count, and action dropdown. Use Inter font, clean layout, blue primary color.

### Prompt 4: Email Template Preview

> Design a transactional email template for a URL shortener service. The email has: gradient header bar (blue to purple) with logo and title "Welcome to UrlShort!", white content area with greeting, bullet points of features (Analytics, Custom Links, QR Codes), a blue CTA button "Go to Dashboard", and gray footer with company info. Mobile-responsive, max-width 600px.

---

## Tóm tắt Files cần tạo/sửa

### Files MỚI (~25 files)

| Module | File | Mô tả |
|---|---|---|
| storage | `config/MinioConfig.java` | Bean & auto-create bucket |
| storage | `service/StorageService.java` | Interface |
| storage | `service/MinioStorageService.java` | Implementation |
| storage | `controller/FileController.java` | REST upload/delete/presigned |
| storage | `dto/FileUploadResponse.java` | Response DTO |
| storage | `dto/PresignedUrlResponse.java` | Response DTO |
| storage | `constant/StorageConstant.java` | Max size, allowed types |
| notification | `dto/EmailEventDto.java` | Kafka event DTO |
| notification | `dto/EmailType.java` | Enum |
| notification | `kafka/EmailEventProducer.java` | Publish email event |
| notification | `kafka/EmailEventConsumer.java` | Consume & send email |
| notification | `service/EmailService.java` | High-level send API |
| notification | `service/EmailTemplateRenderer.java` | Thymeleaf render |
| notification | `config/MailConfig.java` | JavaMailSender |
| templates | `email/welcome.html` | Welcome template |
| templates | `email/password-reset.html` | Password reset |
| templates | `email/link-expired.html` | Expiry notification |
| templates | `email/weekly-report.html` | Weekly stats |
| migration | `V3__add_avatar_url.sql` | User avatar field |
| migration | `V4__add_url_media_fields.sql` | URL media fields |
| user | [controller/UserController.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/user/controller/UserController.java) | Thêm `PUT /me/avatar` |

### Files SỬA (~6 files)

| File | Thay đổi |
|---|---|
| [docker-compose.yml](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/docker-compose.yml) | +MinIO, +Mailpit services |
| [build.gradle](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/build.gradle) | +minio, +mail, +thymeleaf deps |
| [application-dev.yml](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/resources/application-dev.yml) | +minio, +mail config |
| [AppConstant.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/constant/AppConstant.java) | +Kafka email topic, +storage constants |
| [KafkaConfig.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/KafkaConfig.java) | +email topic beans, modify DLQ router |
| [SecurityConfig.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/SecurityConfig.java) | Permit `/api/files/**` cho authenticated |

---

## Verification Plan

```bash
# 1. Start infrastructure
docker compose up -d minio mailpit

# 2. Verify MinIO console
open http://localhost:9001   # Login: minioadmin/minioadmin123

# 3. Verify Mailpit UI
open http://localhost:8025   # No login required

# 4. Build backend
./gradlew build

# 5. Test upload
curl -X POST http://localhost:8080/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.png" -F "folder=avatars"

# 6. Test email
# Register new user → check Mailpit UI for welcome email

# 7. Test DLQ
# Stop mailpit → trigger email → check Kafka-UI for DLQ messages
```
