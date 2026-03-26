# 🏗️ Tư Vấn Thiết Kế Backend - URL Shortener (Phần 2)

---

## 4. Thiết Kế Tính Năng API

### 4.1. Phân quyền & Xác thực

**JWT Flow:**
```
[Login] → Server tạo Access Token (15m) + Refresh Token (7d)
        → Client gửi Access Token trong Header: Authorization: Bearer <token>
        → Khi hết hạn, dùng Refresh Token để lấy Access Token mới
```

**Cấu hình Security:**
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/{shortCode}").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Authenticated users
                .requestMatchers("/api/urls/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### 4.2. Danh sách API

#### 🔴 Must-Have APIs

| Method   | Endpoint                  | Role   | Mô tả                                   |
| -------- | ------------------------- | ------ | --------------------------------------- |
| `POST`   | `/api/auth/register`      | Public | Đăng ký tài khoản                       |
| `POST`   | `/api/auth/login`         | Public | Đăng nhập (trả JWT)                     |
| `POST`   | `/api/auth/refresh`       | Public | Refresh access token                    |
| `GET`    | `/api/auth/oauth2/google` | Public | Redirect đến Google OAuth2              |
| `POST`   | `/api/urls`               | User   | Tạo short link mới                      |
| `GET`    | `/api/urls`               | User   | Lấy danh sách link của mình (paginated) |
| `GET`    | `/api/urls/{id}`          | User   | Chi tiết 1 link                         |
| `PUT`    | `/api/urls/{id}`          | User   | Cập nhật link                           |
| `DELETE` | `/api/urls/{id}`          | User   | Xóa link (soft delete)                  |
| `GET`    | `/{shortCode}`            | Public | **Redirect** sang URL gốc               |

#### 🟡 Nice-to-Have APIs

| Method | Endpoint                          | Role   | Mô tả                                |
| ------ | --------------------------------- | ------ | ------------------------------------ |
| `POST` | `/api/urls` (body: `customAlias`) | User   | Tạo link với alias tùy chọn          |
| `PUT`  | `/api/urls/{id}/password`         | User   | Đặt/xóa mật khẩu cho link            |
| `POST` | `/{shortCode}/verify`             | Public | Xác minh mật khẩu trước khi redirect |
| `PUT`  | `/api/urls/{id}/expiration`       | User   | Đặt thời gian hết hạn                |

#### 🟢 Standout / Analytics APIs

| Method | Endpoint                          | Role  | Mô tả                                  |
| ------ | --------------------------------- | ----- | -------------------------------------- |
| `GET`  | `/api/urls/{id}/analytics`        | User  | Tổng quan analytics (clicks, devices…) |
| `GET`  | `/api/urls/{id}/analytics/clicks` | User  | Chi tiết clicks theo thời gian         |
| `GET`  | `/api/admin/urls`                 | Admin | Quản lý tất cả URLs                    |
| `GET`  | `/api/admin/users`                | Admin | Quản lý users                          |
| `GET`  | `/api/admin/dashboard`            | Admin | Thống kê tổng quan hệ thống            |

### 4.3. Kafka cho Analytics Tracking

```
┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────┐
│ Redirect │───▶│ Kafka        │───▶│ Analytics       │───▶│  MySQL   │
│ Controller│   │ Producer     │    │ Consumer        │    │click_events│
│ (sync)   │    │ (async,fire  │    │ (batch insert)  │    │          │
│          │    │  & forget)   │    │                 │    │          │
└──────────┘    └──────────────┘    └─────────────────┘    └──────────┘
     │                                      │
     │ ← Redirect ngay (302)                │ ← Xử lý bất đồng bộ
     │   KHÔNG chờ tracking                 │   Không ảnh hưởng UX
```

**Producer (trong RedirectService):**
```java
@Service
public class RedirectService {
    
    public String redirect(String shortCode, HttpServletRequest request) {
        // 1. Lookup URL (from Redis cache or DB)
        String originalUrl = resolveUrl(shortCode);
        
        // 2. Publish click event ASYNC - fire & forget
        ClickEventDto event = ClickEventDto.builder()
            .shortCode(shortCode)
            .ipAddress(request.getRemoteAddr())
            .userAgent(request.getHeader("User-Agent"))
            .referer(request.getHeader("Referer"))
            .timestamp(Instant.now())
            .build();
        
        kafkaTemplate.send("url-click-events", shortCode, event);
        // Không await kết quả → redirect ngay lập tức
        
        // 3. Return URL to redirect
        return originalUrl;
    }
}
```

**Consumer (batch processing):**
```java
@Service
public class ClickEventConsumer {
    
    @KafkaListener(
        topics = "url-click-events",
        groupId = "analytics-group",
        containerFactory = "batchKafkaListenerContainerFactory"
    )
    public void consume(List<ConsumerRecord<String, ClickEventDto>> records) {
        List<ClickEvent> events = records.stream()
            .map(this::enrichAndConvert)  // Parse User-Agent, GeoIP lookup
            .toList();
        
        // Batch insert for performance
        clickEventRepository.saveAll(events);
        
        // Update click_count in urls table (batch)
        Map<String, Long> countByCode = records.stream()
            .collect(Collectors.groupingBy(
                r -> r.value().getShortCode(), Collectors.counting()));
        countByCode.forEach((code, count) -> 
            urlRepository.incrementClickCount(code, count));
    }
}
```

---

## 5. Xử Lý Rủi Ro, Hiệu Năng & Nút Thắt

### 5.1. Redis - Cache Strategies cho Redirect

**Cache-Aside Pattern:**
```java
public String resolveUrl(String shortCode) {
    // 1. Check Redis
    String cached = redisTemplate.opsForValue().get("url:" + shortCode);
    if (cached != null) {
        if ("NULL".equals(cached)) return null;  // Cache Penetration guard
        return cached;
    }
    
    // 2. Query DB
    Url url = urlRepository.findByShortCode(shortCode).orElse(null);
    
    if (url == null) {
        // Cache Penetration: cache NULL value với TTL ngắn
        redisTemplate.opsForValue().set("url:" + shortCode, "NULL", 
            Duration.ofMinutes(5));
        return null;
    }
    
    // 3. Populate cache (TTL 24h + random jitter chống Stampede)
    long jitter = ThreadLocalRandom.current().nextLong(0, 300);
    redisTemplate.opsForValue().set("url:" + shortCode, url.getOriginalUrl(), 
        Duration.ofHours(24).plusSeconds(jitter));
    
    return url.getOriginalUrl();
}
```

| Vấn đề                                                        | Giải pháp                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Cache Penetration** (query URL không tồn tại)               | Cache giá trị NULL với TTL ngắn (5 phút)                             |
| **Cache Stampede** (nhiều request đồng thời khi cache expire) | Random jitter TTL + Distributed lock (Redis SETNX) cho cache rebuild |
| **Cache Avalanche** (nhiều key expire cùng lúc)               | Random jitter trên TTL để phân tán thời điểm expire                  |
| **Hot Key** (1 URL viral)                                     | Local cache (Caffeine) trước Redis, TTL 30s                          |

### 5.2. Kafka - Thiết kế Topic & Xử lý lỗi

**Topic Design:**
```yaml
# Topic: url-click-events
Partitions: 6        # Scale consumer instances (max 6 consumers/group)
Replication Factor: 3 # High availability
Retention: 7 days
Key: shortCode        # Cùng shortCode → cùng partition → ordering
```

**Xử lý message lỗi:**
```java
@Configuration
public class KafkaConsumerConfig {
    @Bean
    public DefaultErrorHandler errorHandler() {
        // Retry 3 lần, backoff 1s → 2s → 4s
        BackOff backOff = new ExponentialBackOff(1000L, 2.0);
        backOff.setMaxElapsedTime(10000L);
        
        DefaultErrorHandler handler = new DefaultErrorHandler(
            new DeadLetterPublishingRecoverer(kafkaTemplate), // → DLT
            backOff
        );
        // Không retry cho lỗi deserialization
        handler.addNotRetryableExceptions(DeserializationException.class);
        return handler;
    }
}
```

```
url-click-events (main) ──[fail 3x]──▶ url-click-events.DLT (Dead Letter Topic)
                                              │
                                       Monitor & Alert
                                       Manual reprocess khi fix bug
```

### 5.3. Rate Limiting

**Dùng Redis Sliding Window:**
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    
    private static final int MAX_REQUESTS = 10;  // 10 requests
    private static final int WINDOW_SECONDS = 60; // per minute
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
            HttpServletResponse response, FilterChain chain) {
        
        if (!request.getRequestURI().startsWith("/api/urls")) {
            chain.doFilter(request, response);
            return;
        }
        
        String key = "rate:" + extractUserId(request);
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
        }
        
        if (count > MAX_REQUESTS) {
            response.setStatus(429);
            response.getWriter().write("Too many requests");
            return;
        }
        
        response.setHeader("X-RateLimit-Remaining", 
            String.valueOf(MAX_REQUESTS - count));
        chain.doFilter(request, response);
    }
}
```

> [!WARNING]
> **Redirect API (`/{shortCode}`) KHÔNG nên rate limit quá chặt** — vì đây là mục đích chính của hệ thống. Chỉ rate limit API tạo link và API management.

---

## 6. Observability, Testing & Deployment

### 6.1. Logging & Monitoring Stack

```
┌─────────────┐    ┌─────────┐    ┌───────────────┐    ┌──────────┐
│ Spring Boot │───▶│ Logback │───▶│ ELK Stack     │───▶│ Kibana   │
│ (SLF4J)     │    │ (JSON)  │    │ (Log storage) │    │ (Search) │
└─────────────┘    └─────────┘    └───────────────┘    └──────────┘

