# URL Shortener Platform

Nền tảng rút gọn liên kết full-stack, xây dựng theo hướng production-ready, gồm backend API, frontend dashboard và hạ tầng hỗ trợ (cache, message broker, object storage).

## 1) Tổng quan dự án

- **Mục tiêu**: tạo, quản lý và theo dõi link rút gọn cho người dùng cá nhân/doanh nghiệp.
- **Giá trị chính**:
  - Rút gọn URL nhanh, dễ chia sẻ.
  - Theo dõi analytics (clicks, xu hướng sử dụng).
  - Hệ thống xác thực và phân quyền rõ ràng.
  - Sẵn sàng mở rộng nhờ kiến trúc module + hạ tầng event/cache.

## 2) Kiến trúc hệ thống

### Backend (`url-shortener-backend`)

- **Framework**: Spring Boot 4, Java 21.
- **Kiến trúc**: Modular Monolith (chia module theo domain).
- **Các module chính**:
  - `auth`, `user`
  - `url`
  - `analytics`
  - `admin`
  - `storage` (MinIO)
  - `notification` (email)
  - `common` (config, security, shared components)

### Frontend (`url-shortener-frontend`)

- **Framework**: Next.js 15 (App Router), React 19, TypeScript.
- **UI/UX**: Tailwind CSS + các component hiện đại.
- **Các khu vực chức năng**:
  - `landing`
  - `auth`
  - `dashboard`
  - `urls`
  - `analytics`
  - `settings`
  - `admin`

## 3) Công nghệ sử dụng

- **Backend**: Spring Web MVC, Spring Data JPA, Spring Security, OAuth2 Client, Flyway, Kafka, Redis, MinIO, Actuator, OpenAPI.
- **Database**: PostgreSQL.
- **Frontend**: Next.js, React, TypeScript, React Query, React Hook Form, Zod.
- **Infra/DevOps**: Docker, Docker Compose, Prometheus metrics, logging.

## 4) Điểm nổi bật kỹ thuật

- Thiết kế module rõ ràng, dễ bảo trì và mở rộng.
- Kết hợp **Redis** để tối ưu hiệu năng truy cập nóng.
- Tích hợp **Kafka** để xử lý sự kiện bất đồng bộ.
- Hỗ trợ **OAuth2 + JWT** cho xác thực hiện đại.
- Dùng **Flyway** quản lý migration database theo môi trường.
- Hỗ trợ **MinIO** cho các nhu cầu lưu trữ object/media.

## 5) Cấu trúc repository

```text
UrlShort/
├── url-shortener-backend/
│   ├── src/
│   ├── docker-compose.yml
│   └── build.gradle
└── url-shortener-frontend/
    ├── src/
    ├── package.json
    └── docs/
```

## 6) Chạy nhanh local

### Backend

```bash
cd url-shortener-backend
./gradlew bootRun
```

Hoặc chạy bằng Docker Compose:

```bash
cd url-shortener-backend
docker compose up -d
```

### Frontend

```bash
cd url-shortener-frontend
npm install
npm run dev
```

## 7) Tài liệu chi tiết

- Backend architecture: `url-shortener-backend/docs/url_shortener_architecture.md`
- Backend implementation plan: `url-shortener-backend/docs/implementation_plan.md`
- Frontend architecture plan: `url-shortener-frontend/docs/frontend_architecture_plan.md`

---

Nếu bạn là nhà tuyển dụng/tech lead và cần bản tóm tắt theo tiêu chí cụ thể (System Design, Clean Code, Testing, DevOps), có thể dùng repository này như một case study full-stack Java + Next.js ở mức production-oriented.