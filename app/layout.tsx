import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "BÁN GÌ AI — Tìm cơ hội sản phẩm có bằng chứng",
  description: "Phân tích cơ hội sản phẩm dựa trên bằng chứng, độ tin cậy, độ phủ dữ liệu và độ mới.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
