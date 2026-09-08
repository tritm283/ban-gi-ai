import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import pg from "pg";
const { Client } = pg;
const url=process.env.DATABASE_URL;
if(!url){console.error("Thiếu DATABASE_URL. Không thể cập nhật cơ sở dữ liệu.");process.exit(1);}
const dir=path.join(process.cwd(),"supabase","migrations");
const files=fs.readdirSync(dir).filter(f=>/^\d{12,14}_.+\.sql$/.test(f)).sort();
const client=new Client({connectionString:url,ssl:url.includes("localhost")||url.includes("127.0.0.1")?false:{rejectUnauthorized:false}});
const checksum=t=>crypto.createHash("sha256").update(t).digest("hex");
await client.connect();
try{
  await client.query("select pg_advisory_lock($1)",[882731451]);
  await client.query("create schema if not exists ban_gi_ai_meta");
  await client.query(`create table if not exists ban_gi_ai_meta.schema_migrations(version text primary key,name text not null,checksum text not null,applied_at timestamptz not null default now(),execution_ms integer not null default 0)`);
  const done=new Map((await client.query("select version,checksum from ban_gi_ai_meta.schema_migrations")).rows.map(r=>[r.version,r.checksum]));
  for(const file of files){const sql=fs.readFileSync(path.join(dir,file),"utf8");const version=file.split("_")[0];const sum=checksum(sql);if(done.has(version)){if(done.get(version)!==sum)throw new Error(`Migration ${file} đã chạy nhưng nội dung đã bị sửa. Hãy tạo migration mới.`);console.log(`Bỏ qua ${file}`);continue;}const destructive=/\b(drop\s+(table|schema|column)|truncate\s+)/i.test(sql);if(destructive&&!/BAN_GI_AI_DESTRUCTIVE:\s*TRUE/i.test(sql))throw new Error(`Migration ${file} có thao tác phá hủy nhưng thiếu BAN_GI_AI_DESTRUCTIVE: TRUE.`);const start=Date.now();await client.query("begin");try{await client.query(sql);await client.query("insert into ban_gi_ai_meta.schema_migrations(version,name,checksum,execution_ms) values($1,$2,$3,$4)",[version,file,sum,Date.now()-start]);await client.query("commit");console.log(`Đã áp dụng ${file}`);}catch(e){await client.query("rollback");throw e;}}
}finally{try{await client.query("select pg_advisory_unlock($1)",[882731451]);}catch{}await client.end();}
