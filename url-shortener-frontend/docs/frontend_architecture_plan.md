# 🏗️ Frontend Architecture Plan — URL Shortener (Production-Ready)

> **Tech Stack**: Next.js 15 (App Router) · TypeScript · TailwindCSS
> **Backend**: Spring Boot (RESTful API, JWT + Google OAuth2)
> **Vai trò tư vấn**: Senior Frontend Architect & Lead React/Next.js Engineer

---

## 1. Kiến trúc Tổng thể & Cấu trúc thư mục

### 1.1. So sánh các pattern tổ chức thư mục

| Tiêu chí | Feature-Sliced Design (FSD) | Modular by Feature | Flat (Pages + Components) |
|---|---|---|---|
| **Độ phức tạp cấu hình** | ⭐⭐⭐ Cao (layer rules) | ⭐⭐ Trung bình | ⭐ Thấp |
| **Khả năng scale** | Rất tốt (team lớn) | Tốt (team vừa) | Kém khi >15 components |
| **Learning curve** | Cao (7 layers) | Thấp | Rất thấp |
| **Phù hợp khi** | Enterprise, team 5+ devs | SaaS, team 1-5 devs | MVP, prototype nhanh |
| **Dependency control** | Rất chặt chẽ | Tốt | Không có |

### ✅ Đề xuất: **Modular by Feature** (biến thể nhẹ của FSD)

**Lý do thực tế:**
- Dự án URL Shortener có 4-5 feature modules rõ ràng (Auth, URLs, Analytics, Admin, Landing).
- Team nhỏ → FSD đầy đủ 7 layers là overkill, nhưng cần hơn flat structure.
- Modular by Feature giữ được tính tổ chức rõ ràng, dễ tìm file, dễ onboard thành viên mới.

### 1.2. Cấu trúc thư mục đề xuất

