import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BadgeCheck, Database, ShieldCheck, Sparkles } from "lucide-react";

export default function TrangChu() {
  return (
    <main>
      <AppHeader />
      <section className="hero shell">
        <div>
          <span className="nhan"><BadgeCheck size={16}/> CÔNG CỤ PHÂN TÍCH CƠ HỘI SẢN PHẨM CÓ BẰNG CHỨNG</span>
          <h1>Biết <em>vì sao</em> nên thử trước khi xuống tiền.</h1>
          <p>BÁN GÌ AI ưu tiên dữ liệu có nguồn, nói rõ mức độ tin cậy và không dùng AI để bịa số bán, đơn hàng, doanh thu hay GMV.</p>
          <div className="hang-nut"><Link className="nut-chinh" href="/kham-pha">Khám phá cơ hội</Link><Link className="nut-phu" href="/nang-cap">Xem quyền lợi VIP</Link></div>
        </div>
        <div className="the-lon">
          <h2>Mỗi kết luận thuộc một trong ba nhóm</h2>
          <div className="ba-nhom"><div><strong>DỮ LIỆU XÁC THỰC</strong><span>Có nguồn và thời gian thu thập.</span></div><div><strong>SUY LUẬN</strong><span>Được suy ra từ bằng chứng, không phải số thị trường thật.</span></div><div><strong>CHƯA CÓ DỮ LIỆU</strong><span>Không lấy số 0 hoặc AI để lấp chỗ trống.</span></div></div>
        </div>
      </section>
      <section className="ba-cot shell">
        <article className="the"><Database/><h3>Dữ liệu có nguồn</h3><p>Mọi tín hiệu quan trọng phải truy được về nguồn dữ liệu.</p></article>
        <article className="the"><ShieldCheck/><h3>Điểm do code tính</h3><p>Điểm cơ hội và độ phủ được tính theo quy tắc cố định.</p></article>
        <article className="the"><Sparkles/><h3>AI dùng đúng việc</h3><p>Code và bộ nhớ đệm xử lý trước, AI miễn phí trước, trả phí sau.</p></article>
      </section>
    </main>
  );
}
