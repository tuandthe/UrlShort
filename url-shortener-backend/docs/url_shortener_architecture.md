# 🏗️ Tư Vấn Thiết Kế Backend - URL Shortener (Production-Ready)

> **Tech Stack**: Java (Spring Boot) · MySQL · Redis · Kafka · Email Service
> **Vai trò tư vấn**: Senior Backend Architect & Lead Java Engineer

---

## 1. Kiến Trúc Tổng Thể (System Architecture)

### 1.1. So sánh kiến trúc

| Tiêu chí | Monolithic | Modular Monolithic | Microservices |
|---|---|---|---|
| **Độ phức tạp triển khai** | ⭐ Thấp | ⭐⭐ Trung bình | ⭐⭐⭐ Cao |
| **Khả năng scale** | Chỉ scale cả app | Scale cả app, nhưng code tách biệt | Scale từng service độc lập |
| **Tốc độ phát triển ban đầu** | Nhanh nhất | Nhanh | Chậm (setup infra nhiều) |
| **Chi phí vận hành** | Thấp | Thấp | Cao (K8s, Service Mesh…) |
| **Khả năng chuyển đổi** | Khó refactor | Dễ tách thành Microservices | Đã là đích đến |

### ✅ Đề xuất: **Modular Monolithic**

**Lý do thực tế:**
- URL Shortener có domain không quá phức tạp, chưa cần tách Microservices ngay.
- Modular Monolithic giữ **deployment đơn giản** (1 artifact) nhưng **code được tổ chức theo module** rõ ràng.
- Khi traffic tăng, dễ dàng **tách module Analytics** (consume Kafka) thành service riêng mà không cần refactor lớn.
- Team nhỏ (1-3 devs) → Microservices sẽ tạo overhead không cần thiết.

> [!TIP]
> **Chiến lược tiến hóa**: Monolith Modular → Tách Analytics Service khi cần → Full Microservices khi scale lớn.

### 1.2. Lựa chọn Database

| Tiêu chí | MySQL (SQL) | MongoDB (NoSQL) | Cassandra (NoSQL) |
|---|---|---|---|
| **Read performance** | Tốt (với index) | Tốt | Rất tốt (linear scale) |
| **Write performance** | Tốt | Tốt | Rất tốt |
| **ACID Transactions** | ✅ Đầy đủ | Partial | Eventual consistency |
| **Schema flexibility** | Cứng | Linh hoạt | Linh hoạt |
| **Ecosystem Spring Boot** | Rất mature | Tốt | Tốt |
| **Phù hợp khi** | Data có quan hệ, cần JOIN | Document-oriented | Write-heavy, massive scale |

### ✅ Đề xuất: **MySQL**

**Lý do:**
- URL Shortener cần **quan hệ rõ ràng**: User → URLs → Click Analytics.
- MySQL + **proper indexing** trên `short_code` (UNIQUE INDEX) cho tốc độ lookup rất nhanh.
- Kết hợp **Redis cache** phía trước → 95%+ request redirect sẽ hit cache, MySQL chỉ chịu cold-start.
- Hệ sinh thái Spring Data JPA + Flyway rất mature với MySQL.
- Nếu tương lai cần scale read → MySQL Read Replicas. Scale write → Sharding theo `short_code`.

> [!IMPORTANT]
> Cassandra chỉ thực sự cần khi hệ thống đạt hàng tỷ URLs và hàng triệu writes/s. Ở giai đoạn đầu, MySQL + Redis là quá đủ.

### 1.3. Sơ đồ kiến trúc tổng quan

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│   Client     │────▶│            API Gateway / Load Balancer        │
│  (Browser)   │     └──────────────┬───────────────────────────────┘
└─────────────┘                     │
                                    ▼
                    ┌───────────────────────────────────┐
                    │     Spring Boot Application        │
                    │  ┌───────────┐  ┌──────────────┐  │
                    │  │ URL Module │  │ Auth Module  │  │
                    │  └─────┬─────┘  └──────────────┘  │
                    │  ┌─────┴─────┐  ┌──────────────┐  │
                    │  │ Analytics  │  │ Admin Module │  │
                    │  │  Module    │  │              │  │
                    │  └───────────┘  └──────────────┘  │
                    └──────┬────────────┬───────────────┘
                           │            │
              ┌────────────┤            ├────────────┐
              ▼            ▼            ▼            ▼
         ┌────────┐  ┌──────────┐ ┌─────────┐ ┌──────────┐
         │ MySQL  │  │  Redis   │ │  Kafka  │ │  Email   │
         │  (DB)  │  │ (Cache)  │ │(Events) │ │ Service  │
         └────────┘  └──────────┘ └─────────┘ └──────────┘
