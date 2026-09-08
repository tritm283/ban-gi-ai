# Triển khai production bằng Docker

Máy chủ chỉ cần Docker Engine và Docker Compose plugin. Không cần cài Node.js, npm, PM2, Nginx hay Supabase CLI.

```bash
git clone https://github.com/tritm283/ban-gi-ai.git
cd ban-gi-ai
cp .env.example .env.production
```

Điền `DOMAIN`, cấu hình Supabase, `DATABASE_URL` và các API key cần dùng. Sau đó:

```bash
docker compose --env-file .env.production up -d --build
```

Thứ tự khởi động:

1. `cap-nhat-csdl` chạy migration.
2. Chỉ khi migration thành công, `ung-dung` mới khởi động.
3. Khi web healthy, `cong-vao` Caddy mới phục vụ HTTP/HTTPS.

Kiểm tra:

```bash
docker compose ps
docker compose logs -f cap-nhat-csdl
docker compose logs -f ung-dung
```

Cập nhật phiên bản:

```bash
git pull
docker compose --env-file .env.production up -d --build
```

Nếu dùng Supabase Cloud, cấu hình Email, Google, Facebook và redirect URL `/xac-thuc`. Google/Meta callback về endpoint callback của Supabase project.
