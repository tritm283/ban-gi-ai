# BÁN GÌ AI V3

**Evidence-First Product Intelligence Engine** cho người bán TikTok Shop và Shopee.

Nguyên tắc sản phẩm:

- Không có nguồn → **Chưa có dữ liệu**.
- AI suy luận → **Suy luận**, không trình bày như dữ liệu xác thực.
- Điểm cơ hội do code tính.
- Không tạo số bán, đơn hàng, GMV, doanh thu hoặc lợi nhuận giả.
- Giao diện người dùng dùng tiếng Việt.
- Khu vực quản trị `/quan-tri` không xuất hiện trên menu và vẫn kiểm tra quyền phía server.

## Tài khoản

Có ba luồng:

1. Email + mật khẩu, có xác thực email và khôi phục mật khẩu.
2. Google/Facebook OAuth qua Supabase Auth.
3. Liên kết nhiều phương thức đăng nhập vào cùng một user.

Trang `/tai-khoan` cho phép cập nhật họ tên, số điện thoại, email, mật khẩu, avatar và hồ sơ bán hàng.

## Database 100% bằng code

Database được tạo và thay đổi bằng migration trong `supabase/migrations`. Không cần chạy schema thủ công trong Supabase Dashboard.

```bash
npm run db:new -- "ten thay doi"
npm run db:validate
npm run db:migrate
npm run db:status
```

Xem `docs/CO-SO-DU-LIEU.md`.

## Docker production

```bash
cp .env.example .env.production
docker compose --env-file .env.production up -d --build
```

Server chỉ cần Docker. Migration chạy trong container riêng trước khi web khởi động.

Xem `docs/TRIEN-KHAI-DOCKER.md`.

## Route chính

- `/kham-pha`
- `/san-pham/[slug]`
- `/da-luu`
- `/dang-thu`
- `/tro-ly-ai`
- `/tai-khoan`
- `/nang-cap`
- `/quan-tri` — route nội bộ

## Biến bí mật

Không commit `.env.production`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, OAuth Client Secret hay API key AI lên GitHub.
