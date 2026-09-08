import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function taoSupabaseMayChu(){const url=process.env.SUPABASE_SERVER_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key||url.includes("YOUR_PROJECT")) return null;const kho=await cookies();return createServerClient(url,key,{cookies:{getAll(){return kho.getAll();},setAll(ds){try{ds.forEach(({name,value,options})=>kho.set(name,value,options));}catch{}}}});}