```
url-shortener-frontend/
├── src/
│   ├── app/                            # ─── Next.js App Router ───
│   │   ├── (auth)/                     # Route group: không tạo layout riêng
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx              # Auth layout (centered, minimal)
│   │   ├── (dashboard)/                # Route group: protected area
│   │   │   ├── dashboard/page.tsx      # Trang overview
│   │   │   ├── urls/
│   │   │   │   ├── page.tsx            # Danh sách URLs
│   │   │   │   ├── [id]/page.tsx       # Chi tiết + Analytics
│   │   │   │   └── create/page.tsx     # Tạo short link
│   │   │   ├── analytics/page.tsx      # Tổng quan analytics
│   │   │   ├── settings/page.tsx       # Cài đặt tài khoản
│   │   │   └── layout.tsx              # Dashboard layout (sidebar + header)
│   │   ├── (admin)/                    # Route group: admin only
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx            # Admin dashboard
│   │   │   │   ├── urls/page.tsx       # Quản lý tất cả URLs
│   │   │   │   └── users/page.tsx      # Quản lý users
│   │   │   └── layout.tsx              # Admin layout
│   │   ├── api/auth/[...nextauth]/     # NextAuth.js API route
│   │   │   └── route.ts
│   │   ├── page.tsx                    # Landing page (public)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── loading.tsx                 # Global loading
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── not-found.tsx               # 404 page
│   │   └── globals.css                 # TailwindCSS imports
│   │
│   ├── features/                       # ─── Feature Modules ───
│   │   ├── auth/
│   │   │   ├── components/             # LoginForm, RegisterForm, GoogleButton
│   │   │   ├── hooks/                  # useAuth, useSession
│   │   │   ├── services/               # authApi.ts (login, register, refresh)
│   │   │   ├── types/                  # auth.types.ts
│   │   │   └── schemas/                # loginSchema.ts (Zod)
│   │   ├── urls/
│   │   │   ├── components/             # UrlTable, CreateUrlForm, UrlCard
│   │   │   ├── hooks/                  # useUrls, useCreateUrl
│   │   │   ├── services/               # urlApi.ts
│   │   │   ├── types/                  # url.types.ts
│   │   │   └── schemas/                # createUrlSchema.ts
│   │   ├── analytics/
│   │   │   ├── components/             # ClickChart, ReferrerTable, StatsCard
│   │   │   ├── hooks/                  # useAnalytics
│   │   │   ├── services/               # analyticsApi.ts
│   │   │   └── types/
│   │   └── admin/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── shared/                         # ─── Shared across features ───
│   │   ├── components/
│   │   │   ├── ui/                     # Button, Input, Modal, Toast, Skeleton
│   │   │   ├── layout/                 # Sidebar, Header, Footer
│   │   │   └── common/                 # CopyButton, QRCodeGenerator
│   │   ├── hooks/                      # useDebounce, useMediaQuery, useCopyToClipboard
│   │   ├── lib/
│   │   │   ├── api-client.ts           # Axios instance + interceptors
│   │   │   ├── auth.ts                 # NextAuth config
│   │   │   └── utils.ts                # cn(), formatDate(), etc.
│   │   ├── types/
│   │   │   └── api.types.ts            # ApiResponse<T>, PaginatedResponse<T>
│   │   ├── constants/
│   │   │   └── index.ts                # API_URL, ROUTES, etc.
│   │   └── providers/
│   │       ├── QueryProvider.tsx        # React Query provider
│   │       ├── ThemeProvider.tsx        # Dark/light mode
│   │       └── SessionProvider.tsx      # NextAuth session
│   │
│   └── middleware.ts                   # Route protection + role check
│
├── public/                             # Static assets
├── .env.local                          # Local env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 1.3. Server Components vs Client Components

| Trường hợp | Component Type | Lý do |
|---|---|---|
| **Landing page** | Server Component | SEO tốt, không cần interactivity |
| **Dashboard layout** (sidebar, header) | Server Component (shell) + Client Component (user menu dropdown) | Layout ít thay đổi, fetch user session ở server |
| **Danh sách URLs (table)** | Client Component | Cần pagination, sorting, search real-time |
| **Form tạo short link** | Client Component | Form state, validation, submit handler |
| **Biểu đồ Analytics** | Client Component | Chart libraries cần DOM, window |
| **Error/Loading pages** | Server Component | Không cần JS bundle |
| **Admin stats overview** | Client Component | Real-time data, filters |

> [!TIP]
> **Nguyên tắc vàng**: Mặc định mọi thứ là Server Component. Chỉ thêm `"use client"` khi component cần: `useState`, `useEffect`, `onClick`, browser APIs, hoặc thư viện third-party yêu cầu client-side.

---

## 2. Quản lý State & Data Fetching

### 2.1. So sánh chiến lược Data Fetching

| Tiêu chí | Next.js `fetch` (Server) | React Query (Client) | SWR (Client) |
|---|---|---|---|
| **Caching** | Built-in (Request memoization) | Rất mạnh (staleTime, gcTime) | Tốt (revalidation) |
| **Loading/Error state** | Phải tự handle | Tự động (isPending, isError) | Tự động |
| **Optimistic updates** | Không | ✅ Built-in | ✅ Built-in |
| **Mutation support** | Cần Server Action | ✅ useMutation | ✅ useSWRMutation |
| **DevTools** | Không | ✅ React Query DevTools | Không |
| **Pagination/Infinite** | Phải tự code | ✅ useInfiniteQuery | ✅ useSWRInfinite |
| **Bundle size** | 0KB (server) | ~13KB | ~4KB |
| **Phù hợp khi** | SSR/SSG pages | CRUD-heavy dashboard | Simple fetching |

### ✅ Đề xuất: **Hybrid approach**

```
Server Components (fetch)      →  Landing page, SEO pages, initial data load
React Query (TanStack Query)   →  Dashboard, URLs CRUD, Analytics, Admin
```

**Lý do chọn React Query thay vì SWR cho Client-side:**
- Dashboard URL Shortener là **CRUD-heavy** (Create, Read, Update, Delete URLs) → React Query có `useMutation` mạnh mẽ hơn với Optimistic Updates.
- DevTools giúp debug cache dễ dàng trong development.
- `queryKey` system cho phép invalidate cache chính xác (ví dụ: sau khi tạo URL mới → tự động refetch list).

### 2.2. Có cần Global State không?

| Loại State | Nơi lưu | Lý do |
|---|---|---|
| **Auth session** (user, role, token) | NextAuth.js (session cookie) | Không cần Redux, NextAuth quản lý toàn bộ |
| **Server data** (URLs, analytics) | React Query cache | Cache = "global state" cho server data |
| **UI state** (sidebar open, modal) | React `useState` / `useContext` | Scope nhỏ, không cần global |
| **Theme** (dark/light) | `next-themes` | Đơn giản, có sẵn |
| **Toast notifications** | `sonner` hoặc Context | Scope app-wide nhưng ephemeral |

### ✅ Kết luận: **KHÔNG CẦN Redux/Zustand**

Dự án URL Shortener không có state client-side phức tạp. React Query + NextAuth + `useState`/`useContext` là quá đủ. Thêm Zustand/Redux chỉ tạo boilerplate không cần thiết.

> [!NOTE]
> **Nếu tương lai thêm tính năng real-time** (WebSocket, live click counting): Lúc đó mới cân nhắc Zustand để quản lý WebSocket state. Hiện tại chưa cần.

---

## 3. Bảo mật & Xác thực

### 3.1. Authentication Flow với NextAuth.js (Auth.js v5)

#### So sánh các phương án xử lý Auth

| Phương án | Ưu điểm | Nhược điểm |
|---|---|---|
| **NextAuth.js (Auth.js)** | Zero-config OAuth, session management, middleware support | Opinionated, learning curve |
| **Custom Auth (tự build)** | Full control, linh hoạt | Phải tự build mọi thứ (CSRF, session, cookie) |
| **Clerk / Auth0** | SaaS nhanh nhất | Vendor lock-in, pricing |

### ✅ Đề xuất: **NextAuth.js v5 (Auth.js)** + Credentials Provider + Google Provider

#### Luồng xử lý:

```
┌────────────┐                     ┌─────────────────┐                ┌────────────────┐
│   Browser   │                     │   Next.js (FE)  │                │ Spring Boot(BE)│
└─────┬──────┘                     └────────┬────────┘                └───────┬────────┘
      │                                     │                                 │
      │─── 1. User clicks Login ───────────▶│                                 │
      │                                     │                                 │
      │   [Credentials Login]               │                                 │
      │─── 2a. POST email/password ────────▶│                                 │
      │                                     │── 3a. POST /api/auth/login ───▶│
      │                                     │◀── accessToken + refreshToken ──│
      │                                     │                                 │
      │   [Google OAuth2]                   │                                 │
      │─── 2b. Click "Login with Google" ─▶│                                 │
      │                                     │── 3b. Redirect to Google ─────▶│
      │                                     │◀── Google callback ─────────────│
      │                                     │── 3c. POST /api/auth/oauth2 ─▶│
      │                                     │◀── accessToken + refreshToken ──│
      │                                     │                                 │
      │◀── 4. Set HttpOnly cookie ──────────│                                 │
      │    (encrypted session with tokens)  │                                 │
      │                                     │                                 │
      │─── 5. Subsequent API calls ────────▶│                                 │
      │                                     │── 6. Forward with Bearer ─────▶│
      │                                     │    Authorization header         │
      │                                     │◀── Response ────────────────────│
      │◀── 7. Return data ─────────────────│                                 │
