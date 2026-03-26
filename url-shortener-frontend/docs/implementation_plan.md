# Frontend Code Quality & Missing Pages — Implementation Plan

## Tổng quan

Sau khi audit toàn bộ Frontend codebase, tôi tìm thấy **4 nhóm vấn đề** cần xử lý. Dưới đây là kế hoạch chi tiết.

---

## 1. Constants — Tập trung hóa các giá trị fix cứng

Hiện tại thư mục `shared/constants/` đang **trống hoàn toàn**. Các chuỗi text, giá trị cấu hình nằm rải rác khắp components.

### Proposed Changes

#### [NEW] [routes.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/shared/constants/routes.ts)
Tập trung toàn bộ route paths:
```typescript
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  URLS: "/urls",
  ANALYTICS: "/analytics",
  ANALYTICS_DETAIL: (id: number) => `/analytics/${id}`,
  SETTINGS: "/settings",
  ADMIN: "/admin",
  OAUTH_CALLBACK: "/oauth2/callback",
} as const;
```

#### [NEW] [api.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/shared/constants/api.ts)
Tập trung toàn bộ API endpoint paths:
```typescript
export const API_ENDPOINTS = {
  AUTH: { LOGIN: "/auth/login", REGISTER: "/auth/register", REFRESH: "/auth/refresh", LOGOUT: "/auth/logout" },
  URLS: { BASE: "/urls", DETAIL: (id: number) => `/urls/${id}` },
  ANALYTICS: { URL: (id: number) => `/analytics/urls/${id}` },
  USERS: { ME: "/users/me" },
  ADMIN: { STATS: "/admin/stats" },
} as const;
```

#### [NEW] [app.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/shared/constants/app.ts)
Tập trung UI constants:
```typescript
export const APP_NAME = "UrlShort";
export const PAGINATION = { DEFAULT_PAGE: 0, DEFAULT_SIZE: 10 } as const;
export const POLLING_INTERVAL = 30000; // 30s for analytics
```

#### Files cần update để dùng constants
- [Navbar.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/dashboard/components/Navbar.tsx) → dùng `ROUTES.*`
- [urlApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/services/urlApi.ts), [authApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/services/authApi.ts), [analyticsApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/services/analyticsApi.ts) → dùng `API_ENDPOINTS.*`
- [useAnalytics.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/hooks/useAnalytics.ts) → dùng `POLLING_INTERVAL`
- [UrlsTable.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/UrlsTable.tsx) → dùng `ROUTES.ANALYTICS_DETAIL(id)` và `PAGINATION`
- [LoginForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/LoginForm.tsx), [RegisterForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/RegisterForm.tsx) → dùng `ROUTES.*`
- OAuth callback [page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28auth%29/login/page.tsx) → dùng `ROUTES.DASHBOARD`

---

## 2. Dùng màu Global thay vì Hex cứng

Trong [globals.css](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/globals.css) đã config sẵn hệ thống màu design token (`--chart-1` tới `--chart-5`, `--primary`, `--destructive`...). Nhưng [AnalyticsDashboard.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/components/AnalyticsDashboard.tsx) đang dùng **3 hex cứng**:

| Vị trí | Giá trị cứng | Thay bằng CSS variable |
|---|---|---|
| Line chart stroke | `#2563eb` | `hsl(var(--chart-1))` hoặc Tailwind `text-chart-1` |
| Bar chart fill | `#10b981` | `hsl(var(--chart-2))` hoặc `text-chart-2` |
| Tooltip border | `#e2e8f0` | `hsl(var(--border))` hoặc `text-border` |

#### [MODIFY] [AnalyticsDashboard.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/components/AnalyticsDashboard.tsx)
- Thay 3 giá trị hex bằng CSS variables từ [globals.css](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/globals.css)
- Sử dụng `useTheme` hoặc đọc CSS var qua JS để truyền vào Recharts props

---

## 3. Trang Global thiếu: loading, error, not-found

Hiện tại **không có** các file này ở bất kỳ level nào:

#### [NEW] [loading.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/loading.tsx)
- Global loading với spinner animation, dùng CSS var `primary`

#### [NEW] [error.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/error.tsx)
- Global error boundary với `"use client"`, nút "Try again" gọi `reset()`, message lỗi thân thiện

#### [NEW] [not-found.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/not-found.tsx)
- Trang 404 với link quay về Dashboard

#### [NEW] [(dashboard)/loading.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/loading.tsx)
- Dashboard-specific loading skeleton (Cards, Tables)

#### [NEW] [(dashboard)/error.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/error.tsx)
- Dashboard-specific error boundary

---