┌─────────────┐    ┌───────────┐    ┌────────────┐    ┌──────────┐
│ Actuator    │───▶│Micrometer │───▶│ Prometheus │───▶│ Grafana  │
│ /metrics    │    │           │    │ (Scrape)   │    │(Dashboard│
└─────────────┘    └───────────┘    └────────────┘    └──────────┘
```

**Custom Metrics quan trọng:**
```java
@Component
public class UrlMetrics {
    private final Counter redirectCounter;
    private final Counter createCounter;
    private final Timer redirectLatency;
    
    public UrlMetrics(MeterRegistry registry) {
        this.redirectCounter = Counter.builder("url.redirects.total")
            .description("Total redirects").register(registry);
        this.createCounter = Counter.builder("url.creates.total")
            .description("Total URLs created").register(registry);
        this.redirectLatency = Timer.builder("url.redirect.latency")
            .description("Redirect latency").register(registry);
    }
}
```

### 6.2. Testing Strategy

| Loại                 | Công cụ                              | Scope                     | Tỉ lệ |
| -------------------- | ------------------------------------ | ------------------------- | ----- |
| **Unit Test**        | JUnit 5 + Mockito                    | Service logic, Utils      | ~60%  |
| **Integration Test** | Testcontainers (MySQL, Redis, Kafka) | Repository, API endpoints | ~30%  |
| **E2E Test**         | REST Assured                         | Full flow                 | ~10%  |

**Testcontainers example:**
```java
@SpringBootTest
@Testcontainers
class UrlServiceIntegrationTest {
    
    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
        .withDatabaseName("urlshortener_test");
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7")
        .withExposedPorts(6379);
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", 
            () -> redis.getMappedPort(6379));
    }
    
    @Autowired private UrlService urlService;
    
    @Test
    void shouldCreateAndResolveShortUrl() {
        // Given
        CreateUrlRequest request = CreateUrlRequest.builder()
            .originalUrl("https://example.com/very-long-url")
            .build();
        // When
        CreateUrlResponse response = urlService.create(request, userId);
        String resolved = urlService.resolve(response.getShortCode());
        // Then
        assertThat(resolved).isEqualTo("https://example.com/very-long-url");
    }
}
```

### 6.3. Docker Deployment

**Dockerfile (Multi-stage build):**
```dockerfile
# Stage 1: Build
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon    # Cache dependencies layer
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
USER appuser                            # Non-root user (bảo mật)
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      mysql: { condition: service_healthy }
      redis: { condition: service_healthy }
      kafka: { condition: service_healthy }
    networks: [app-network]

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MYSQL_DATABASE: urlshortener
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      retries: 5
    secrets: [db_root_password]
    networks: [app-network]

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes: [redis-data:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
    networks: [app-network]

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks: [app-network]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on: [zookeeper]
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "false"
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 15s
    networks: [app-network]

volumes:
  mysql-data:
  redis-data:

networks:
  app-network:
    driver: bridge

secrets:
  db_root_password:
    file: ./secrets/db_root_password.txt
```

**Lưu ý bảo mật & tối ưu Docker:**

| Hạng mục              | Best Practice                                                    |
| --------------------- | ---------------------------------------------------------------- |
| **Image size**        | Multi-stage build + Alpine base → ~150MB thay vì ~500MB          |
| **Non-root user**     | `USER appuser` — không chạy container bằng root                  |
| **Secrets**           | Dùng Docker Secrets, **KHÔNG** hardcode password trong env       |
| **Health checks**     | Tất cả services phải có healthcheck                              |
| **Network isolation** | Tạo network riêng, chỉ expose port cần thiết                     |
| **Layer caching**     | COPY `build.gradle` trước `src/` để cache dependency layer       |
| **JVM tuning**        | `MaxRAMPercentage=75.0` — JVM tự điều chỉnh theo container limit |

---

## Tổng Kết Trade-off Chính

| Quyết định | Lựa chọn                 | Trade-off chấp nhận                                     |
| ---------- | ------------------------ | ------------------------------------------------------- |
| Kiến trúc  | Modular Monolith         | Chưa scale độc lập từng module, nhưng đơn giản vận hành |
| Database   | MySQL + Redis            | Cần maintain 2 hệ thống, nhưng performance tuyệt vời    |
| Short code | Counter (Redis) + Base62 | Phụ thuộc Redis, nhưng zero collision & rất nhanh       |
| Analytics  | Kafka async              | Thêm complexity (Kafka), nhưng không block redirect     |
| Auth       | JWT + OAuth2             | Stateless, cần xử lý token revocation riêng             |
