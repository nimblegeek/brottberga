import { z } from "zod";
import { registrationsEnabled } from "@/lib/features";
import { database, hash, pruneExpired } from "@/db/connection";
import { upcomingGatherings } from "@/lib/events";
import { json, readBody, sameOrigin } from "@/lib/request";
const schema=z.object({requestId:z.string().uuid(),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()),kind:z.enum(["visit","interest"]),eventId:z.string().max(50).nullable(),guests:z.number().int().min(1).max(12),consent:z.literal(true),website:z.string().max(0)}).strict();
export async function POST(request:Request){
 if(!registrationsEnabled)return json({error:"Digitala anmälningar är pausade. Välkommen att besöka oss på Brottberga Gård.",code:"REGISTRATIONS_PAUSED"},503);
 if(!sameOrigin(request))return json({error:"Ladda om sidan och försök igen."},403);
 let input;try{input=schema.safeParse(await readBody(request));}catch{return json({error:"Kontrollera formuläret och försök igen."},400)}
 if(!input.success)return json({error:"Kontrollera namn, e-post, antal personer och samtycke."},400);
 const data=input.data;
 if(data.kind==="visit"&&!upcomingGatherings().some(event=>event.id===data.eventId))return json({error:"Träffen är inte längre tillgänglig. Välj ett kommande datum."},400);
 if(data.kind==="interest"&&data.eventId!==null)return json({error:"Kontrollera din intresseanmälan."},400);
 try{
  const db=database();await pruneExpired();
  const now=Date.now();
  const key=await hash(`${request.headers.get("cf-connecting-ip")??"unknown"}:${Math.floor(now/600000)}`);
  const limit=await db.prepare("INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(key,now+600000).first<{count:number}>();
  if(limit&&limit.count>20)return json({error:"Många försök på kort tid. Vänta några minuter och försök igen."},429);
  const previous=await db.prepare("SELECT id FROM registrations WHERE id = ?").bind(data.requestId).first();
  if(previous)return json({error:"Den här anmälan är redan sparad. Du behöver inte skicka den igen."},409);
  const existing=await db.prepare("SELECT COUNT(*) AS count FROM registrations WHERE email = ? AND created_at > ?").bind(data.email,now-86400000).first<{count:number}>();
  if(existing&&existing.count>=8)return json({error:"Det finns redan flera anmälningar med denna e-postadress. Försök igen i morgon."},429);
  const token=crypto.randomUUID()+crypto.randomUUID();
  await db.prepare("INSERT INTO registrations (id,name,email,kind,event_id,guests,delete_token_hash,consent_version,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(data.requestId,data.name,data.email,data.kind,data.kind==="visit"?data.eventId:null,data.kind==="visit"?data.guests:1,await hash(token),"2026-10-08-explicit",now).run();
  return json({ok:true,deleteToken:token},201);
 }catch(error){console.error("Registration storage failed",error instanceof Error?error.name:"unknown");return json({error:"Anmälan kunde inte sparas just nu. Dina uppgifter finns kvar i formuläret. Försök igen om en stund."},503)}
}
