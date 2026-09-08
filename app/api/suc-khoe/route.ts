import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ trang_thai: "tot", dich_vu: "ban-gi-ai" }); }
