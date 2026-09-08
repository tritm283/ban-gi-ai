import { NextResponse, type NextRequest } from "next/server";
import { taoSupabaseMayChu } from "@/lib/supabase/server";
function anToan(v:string|null){return v&&v.startsWith("/")&&!v.startsWith("//")?v:"/";}
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get("code");const next=anToan(request.nextUrl.searchParams.get("next"));const supabase=await taoSupabaseMayChu();if(code&&supabase){const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,request.url));}const url=new URL("/dang-nhap",request.url);url.searchParams.set("loi","xac-thuc");return NextResponse.redirect(url);}