```

---

## 2. Thuật Toán Cốt Lõi (Core Algorithms)

### 2.1. So sánh thuật toán tạo Short Code

| Thuật toán | Ưu điểm | Nhược điểm | Collision |
|---|---|---|---|
| **Base62 + Auto-increment ID** | Đơn giản, không collision | Dễ đoán (sequential), phụ thuộc DB | ❌ Không có |
| **Base62 + Snowflake ID** | Unique, distributed-friendly | Dài hơn (do ID lớn), phức tạp hơn | ❌ Không có |
| **MD5/SHA256 cắt chuỗi** | Deterministic (cùng URL = cùng code) | Collision khi cắt ngắn | ⚠️ Có thể có |
| **NanoID / Random** | Đơn giản, ngắn, không đoán được | Collision (cần check DB) | ⚠️ Có thể có |
| **Base62 + Counter Service (Redis)** | Nhanh, không collision, scale tốt | Phụ thuộc Redis, cần range allocation | ❌ Không có |

### ✅ Đề xuất: **Base62 Encoding + Counter Service (Redis)**

```java
// Ý tưởng: Redis INCR cho counter → Base62 encode
@Service
public class ShortCodeGenerator {
    private static final String CHARS = 
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    public String generate() {
        // Redis INCR đảm bảo atomic, không collision
        Long counter = redisTemplate.opsForValue()
            .increment("url:counter");
        return encodeBase62(counter);
    }
    
    private String encodeBase62(long value) {
        StringBuilder sb = new StringBuilder();
        while (value > 0) {
            sb.append(CHARS.charAt((int)(value % 62)));
            value /= 62;
        }
        // Pad to minimum 6 chars
        while (sb.length() < 6) sb.append('0');
        return sb.reverse().toString();
    }
}
```

**Tại sao chọn phương án này?**
- `INCR` trong Redis là **atomic** → không bao giờ collision, không cần check DB.
- Base62 với 6 ký tự = **62^6 ≈ 56.8 tỷ** mã → quá đủ cho production.
- Tốc độ: Redis INCR ~ **100k ops/s** trên single node.

### 2.2. Xử lý Collision & Concurrency

**Với Counter-based approach: Không có collision** vì Redis `INCR` là atomic.

**Nếu dùng Random/Hash-based:**
```java
// Retry pattern với exponential backoff
public String generateWithRetry(int maxRetries) {
    for (int i = 0; i < maxRetries; i++) {
        String code = generateRandom();
        try {
            // UNIQUE constraint trên DB sẽ throw nếu trùng
            urlRepository.save(new Url(code, originalUrl));
            return code;
        } catch (DataIntegrityViolationException e) {
            // Collision → retry với code mới
            log.warn("Collision detected, retry attempt: {}", i + 1);
        }
    }
    throw new CodeGenerationException("Failed after max retries");
}
```

**Concurrency với Custom Alias:**
```java
// Dùng Redis SETNX (SET if Not eXists) để lock alias
public boolean tryReserveAlias(String alias) {
    Boolean success = redisTemplate.opsForValue()
        .setIfAbsent("alias:lock:" + alias, "1", Duration.ofSeconds(30));
    return Boolean.TRUE.equals(success);
}
```

> [!NOTE]
> **Range Allocation Pattern** (nâng cao): Mỗi instance lấy 1 range (vd: 1-1000, 1001-2000) từ Redis. Trong range đó, tự tăng counter local → Giảm call Redis, tăng throughput.

---

## 3. Cấu Trúc Source Code & Tiêu Chuẩn Code

### 3.1. Folder Structure - Modular Monolith + Clean Architecture

```
url-shortener-backend/
├── src/main/java/com/example/urlshortener/
│   ├── UrlShortenerApplication.java
│   │
│   ├── common/                          # ─── Shared Infrastructure ───
│   │   ├── config/
│   │   │   ├── RedisConfig.java
│   │   │   ├── KafkaConfig.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── WebConfig.java
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── BusinessException.java
│   │   │   └── ErrorCode.java          # Enum error codes
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── CustomUserDetailsService.java
│   │   ├── dto/
│   │   │   └── ApiResponse.java        # Wrapper response chuẩn
│   │   └── util/
│   │       └── Base62Encoder.java
│   │
│   ├── auth/                            # ─── Auth Module ───
│   │   ├── controller/
│   │   │   └── AuthController.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── OAuth2Service.java
│   │   └── entity/
│   │       └── (dùng chung User entity)
│   │
│   ├── user/                            # ─── User Module ───
│   │   ├── controller/
│   │   │   └── UserController.java
│   │   ├── dto/
│   │   ├── service/
│   │   │   └── UserService.java
│   │   ├── repository/
│   │   │   └── UserRepository.java
│   │   └── entity/
│   │       └── User.java
│   │
│   ├── url/                             # ─── URL Module (Core) ───
│   │   ├── controller/
│   │   │   ├── UrlController.java       # CRUD APIs
│   │   │   └── RedirectController.java  # GET /{shortCode}
│   │   ├── dto/
│   │   │   ├── CreateUrlRequest.java
│   │   │   ├── CreateUrlResponse.java
│   │   │   └── UrlDetailResponse.java
│   │   ├── service/
│   │   │   ├── UrlService.java
│   │   │   ├── ShortCodeGenerator.java  # Interface (Strategy)
│   │   │   └── RedirectService.java
│   │   ├── strategy/                    # Strategy implementations
│   │   │   ├── CounterBasedGenerator.java
│   │   │   └── RandomBasedGenerator.java
│   │   ├── repository/
│   │   │   └── UrlRepository.java
│   │   └── entity/
│   │       └── Url.java
│   │
│   ├── analytics/                       # ─── Analytics Module ───
│   │   ├── controller/
│   │   │   └── AnalyticsController.java
│   │   ├── dto/
│   │   │   ├── ClickEventDto.java
│   │   │   └── AnalyticsResponse.java
│   │   ├── service/
│   │   │   └── AnalyticsService.java
│   │   ├── kafka/
│   │   │   ├── ClickEventProducer.java
│   │   │   └── ClickEventConsumer.java
│   │   ├── repository/
│   │   │   └── ClickEventRepository.java
│   │   └── entity/
│   │       └── ClickEvent.java
│   │
│   └── admin/                           # ─── Admin Module ───
│       ├── controller/
│       │   └── AdminController.java
│       ├── dto/
│       └── service/
│           └── AdminService.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/                    # Flyway
│       ├── V1__create_users_table.sql
│       ├── V2__create_urls_table.sql
│       └── V3__create_click_events_table.sql
│
└── src/test/java/com/example/urlshortener/
    ├── url/
    │   ├── UrlServiceTest.java          # Unit Test
    │   └── UrlControllerIntegrationTest.java
    └── analytics/
        └── ClickEventConsumerTest.java
