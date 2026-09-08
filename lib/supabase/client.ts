import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
let client: SupabaseClient | null | undefined;
export function daCauHinhSupabase(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&&!process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT"));}
export function taoSupabaseTrinhDuyet(){if(!daCauHinhSupabase()) return null;if(client!==undefined)return client;client=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);return client;}
