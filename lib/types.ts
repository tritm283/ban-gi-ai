export type GoiTaiKhoan = "mien_phi" | "vip";
export type PhanLoaiBangChung = "FACT" | "INFERENCE" | "UNKNOWN";
export type TrangThaiCoHoi = "READY" | "PROVISIONAL" | "INSUFFICIENT_EVIDENCE" | "CONFLICT";
export type NhietSanPham = "HOT" | "WARM" | "COLD" | "ARCHIVED";

export type TinHieuSanPham = {
  demand: number | null;
  growth: number | null;
  margin: number | null;
  viral: number | null;
  competition: number | null;
  risk_penalty: number | null;
};

export type TrangThaiSanPham = TinHieuSanPham & {
  opportunity_score: number | null;
  confidence_score: number;
  coverage_score: number;
  trend_direction: "RISING" | "STABLE" | "FALLING" | "UNKNOWN" | null;
  opportunity_status: TrangThaiCoHoi;
  heat: NhietSanPham;
  updated_at: string;
};

export type SanPham = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  category_label: string | null;
  status: string;
  current_state?: TrangThaiSanPham | null;
};