## 4. Triển khai các page còn thiếu (Backend API đã sẵn sàng)

### 4A. Settings Page — Backend API: `GET/PUT /api/users/me`

> [!IMPORTANT]
> Thư mục `src/app/(dashboard)/settings/` đang **trống**. Backend đã có [UserController](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/user/controller/UserController.java#22-49) với 2 endpoints sẵn sàng.

#### [NEW] [userApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/services/userApi.ts)
```typescript
// GET /users/me → UserProfile
// PUT /users/me → UpdateProfile { fullName, newPassword }
```

#### [NEW] [user.types.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/types/user.types.ts)
```typescript
export interface UserProfile {
  id: number; email: string; fullName: string;
  role: string; isActive: boolean; provider: string;
}
export interface UpdateProfileInput { fullName?: string; newPassword?: string; }
```

#### [NEW] [useProfile.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/hooks/useProfile.ts)
- `useProfile()` — React Query hook gọi `GET /users/me`
- `useUpdateProfile()` — mutation hook gọi `PUT /users/me`

#### [NEW] [ProfileForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/components/ProfileForm.tsx)
- Form hiển thị: Email (read-only), Full Name (editable), Provider (read-only)
- Form đổi mật khẩu: New Password, Confirm Password

#### [NEW] [settings/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/settings/page.tsx)
- Trang Settings với 2 Card: Profile Info + Change Password

---

### 4B. Admin Dashboard — Backend API: `GET /api/admin/stats`

> [!IMPORTANT]
> Thư mục `src/app/(admin)/admin/` chỉ có folders rỗng `urls/` và `users/`. Backend chỉ có 1 endpoint `GET /api/admin/stats` (cần role ADMIN).

#### [NEW] [adminApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/admin/services/adminApi.ts)
```typescript
// GET /admin/stats → Map<String, Object> (totalUsers, totalUrls, totalClicks...)
```

#### [NEW] [admin/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(admin)/admin/page.tsx)
- Dashboard hiển thị các stat card: Total Users, Total URLs, Total Clicks
- Guard: chỉ role ADMIN mới truy cập được

#### [NEW] [(admin)/layout.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(admin)/layout.tsx)
- Layout riêng cho admin với sidebar hoặc navbar khác biệt + guard check role

---

### 4C. Tách logic Components (Separation of Concerns)

Các component sau đang **trộn logic + UI** trong cùng 1 file:

| Component | Vấn đề | Đề xuất |
|---|---|---|
| [UrlsTable.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/UrlsTable.tsx) (153 dòng) | Chứa cả state, hooks, handlers, UI | Tách `useUrlsTableLogic()` hook ra riêng |
| [AnalyticsDashboard.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/components/AnalyticsDashboard.tsx) (129 dòng) | `useMemo` transform data + Recharts UI | Tách `useFormattedAnalytics()` hook xử lý transform data |
| [CreateUrlForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/CreateUrlForm.tsx) (112 dòng) | Chấp nhận được, nhưng nên tách validation | Giữ nguyên, chỉ import constants |
| [LoginForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/LoginForm.tsx) | Trộn Google OAuth redirect logic | Tách `useGoogleLogin()` hook |

---

## Tóm tắt danh sách file mới

| # | File | Mô tả |
|---|---|---|
| 1 | `shared/constants/routes.ts` | Route paths |
| 2 | `shared/constants/api.ts` | API endpoints |
| 3 | `shared/constants/app.ts` | App-wide values |
| 4 | `app/loading.tsx` | Global loading |
| 5 | `app/error.tsx` | Global error boundary |
| 6 | `app/not-found.tsx` | 404 page |
| 7 | `app/(dashboard)/loading.tsx` | Dashboard loading skeleton |
| 8 | `app/(dashboard)/error.tsx` | Dashboard error boundary |
| 9 | `features/settings/` (5 files) | Settings feature module |
| 10 | `app/(dashboard)/settings/page.tsx` | Settings page |
| 11 | `features/admin/` (2 files) | Admin feature module |
| 12 | `app/(admin)/admin/page.tsx` | Admin dashboard |
| 13 | `app/(admin)/layout.tsx` | Admin layout + guard |

> **Tổng cộng: ~15 file mới + ~8 file cần update**

## Verification Plan

### Automated Tests
```bash
npm run build   # TypeScript compilation check
```

### Manual Verification
- Test 404 page bằng cách truy cập URL không tồn tại
- Test loading state khi chuyển trang
- Test Settings page: xem profile, đổi tên, đổi mật khẩu
- Test Admin page: xem stats (cần tài khoản ADMIN)
- Kiểm tra Dark Mode: tất cả màu phải dùng CSS variables