```

### 3.2. Lưu trữ Token — Phân tích bảo mật

| Phương án | XSS Protection | CSRF Protection | Ghi chú |
|---|---|---|---|
| **localStorage** | ❌ JS có thể đọc | ✅ Không auto-send | **KHÔNG NÊN** dùng cho access token |
| **sessionStorage** | ❌ JS có thể đọc | ✅ Không auto-send | Mất khi đóng tab |
| **HttpOnly Cookie** | ✅ JS KHÔNG thể đọc | ⚠️ Cần SameSite | **KHUYÊN DÙNG** |
| **NextAuth Session** | ✅ Encrypted cookie | ✅ Built-in CSRF | **TỐT NHẤT** cho Next.js |

### ✅ Đề xuất: **NextAuth.js Session (HttpOnly encrypted cookie)**

```
Access Token  → Lưu trong NextAuth session (encrypted HttpOnly cookie)
Refresh Token → Lưu trong NextAuth session (encrypted HttpOnly cookie)
```

**Cách hoạt động:**
1. NextAuth mã hóa `accessToken` + [refreshToken](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/auth/service/AuthService.java#93-117) vào session cookie → JS không thể đọc → **chống XSS**.
2. Cookie được set `SameSite=Lax` + `Secure` → **chống CSRF**.
3. Khi gọi API Backend → Next.js API Route / Server Action đọc session, tự đính kèm `Bearer` header → Token **không bao giờ expose ra client-side JS**.

### 3.3. Middleware bảo vệ Route & Phân quyền

```typescript
// middleware.ts
import { auth } from "@/shared/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/urls", "/analytics", "/settings"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Redirect logged-in users away from auth pages
  if (authRoutes.some(r => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/dashboard", nextUrl));
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (protectedRoutes.some(r => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    return NextResponse.next();
  }

  // Admin-only routes
  if (adminRoutes.some(r => nextUrl.pathname.startsWith(r))) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 4. UI/UX & Thiết kế Tính năng

### 4.1. So sánh UI Component Library

| Tiêu chí | Shadcn/UI | MUI (Material UI) | Ant Design |
|---|---|---|---|
| **Styling approach** | TailwindCSS (copy-paste) | CSS-in-JS (Emotion) | Less/CSS Modules |
| **Bundle size** | 0KB base (copy vào code) | ~80KB+ | ~60KB+ |
| **Customization** | Rất dễ (sửa trực tiếp source) | Theme provider | ConfigProvider |
| **Dark mode** | Native Tailwind `dark:` | MUI theme | Ant theme |
| **TailwindCSS compat** | ✅ Native | ⚠️ Conflict potential | ⚠️ Conflict potential |
| **Accessibility** | Radix UI (tốt) | Tốt | Tốt |
| **Design style** | Clean, minimal (hiện đại) | Material Design (Google) | Enterprise (Ant/Alibaba) |

### ✅ Đề xuất: **Shadcn/UI**

**Lý do:**
- **Tương thích 100% với TailwindCSS** (vì bản chất Shadcn là Tailwind components).
- Không phải dependency → copy vào `src/shared/components/ui/` → full control, không bị breaking changes khi upgrade.
- Xây dựng trên **Radix UI** primitives → accessibility chuẩn WAI-ARIA.
- Phong cách clean, modern → phù hợp SaaS dashboard.

### 4.2. Thiết kế các tính năng chính

#### A. Form Validation

| Phương án | Ưu điểm | Nhược điểm |
|---|---|---|
| **React Hook Form + Zod** | Performant (uncontrolled), type-safe schema | Learning curve schemas |
| **Formik + Yup** | Mature, nhiều docs | Controlled → re-render nhiều |
| **Native HTML validation** | Zero deps | Không đủ cho forms phức tạp |

### ✅ Đề xuất: **React Hook Form + Zod**

```typescript
// features/urls/schemas/createUrlSchema.ts
import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL không được trống")
    .url("URL không hợp lệ"),
  customAlias: z
    .string()
    .max(10, "Alias tối đa 10 ký tự")
    .regex(/^[a-zA-Z0-9-]*$/, "Alias chỉ chứa chữ, số và dấu gạch ngang")
    .optional()
    .or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
```

#### B. Analytics Dashboard — Biểu đồ

| Thư viện | Bundle size | Customization | Animation | SSR |
|---|---|---|---|---|
| **Recharts** | ~45KB | Tốt (React components) | Smooth | ⚠️ Cần dynamic import |
| **Chart.js + react-chartjs-2** | ~65KB | Rất tốt | Tốt | ⚠️ Cần dynamic import |
| **Tremor** | Built on Recharts | Rất dễ (Tailwind-native) | Có | ⚠️ |
| **Nivo** | ~40KB/chart | Rất đẹp | Tuyệt vời | ✅ SVG-based |

### ✅ Đề xuất: **Recharts** (hoặc **Tremor** nếu muốn nhanh hơn)

**Lý do chọn Recharts:**
- Declarative (React components), dễ đọc dễ maintain.
- Hệ sinh thái lớn nhất, nhiều examples.
- Nhẹ hơn Chart.js, đủ cho Line/Bar/Pie charts trong analytics dashboard.

**Tremor** là lựa chọn thay thế nếu muốn triển khai **nhanh hơn** — vì Tremor cung cấp sẵn Dashboard components (AreaChart, BarChart, DonutChart) đã styled sẵn với TailwindCSS.

#### C. Tính năng tiện ích

| Tính năng | Thư viện đề xuất | Ghi chú |
|---|---|---|
| **QR Code** | `qrcode.react` (~5KB) | SVG-based, nhẹ, support download |
| **Copy to clipboard** | `navigator.clipboard` API (native) | Không cần thư viện, wrap vào custom hook |
| **Toast notification** | `sonner` (~5KB) | Đẹp, animations mượt, TailwindCSS friendly |
| **Date picker** | Shadcn DatePicker (dùng `date-fns`) | Tích hợp sẵn với Shadcn/UI |

---

## 5. Hiệu năng & SEO

### 5.1. Chiến lược Rendering

| Trang | Rendering | Lý do |
|---|---|---|
| **Landing page** (`/`) | **SSG** (Static Site Generation) | Nội dung cố định, SEO quan trọng, tốc độ tải nhanh nhất |
| **Login/Register** | **SSG** | Form tĩnh, ít nội dung dynamic |
| **Dashboard** | **CSR** (Client-Side Rendering) | Data cá nhân, không cần SEO, real-time updates |
| **URL List** | **CSR** + React Query | Pagination, search, filter → client-side |
| **URL Detail + Analytics** | **SSR initial** + CSR hydrate | Initial load nhanh (SSR), sau đó React Query refresh |
| **Admin pages** | **CSR** | Không cần SEO, data dynamic |
| **404 / Error** | **SSG** | Tĩnh hoàn toàn |

### 5.2. Tối ưu hóa hiệu năng

```
┌─────────────────────────────────────────────────┐
│                 Performance Checklist            │
├─────────────────────────────────────────────────┤
│ ✅ next/image cho tất cả hình ảnh (auto WebP)   │
│ ✅ next/font cho Google Fonts (zero layout shift)│
│ ✅ dynamic(() => import()) cho Chart components  │
│ ✅ React.lazy cho modals, drawers               │
│ ✅ Skeleton UI cho loading states                │
│ ✅ Prefetch links (next/link default)            │
│ ✅ ISR cho Landing page (revalidate: 3600)       │
│ ✅ Bundle analyzer để kiểm tra size              │
└─────────────────────────────────────────────────┘
```

**Loading Strategy cụ thể:**

```typescript
// Dynamic import cho chart (không load khi SSR)
const ClickChart = dynamic(
  () => import("@/features/analytics/components/ClickChart"),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// Font tối ưu
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin", "vietnamese"] });
```

---

## 6. Xử lý lỗi, Call API & Deployment

### 6.1. API Client — Axios Interceptor

```typescript
// shared/lib/api-client.ts
import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor: Auto-attach Token ───
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// ─── Response Interceptor: Auto Refresh Token ───
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger NextAuth token refresh (via session update)
        await fetch("/api/auth/session?update=true");
        failedQueue.forEach(({ resolve }) => resolve());
        return apiClient(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(({ reject }) => reject(refreshError));
        await signOut({ redirect: true, callbackUrl: "/login" });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        failedQueue = [];
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 6.2. Type-safe API Response

```typescript
// shared/types/api.types.ts — Map chính xác với Spring Boot ApiResponse<T>
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  errors?: string[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

// Reusable fetcher
export async function apiFetch<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(url);
  return data.data;
}
```

### 6.3. Error Boundaries

```
app/
├── error.tsx              # Global error boundary (catch-all)
├── (dashboard)/
│   ├── error.tsx          # Dashboard-specific error UI
│   ├── urls/
│   │   └── error.tsx      # URL module error UI
│   └── analytics/
│       └── error.tsx      # Analytics error UI (chart fails gracefully)
```

> [!IMPORTANT]
> **Mỗi route segment nên có `error.tsx` riêng** để khi 1 module lỗi (ví dụ: Analytics API down), các module khác vẫn hoạt động bình thường. User vẫn có thể tạo/quản lý URLs.

### 6.4. Environment Variables & CORS khi Deploy

| Biến | Giá trị | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` | ⚠️ Prefix `NEXT_PUBLIC_` → expose ra client |
| `NEXTAUTH_SECRET` | Random 32+ chars | ❌ KHÔNG được public |
| `NEXTAUTH_URL` | `https://yourdomain.com` | URL chính của frontend |
| `GOOGLE_CLIENT_ID` | Từ Google Console | Server-only |
| `GOOGLE_CLIENT_SECRET` | Từ Google Console | Server-only, ❌ KHÔNG prefix `NEXT_PUBLIC_` |

**CORS khi Frontend ≠ Backend domain:**

```
Frontend (Vercel): https://app.urlshort.com
Backend (Docker):  https://api.urlshort.com
```

Cần cấu hình ở **cả 2 phía**:
1. **Backend** ([SecurityConfig.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/SecurityConfig.java)): Thêm frontend domain vào `app.cors.allowed-origins`.
2. **Frontend** (`next.config.ts`): Cấu hình `rewrites` nếu muốn proxy qua Next.js (tùy chọn, để tránh CORS hoàn toàn).

```typescript
// next.config.ts — Option: Proxy API qua Next.js (avoid CORS entirely)
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
};
```

> [!WARNING]
> **Khi deploy Docker**: Không hardcode URLs. Dùng [.env](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/.env) file hoặc Docker Compose environment variables. Đảm bảo `NEXTAUTH_URL` khớp với domain thực tế.

---

## 7. Tổng kết các thư viện đề xuất

| Mục đích | Thư viện | Bundle Impact |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Core |
| **Styling** | TailwindCSS + Shadcn/UI | ~0KB (utility CSS) |
| **Auth** | NextAuth.js v5 (Auth.js) | ~15KB |
| **Data Fetching** | TanStack React Query v5 | ~13KB |
| **Form** | React Hook Form + Zod | ~12KB |
| **Charts** | Recharts (hoặc Tremor) | ~45KB (lazy loaded) |
| **QR Code** | qrcode.react | ~5KB |
| **Toast** | Sonner | ~5KB |
| **Date util** | date-fns | Tree-shakeable |
| **Icons** | Lucide React | Tree-shakeable |
| **Theme** | next-themes | ~1KB |

**Tổng estimated JS bundle**: ~95KB (gzipped) — rất nhẹ cho một SaaS dashboard.

---

## 8. Tổng Kết Trade-off

| Quyết định | Lựa chọn | Trade-off chấp nhận |
|---|---|---|
| Folder structure | Modular by Feature | Không strict như FSD, nhưng đủ tổ chức cho team nhỏ |
| State management | React Query + NextAuth (Không Redux) | Nếu thêm WebSocket sau cần refactor thêm state layer |
| Auth | NextAuth Session Cookie | Phụ thuộc NextAuth ecosystem, nhưng bảo mật tốt nhất |
| UI Library | Shadcn/UI (copy-paste) | Phải maintain component code, nhưng full control |
| Charts | Recharts | Không đẹp bằng Nivo, nhưng ecosystem lớn hơn |
| Token storage | HttpOnly Cookie (via NextAuth) | Token không accessible từ JS → không thể dùng cho WebSocket auth header |

---

> [!TIP]
> **Chiến lược tiến hóa Frontend**: MVP (Next.js + Shadcn) → Thêm Analytics Charts → Thêm Real-time (WebSocket) → Thêm Mobile PWA
