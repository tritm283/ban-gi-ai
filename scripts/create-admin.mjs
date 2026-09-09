import { createClient } from "@supabase/supabase-js";

const email = (process.env.BAN_GI_AI_ADMIN_EMAIL || process.argv[2] || "").trim().toLowerCase();
const password = process.env.BAN_GI_AI_ADMIN_PASSWORD || process.argv[3] || "";

if (!email || !password) {
  console.error("Thiếu email hoặc mật khẩu quản trị.");
  console.error("Khuyến nghị dùng biến môi trường BAN_GI_AI_ADMIN_EMAIL và BAN_GI_AI_ADMIN_PASSWORD để không lộ mật khẩu trong lịch sử lệnh.");
  process.exit(1);
}

if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
  console.error("Mật khẩu quản trị phải có ít nhất 10 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
  process.exit(1);
}

const url = process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Thiếu cấu hình Supabase phía server.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function timNguoiDungTheoEmail(targetEmail) {
  let page = 1;
  const perPage = 100;

  while (page <= 100) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((item) => item.email?.toLowerCase() === targetEmail);
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }

  throw new Error("Danh sách người dùng quá lớn để tìm tài khoản quản trị một cách an toàn.");
}

async function main() {
  let user = await timNguoiDungTheoEmail(email);
  let created = false;

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw error || new Error("Supabase không trả về tài khoản sau khi tạo.");
    }

    user = data.user;
    created = true;
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw error || new Error("Không thể cập nhật tài khoản quản trị hiện có.");
    }

    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: "admin",
      account_plan: "vip",
    },
    { onConflict: "id" },
  );

  if (profileError) throw profileError;

  const { data: profile, error: verifyError } = await supabase
    .from("profiles")
    .select("role,account_plan")
    .eq("id", user.id)
    .single();

  if (verifyError || profile?.role !== "admin" || profile?.account_plan !== "vip") {
    throw verifyError || new Error("Không thể xác minh quyền quản trị sau khi cập nhật.");
  }

  console.log(created ? "Đã tạo tài khoản quản trị cao nhất." : "Đã nâng cấp tài khoản hiện có thành quản trị cao nhất.");
  console.log("Email:", email);
  console.log("User ID:", user.id);
  console.log("Quyền: admin");
  console.log("Gói: vip");
}

main().catch((error) => {
  console.error("Không thể tạo hoặc nâng cấp tài khoản quản trị:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