```

### 3.2. Design Patterns áp dụng

| Pattern | Áp dụng ở đâu | Mục đích |
|---|---|---|
| **Strategy** | `ShortCodeGenerator` interface + các implementation | Dễ swap thuật toán gen code |
| **Builder** | DTO objects (Lombok `@Builder`) | Tạo object phức tạp dễ đọc |
| **Factory Method** | `ClickEventFactory` | Tạo ClickEvent từ HttpServletRequest |
| **Template Method** | `AbstractOAuth2Service` | Xử lý flow OAuth2 chung, override cho từng provider |
| **Observer/Pub-Sub** | Kafka Producer/Consumer | Tách biệt redirect và tracking |
| **Decorator** | Cache layer wrap Repository | Thêm caching mà không sửa logic gốc |

**Ví dụ Strategy Pattern:**
```java
// Interface
public interface ShortCodeGenerator {
    String generate();
    String getType(); // "COUNTER" hoặc "RANDOM"
}

// Config chọn strategy qua properties
@Configuration
public class CodeGeneratorConfig {
    @Bean
    @ConditionalOnProperty(name = "app.code-generator.type", havingValue = "counter")
    public ShortCodeGenerator counterBased(StringRedisTemplate redis) {
        return new CounterBasedGenerator(redis);
    }
    
    @Bean
    @ConditionalOnProperty(name = "app.code-generator.type", havingValue = "random")
    public ShortCodeGenerator randomBased() {
        return new RandomBasedGenerator();
    }
}
```

### 3.3. Database Migration với Flyway

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    provider ENUM('LOCAL', 'GOOGLE') DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_provider (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- V2__create_urls_table.sql
CREATE TABLE urls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    user_id BIGINT,
    password VARCHAR(255),              -- nullable: link có mật khẩu
    expires_at TIMESTAMP,               -- nullable: thời gian hết hạn
    is_active BOOLEAN DEFAULT TRUE,
    click_count BIGINT DEFAULT 0,       -- denormalized counter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_short_code (short_code),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- V3__create_click_events_table.sql
CREATE TABLE click_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_url_id (url_id),
    INDEX idx_clicked_at (clicked_at),
    INDEX idx_url_clicked (url_id, clicked_at),
    FOREIGN KEY (url_id) REFERENCES urls(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> [!TIP]
> **Naming convention Flyway**: `V{version}__{description}.sql`. Hai dấu gạch dưới `__` là bắt buộc. Version phải tăng dần và không được thay đổi file đã chạy.
