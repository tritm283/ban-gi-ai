"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FlaskConical, Menu, Search, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";

const muc = [
  ["/kham-pha", "Khám phá", Search],
  ["/da-luu", "Đã lưu", Bookmark],
  ["/dang-thu", "Đang thử", FlaskConical],
  ["/tro-ly-ai", "Trợ lý AI", Sparkles],
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const [mo, setMo] = useState(false);
  return <>
    <header className="dau-trang"><div className="dau-trang-trong shell"><Link href="/" className="thuong-hieu">BÁN GÌ <span>AI</span></Link><nav className="menu-may-tinh">{muc.map(([href, ten]) => <Link key={href} className={pathname.startsWith(href) ? "dang-chon" : ""} href={href}>{ten}</Link>)}<Link className="nut-tai-khoan" href="/tai-khoan"><UserRound size={18}/> Tài khoản</Link></nav><button className="nut-menu" onClick={() => setMo(!mo)} aria-label="Mở menu">{mo ? <X/> : <Menu/>}</button></div></header>
    {mo && <div className="menu-dien-thoai">{muc.map(([href, ten, Icon]) => <Link key={href} href={href} onClick={() => setMo(false)}><Icon size={19}/>{ten}</Link>)}<Link href="/tai-khoan" onClick={() => setMo(false)}><UserRound size={19}/>Tài khoản</Link></div>}
    <nav className="menu-duoi-dien-thoai">{muc.slice(0,3).map(([href, ten, Icon]) => <Link key={href} href={href}><Icon size={20}/><span>{ten}</span></Link>)}<button onClick={() => setMo(!mo)}><Menu size={20}/><span>Menu</span></button></nav>
  </>;
}
