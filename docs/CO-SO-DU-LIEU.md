# Quản lý cơ sở dữ liệu bằng code

Cơ sở dữ liệu BÁN GÌ AI được quản lý 100% bằng migration trong `supabase/migrations`.

Nguyên tắc:

- Không sửa cấu trúc production trực tiếp bằng SQL Editor.
- Mỗi thay đổi tạo một migration mới.
- Migration đã chạy không được sửa nội dung.
- Hệ thống lưu checksum SHA-256 trong `ban_gi_ai_meta.schema_migrations`.
- Mỗi migration chạy trong transaction và có PostgreSQL advisory lock để tránh hai tiến trình cùng cập nhật.
- Thao tác `DROP TABLE`, `DROP SCHEMA`, `DROP COLUMN`, `TRUNCATE` phải có dòng `BAN_GI_AI_DESTRUCTIVE: TRUE`.

Tạo migration:

```bash
npm run db:new -- "them cot nha cung cap"
```

Kiểm tra:

```bash
npm run db:validate
```

Áp dụng:

```bash
npm run db:migrate
```

Xem lịch sử:

```bash
npm run db:status
```

Khi chạy production bằng Docker, service `cap-nhat-csdl` tự áp dụng migration trước khi service web khởi động.
