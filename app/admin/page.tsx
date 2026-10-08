import { serverPlatform } from "@/lib/server-platform";
import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { database, pruneExpired } from "@/db/connection";
export const dynamic="force-dynamic";
export default async function Admin(){
 if(!serverPlatform.trustsChatGPTHeaders)return <main className="admin-shell"><h1>Anmälningar</h1><p>Administrationen är inte aktiverad på den här webbplatsen.</p><a className="underlined" href="/">Till hemsidan</a></main>;
 const user=await getChatGPTUser();
 const allowlist=serverPlatform.adminEmails.toLowerCase().split(",").map(s=>s.trim()).filter(Boolean);
 if(!user)return <main className="admin-shell"><h1>Anmälningar</h1><p>Den här sidan är till för församlingens ansvariga.</p><a className="button olive" href={chatGPTSignInPath("/admin")} target="_top">Logga in med ChatGPT</a></main>;
 if(!allowlist.includes(user.email.toLowerCase()))return <main className="admin-shell"><h1>Anmälningar</h1><p>Ditt konto har inte tillgång till anmälningarna. En administratör behöver ge dig behörighet.</p><a className="underlined" href="/">Till hemsidan</a></main>;
 let entries: {id:string;name:string;email:string;kind:string;event_id:string|null;guests:number;created_at:number}[];
 try{await pruneExpired();const result=await database().prepare("SELECT id,name,email,kind,event_id,guests,created_at FROM registrations ORDER BY created_at DESC LIMIT 500").all<typeof entries[number]>();entries=result.results;}catch{return <main className="admin-shell"><h1>Anmälningar</h1><p>Det går inte att läsa anmälningarna just nu. Ladda om sidan om en stund.</p></main>}
 return <main className="admin-shell"><a className="underlined" href="/">Till hemsidan</a><h1 style={{marginTop:30}}>Anmälningar & nya kontakter</h1><p>Inloggad som {user.email}. Visar de senaste 500 anmälningarna från de senaste 90 dagarna. Uppdatera sidan för att se nya svar.</p>{[{kind:"visit",title:"Anmälningar till träffar"},{kind:"interest",title:"Intresseanmälningar"}].map(group=><section key={group.kind}><h2>{group.title}</h2>{entries.filter(e=>e.kind===group.kind).length?<div className="admin-list"><table><thead><tr><th>Namn</th><th>E-post</th>{group.kind==="visit"&&<><th>Träff</th><th>Antal</th></>}<th>Inkom</th></tr></thead><tbody>{entries.filter(e=>e.kind===group.kind).map(e=><tr key={e.id}><td>{e.name}</td><td><a href={`mailto:${e.email}`}>{e.email}</a></td>{group.kind==="visit"&&<><td>{e.event_id?.replace("sunday-","Söndag ").replace("thursday-","Torsdag ")}</td><td>{e.guests}</td></>}<td>{new Date(e.created_at).toLocaleString("sv-SE",{timeZone:"Europe/Stockholm",dateStyle:"short",timeStyle:"short"})}</td></tr>)}</tbody></table></div>:<p>Inga anmälningar ännu.</p>}</section>)}</main>
}
