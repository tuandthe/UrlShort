# Frontend Overhaul — Implementation Plan

Bản kế hoạch chi tiết để: (1) Fix Google OAuth, (2) Nâng cấp giao diện, (3) Bổ sung trang thiếu.

> [!IMPORTANT]
> Tất cả file trong project đã dùng **Tailwind CSS** + **shadcn/ui** + design tokens từ [globals.css](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/globals.css). Khi implement, **BẮT BUỘC** dùng semantic color classes (`text-primary`, `bg-card`, `text-muted-foreground`, `border-border`...) — **KHÔNG** dùng hex cứng.

---

## PHẦN 1: Fix Google OAuth `redirect_uri_mismatch`

### Nguyên nhân

Trong ảnh chụp Google Console, **Authorized redirect URIs** đang là:
```
http://localhost:3002/login    ← SAI
```

Backend Spring Boot xử lý OAuth flow. Spring Security tự sinh callback endpoint tại:
```
http://localhost:8080/login/oauth2/code/google    ← ĐÚNG
```

### Hành động (không cần sửa code)

1. Vào [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Chọn client `Test_SpringBoot_OAuth2`
3. **Authorized JavaScript origins** → Thêm:
   ```
   http://localhost:8080
   http://localhost:3002
   ```
4. **Authorized redirect URIs** → Xoá `http://localhost:3002/login`, thêm:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
5. Nhấn **Save**, đợi 1-2 phút rồi test lại

### Flow hoạt động (không cần sửa code — đã implement xong):
```
Frontend (nút Google) → redirect tới Backend /oauth2/authorization/google
  → Backend redirect tới Google
  → Google callback về Backend /login/oauth2/code/google
  → Backend OAuth2LoginSuccessHandler tạo JWT
  → Backend redirect về Frontend /oauth2/callback?token=...&refresh=...
  → Frontend NextAuth signIn("token-login") → session established
```

**Files liên quan (đã đúng, KHÔNG sửa):**
- [src/features/auth/hooks/useGoogleLogin.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/hooks/useGoogleLogin.ts)
- `src/app/(auth)/oauth2/callback/page.tsx`
- [src/shared/lib/auth.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/shared/lib/auth.ts) (token-login provider)
- Backend [OAuth2LoginSuccessHandler.java](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/auth/security/OAuth2LoginSuccessHandler.java)
- Backend [application-dev.yml](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/resources/application-dev.yml) (`authorizedRedirectUri: http://localhost:3002/oauth2/callback`)

---

## PHẦN 2: Nâng cấp Giao diện UI/UX

### 2.1 Nguyên tắc chung cho TOÀN BỘ pages

- Font: Đã dùng Inter (Google Font) — giữ nguyên
- Dùng `transition-all duration-200` cho mọi interactive element
- Thêm `hover:shadow-md` cho Card components
- Dùng `bg-gradient-to-br` cho các hero/header sections
- Icon: đã dùng Lucide — giữ nguyên, bổ sung thêm khi cần
- Responsive: dùng `sm:`, `md:`, `lg:` breakpoints

---

### 2.2 Auth Pages — Login & Register

#### [MODIFY] [layout.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(auth)/layout.tsx)

**Hiện tại:** Nền `bg-muted/30` đơn giản.

**Nâng cấp:**
- Thêm gradient background: `bg-gradient-to-br from-background via-muted/50 to-background`
- Thêm decoration pattern bên trái (chia layout 2 cột trên desktop):
  - Cột trái: Hero section với gradient + tagline + illustration
  - Cột phải: Form login/register
- Mobile: chỉ hiện form, ẩn hero

```tsx
// Layout structure:
<div className="min-h-screen grid lg:grid-cols-2">
  {/* Left panel - hidden on mobile */}
  <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
    <div className="space-y-4">
      <Logo />
      <h1 className="text-4xl font-bold tracking-tight">Shorten, Share, Track</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        Enterprise-grade URL shortener with real-time analytics and secure authentication.
      </p>
      {/* Feature bullets with icons */}
    </div>
  </div>
  {/* Right panel - form */}
  <div className="flex flex-col justify-center items-center p-4 md:p-8">
    <Logo className="lg:hidden mb-8" />
    <div className="w-full max-w-md">{children}</div>
  </div>
</div>
```

#### [MODIFY] [LoginForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/LoginForm.tsx)

**Nâng cấp:**
- Nút Google: thêm Google SVG icon (inline SVG, không dùng thư viện ngoài)
- Thêm `transition-all` cho buttons
- Input fields: thêm icons (Mail, Lock) bên trái bằng cách wrap trong `relative` div

#### [MODIFY] [RegisterForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/RegisterForm.tsx)

- Tương tự LoginForm — thêm icons cho input fields (User, Mail, Lock)

---

### 2.3 Dashboard Page

#### [MODIFY] [dashboard/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/dashboard/page.tsx)

**Hiện tại:** Chỉ có CreateUrlForm + UrlsTable, không có summary stats.

**Nâng cấp:**
- Thêm **3 stat cards** phía trên (gọi API `GET /urls` để lấy tổng):
  - Total URLs created (đếm từ totalItems)
  - Total Clicks (tính tổng clickCount)
  - Active URLs (đếm isActive=true)
- Mỗi stat card: icon + con số lớn + description + subtle gradient background
- Greeting header: "Good morning, {user.fullName}" với icon wave emoji
- Layout:
```
┌─────────────────────────────────────────────┐
│ Welcome back, {name}!                       │
│ Here's what's happening with your links.    │
├────────┬────────┬────────┬──────────────────┤
│ Total  │ Total  │ Active │                  │
│ URLs   │ Clicks │ Links  │  Create New URL  │
│ Card   │ Card   │ Card   │  Form Card       │
├────────┴────────┴────────┤                  │
│                          │                  │
│  Recent URLs Table       │                  │
│                          ├──────────────────┤
└──────────────────────────┘
```

---

### 2.4 My URLs Page

#### [MODIFY] [urls/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/urls/page.tsx)

**Hiện tại:** Đã tốt (có Dialog cho Create URL). Giữ nguyên.

#### [MODIFY] [UrlsTable.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/UrlsTable.tsx)

**Nâng cấp:**
- Thêm **Status badge** column: badge `Active` (green) / [Expired](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/security/CustomUserDetails.java#54-58) (orange) dựa trên `isActive` + `expiresAt`
- Short link column: hiện full short URL (dùng `shortUrl` field từ backend) thay vì chỉ `/{shortCode}`
- Click count: thêm biểu tượng `MousePointerClick` icon + format số
- Hover effect: `hover:bg-muted/50` cho mỗi TableRow
- Empty state: thêm illustration icon lớn (Link2 icon) + mô tả chi tiết hơn
- Copy button: hiện toast với nội dung URL đã copy

#### [NEW] [EditUrlDialog.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/EditUrlDialog.tsx)

Backend đã có `PUT /api/urls/{id}` nhưng Frontend chưa có UI sửa URL:
- Dialog form cho phép sửa `originalUrl`, `customAlias`, [password](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/common/config/SecurityConfig.java#44-48), `expiresAt`
- Tích hợp vào DropdownMenu của UrlsTable (thêm mục "Edit")

---

### 2.5 Analytics Pages

#### [MODIFY] [analytics/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(dashboard)/analytics/page.tsx)

**Hiện tại:** Chỉ hiện lại UrlsTable giống hệt trang My URLs.

**Nâng cấp:**
- Header: thêm tổng số Total Clicks across all URLs (tính từ dữ liệu [getUrls](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/admin/controller/AdminController.java#63-80))
- Bảng URL: hiển thị thêm cột `clickCount` nổi bật với progress bar tương đối
- Mỗi row: link `/analytics/{id}` mở trang detail

#### [MODIFY] [AnalyticsDashboard.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/components/AnalyticsDashboard.tsx)

**Nâng cấp:**
- **Replace hardcoded hex colors:**
  - `stroke="#2563eb"` → `stroke="var(--chart-1)"` (or `hsl(var(--chart-1))`)
  - `fill="#10b981"` → `fill="var(--chart-2)"`
  - `border: "1px solid #e2e8f0"` → `border: "1px solid hsl(var(--border))"`
- Thêm stat cards: Total Clicks, Avg Clicks/Day, Top Referer
- Charts: thêm `cursor-pointer` style, tooltip đẹp hơn

---

### 2.6 Settings Page

#### [MODIFY] [ProfileForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/components/ProfileForm.tsx)

**Hiện tại:** 2 cards cạnh nhau (Profile Info + Change Password). Chức năng đúng.

**Nâng cấp:**
- Thêm Avatar/User icon lớn phía trên Profile card
- Status badge: "Active" / "Inactive" + Provider badge ("Google" / "Local")
- Thêm `Separator` giữa các fields
- Read-only fields: styling khác biệt rõ ràng hơn

---

### 2.7 Admin Dashboard

#### [MODIFY] [admin/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/(admin)/admin/page.tsx)

**Hiện tại:** 3 stat cards đơn giản. Đúng chức năng.

**Nâng cấp:**
- Stat cards: thêm subtle gradient background + animated count-up number
- Thêm icon background decoration cho mỗi card
- Thêm placeholder section: "Recent Activity" / "Recent Users" (text chỉ dẫn khi chưa có API)

---

### 2.8 Navbar

#### [MODIFY] [Navbar.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/dashboard/components/Navbar.tsx)

**Nâng cấp:**
- Mobile: thêm **hamburger menu** (Sheet component) cho nav items
- Active link: thêm `border-b-2 border-primary` indicator thay vì chỉ đổi màu chữ
- User dropdown: hiện Avatar initials (first letter of fullName) trong circle
- Thêm **Theme toggle** button (Sun/Moon icon) bên cạnh user avatar

---

### 2.9 Loading, Error, 404 Pages

#### [MODIFY] [app/loading.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/loading.tsx)

- Thêm logo + branding text dưới spinner
- Spinner: dùng animated gradient ring thay vì icon đơn

#### [MODIFY] [app/error.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/error.tsx)

- Thêm illustration icon lớn (AlertTriangle)
- Thêm error message mô tả
- Thêm nút "Go to Dashboard" bên cạnh "Try again"

#### [MODIFY] [app/not-found.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/not-found.tsx)

- Thêm large "404" text với gradient
- Thêm mô tả chi tiết + illustration
- Thêm nút "Go Home" bên cạnh "Go to Dashboard"

---

## PHẦN 3: Trang & Tính năng còn thiếu

### 3.1 Landing Page (Public Homepage)

**Hiện tại:** Truy cập `/` sẽ redirect thẳng tới Dashboard (hoặc Login nếu chưa auth). Không có trang giới thiệu công khai.

#### [NEW] [app/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/page.tsx)

- Public landing page — không cần auth
- Hero section: tagline + CTA "Get Started" → `/register`
- Feature section: 3 columns (Fast Shortening, Analytics, Secure)
- Footer: links

#### [MODIFY] [middleware.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/middleware.ts)

- Cho phép truy cập `/` mà không redirect

### 3.2 Edit URL Dialog

#### [NEW] [EditUrlDialog.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/EditUrlDialog.tsx)

Backend đã có `PUT /api/urls/{id}` nhận `UpdateUrlRequest`. Frontend thiếu UI gọi API này:
- Dialog mở từ DropdownMenu "Edit" trong UrlsTable
- Form fields: Original URL, Custom Alias, Password, Expires At
- Gọi `urlApi.updateUrl(id, data)`

#### [MODIFY] [urlApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/services/urlApi.ts)

- Thêm function [updateUrl](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/url/controller/UrlController.java#113-124)

#### [MODIFY] [useUrls.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/hooks/useUrls.ts)

- Thêm `useUpdateUrl()` mutation hook

---

## Tóm tắt Files cần thay đổi

| Loại | File | Hành động |
|------|------|-----------|
| Config | Google Cloud Console | Sửa Redirect URI |
| Layout | [(auth)/layout.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/hooks/useAnalytics.ts#7-8) | Redesign 2-col layout |
| Page | [login/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28auth%29/login/page.tsx) | Nhỏ, update styling |
| Component | [LoginForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/LoginForm.tsx) | Thêm Google icon, input icons |
| Component | [RegisterForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/auth/components/RegisterForm.tsx) | Thêm input icons |
| Page | [dashboard/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28dashboard%29/dashboard/page.tsx) | Thêm stat cards + greeting |
| Component | [UrlsTable.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/components/UrlsTable.tsx) | Status badge, hover, shortUrl |
| Component | [AnalyticsDashboard.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/analytics/components/AnalyticsDashboard.tsx) | Fix hex colors, thêm stats |
| Page | [analytics/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28dashboard%29/analytics/page.tsx) | Thêm header stats |
| Component | [ProfileForm.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/settings/components/ProfileForm.tsx) | Avatar, badges, styling |
| Page | [admin/page.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/%28admin%29/admin/page.tsx) | Gradient cards, decoration |
| Component | [Navbar.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/dashboard/components/Navbar.tsx) | Mobile menu, theme toggle, avatar |
| Page | [loading.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/loading.tsx) | Branding, better spinner |
| Page | [error.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/error.tsx) | Icon, better messaging |
| Page | [not-found.tsx](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/app/not-found.tsx) | Gradient 404, illustration |
| **NEW** | `app/page.tsx` | Landing page |
| **NEW** | `EditUrlDialog.tsx` | Edit URL form |
| Service | [urlApi.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/services/urlApi.ts) | Thêm [updateUrl](file:///home/internagh2502003/app/UrlShort/url-shortener-backend/src/main/java/com/onluyen/url_shortener_backend/url/controller/UrlController.java#113-124) |
| Hook | [useUrls.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/features/urls/hooks/useUrls.ts) | Thêm `useUpdateUrl` |
| Middleware | [middleware.ts](file:///home/internagh2502003/app/UrlShort/url-shortener-frontend/src/middleware.ts) | Allow `/` public |

**Tổng: ~13 file sửa + ~3 file mới**

---

## Verification Plan

```bash
npm run build   # TypeScript + build check
```

### Manual Testing
1. Google OAuth: Đăng nhập Google → redirect → Dashboard
2. Landing page `/`: hiển thị public hero
3. Login/Register: giao diện 2 cột trên desktop
4. Dashboard: stat cards + greeting + recent URLs
5. My URLs: status badges, edit dialog, copy link
6. Analytics: charts dùng CSS var colors, dark mode compatible
7. Settings: profile + password update
8. Admin: stat cards với gradient
9. 404 page: truy cập URL random
10. Dark mode: tất cả pages phải render đúng màu
