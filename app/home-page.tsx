"use client";
import { useEffect, useRef, useState } from "react";
import { Cross, MapPin, Sun, Moon, Heart, Music2, BookOpen, Check, X, CalendarDays, ChevronDown, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { calendarFile, type Gathering, upcomingGatherings } from "@/lib/events";
import { registrationsEnabled } from "@/lib/features";

type Mode = "visit" | "interest" | "privacy" | null;
export default function HomePage({events: initialEvents}: {events: Gathering[]}) {
 const [events,setEvents]=useState(initialEvents);
 const [mode,setMode]=useState<Mode>(null);
 const [selected,setSelected]=useState(initialEvents[0]?.id ?? "");
 const [menu,setMenu]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [consent,setConsent]=useState(false);
 const [success,setSuccess]=useState<{deleteToken:string;event?:Gathering}|null>(null);
 const requestId=useRef("");
 const triggerRef=useRef<HTMLElement|null>(null);
 const event = events.find(e=>e.id===selected);
 useEffect(()=>{const refresh=()=>setEvents(upcomingGatherings());refresh();const timer=setInterval(refresh,60000);return()=>clearInterval(timer)},[]);
 function open(next: Mode, kind?: Gathering["kind"]) {
   if (!registrationsEnabled && next !== "privacy") return;
   triggerRef.current=document.activeElement as HTMLElement;
   const fresh=upcomingGatherings();setEvents(fresh);
   if(kind) setSelected(fresh.find(e=>e.kind===kind)!.id);
   else setSelected(fresh[0]?.id ?? "");
   setMode(next);setSuccess(null);setError("");setConsent(false);requestId.current=crypto.randomUUID();
 }
 useEffect(()=>{
   if (!registrationsEnabled) return;
   const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>unknown}}).modelContext;
   if(!context?.registerTool)return;
   const lifecycle=new AbortController();
   Promise.resolve(context.registerTool({name:"start_gathering_registration",title:"Öppna anmälan till en träff",description:"Öppnar anmälningsformuläret för söndag eller torsdag. Skickar ingen anmälan. Besökaren fyller själv i kontaktuppgifter och samtycke.",inputSchema:{type:"object",properties:{day:{type:"string",enum:["sunday","thursday"]}},required:["day"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){const day=(input as {day?:unknown})?.day;if(day!=="sunday"&&day!=="thursday")throw new Error("Välj sunday eller thursday.");open("visit",day);return {status:"form_opened",day};}},{signal:lifecycle.signal})).catch(()=>{});
   return()=>lifecycle.abort();
 },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>) {
   e.preventDefault();if(busy)return;
   if(!consent){setError("Godkänn hanteringen av dina uppgifter för att fortsätta.");return}
   const fields=new FormData(e.currentTarget);
   setBusy(true);setError("");
   try {
    const response=await fetch("/api/anmalan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId:requestId.current,name:fields.get("name"),email:fields.get("email"),kind:mode,eventId:mode==="visit"?selected:null,guests:mode==="visit"?Number(fields.get("guests")):1,consent,website:fields.get("website")})});
    const result=await response.json() as {error?:string;deleteToken:string};
    if(!response.ok)throw new Error(result.error||"Det gick inte att spara. Försök igen.");
    setSuccess({deleteToken:result.deleteToken,event:mode==="visit"?event:undefined});
   }catch(err){setError(err instanceof Error?err.message:"Vi kunde inte nå fram. Försök igen om en stund.");}finally{setBusy(false)}
 }
 function downloadCalendar(gathering:Gathering){const url=URL.createObjectURL(new Blob([calendarFile(gathering)],{type:"text/calendar;charset=utf-8"}));const anchor=document.createElement("a");anchor.href=url;anchor.download="brottberga.ics";anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const firstSunday=events.find(e=>e.kind==="sunday");const firstThursday=events.find(e=>e.kind==="thursday");
 return <>
  <a className="skip-link" href="#innehall">Till innehållet</a>
  <header className="header">
   <a className="brand" href="/" aria-label="Brottberga församling, startsida"><Cross strokeWidth={1.3}/><span>brottberga<small>FÖRSAMLING</small></span></a>
   <nav aria-label="Huvudmeny"><a href="#om-oss">Vår gemenskap</a><a href="#traffar">Våra träffar</a><a href="#hitta-hit">Hitta hit</a></nav>
   {registrationsEnabled ? <button className="button small olive desktop-cta" onClick={()=>open("interest")}>Välkommen hem</button> : <a className="button small olive desktop-cta" href="#traffar">Välkommen hem</a>}
   <button className="menu-toggle" onClick={()=>setMenu(!menu)} aria-label={menu?"Stäng menyn":"Öppna menyn"} aria-expanded={menu} aria-controls="mobile-nav">{menu?<X/>:<Menu/>}</button>
  </header>
  {menu&&<nav className="mobile-nav" id="mobile-nav" aria-label="Mobilmeny"><a onClick={()=>setMenu(false)} href="#om-oss">Vår gemenskap</a><a onClick={()=>setMenu(false)} href="#traffar">Våra träffar</a><a onClick={()=>setMenu(false)} href="#hitta-hit">Hitta hit</a>{registrationsEnabled ? <button onClick={()=>{setMenu(false);open("interest")}}>Lär känna församlingen</button> : <a onClick={()=>setMenu(false)} href="#om-oss">Lär känna församlingen</a>}</nav>}
  <main id="innehall">
   <section className="hero"><div className="hero-shade"/><div className="hero-content"><p className="eyebrow light"><span/> EN VÄXANDE FÖRSAMLING I VÄSTERÅS</p><h1>Ett liv med Jesus.<br/>En gemenskap<br/>att kalla <em>hemma.</em></h1><p className="hero-copy">Vi växer i tro och gemenskap, med Jesus i centrum.<br className="desktop"/> Genom lovsång, healing och bibelstudier söker vi honom tillsammans.</p><div className="hero-actions"><a className="button cream" href="#traffar">Kom på en träff</a><a className="text-link" href="#om-oss">Lär känna oss</a></div></div><div className="hero-bottom"><span><MapPin size={16}/> Brottberga Gård 1, Västerås</span><span>Plats för tro. Plats för frågor. Plats för dig.</span></div></section>
   <div className="meeting-strip"><span>VI MÖTS VARJE VECKA</span><a href="#traffar"><Sun size={20}/> Söndagar <strong>11.00</strong></a><i/><a href="#traffar"><Moon size={19}/> Torsdagar <strong>18.30</strong></a><span className="strip-note">Varmt välkommen, precis som du är.</span></div>
   <section className="intro section" id="om-oss"><div><p className="eyebrow">EN VÄXANDE FÖRSAMLING. LEVANDE TRO.</p><h2>Rotade i Jesus.<br/><em>Vi växer tillsammans.</em></h2></div><div className="intro-copy"><p className="lead">Vi längtar efter en tro som får liv i vardagen. Efter väckelse som börjar i hjärtat och en gemenskap där vi bär varandra.</p><p>Brottberga församling är en växande kristen gemenskap hemma på Brottberga Gård i Västerås. Här får vi växa i tro och lära känna varandra genom lovsång, healing och bibelstudier. Vi vill följa Jesus med hela livet – fria från religiös prestation och färdiga mallar. Med öppna hjärtan för det Gud vill göra här och nu.</p>{registrationsEnabled ? <button className="underlined" onClick={()=>open("interest")}>Det finns en plats för dig här</button> : <a className="underlined" href="#traffar">Det finns en plats för dig här</a>}</div></section>
   <section className="values" aria-label="Lovsång, healing och bibelstudier"><article><Music2 strokeWidth={1.3}/><h3>Lovsång</h3><p>Vi lyfter våra hjärtan till Jesus i lovsång och tillbedjan. Tillsammans ger vi plats för hans närvaro och låter tacksamheten ta ton.</p></article><article><Heart strokeWidth={1.3}/><h3>Healing &amp; förbön</h3><p>Vi ber om helande och möter varandra med omsorg. Med tillit till Jesus lämnar vi rum för hans närvaro och kraft.</p></article><article><BookOpen strokeWidth={1.3}/><h3>Bibelstudier</h3><p>Vi öppnar Bibeln tillsammans, ställer frågor och upptäcker mer av vem Jesus är. Guds ord får forma vår tro och vårt liv i vardagen.</p></article></section>
   <section className="gatherings section" id="traffar"><div className="section-heading"><div><p className="eyebrow">VI SES PÅ GÅRDEN</p><h2>En plats i veckan.<br/><em>En plats i gemenskapen.</em></h2></div><p>Det börjar med att vi möts.<br/>Välkommen till någon av våra träffar.</p></div><div className="gathering-grid">
    <article><div className="card-top"><span className="sun-icon"><Sun size={28} strokeWidth={1.4}/></span><span className="next-date">Nästa: {firstSunday?.label.replace("söndag ","")}</span></div><span className="card-overline">SÖNDAGAR KL. 11.00</span><h3>Söndag tillsammans</h3><p>Vi samlas kring Jesus i lovsång, delar Guds ord och ber om helande. En stund för gemenskap och ny kraft inför veckan.</p><div className="card-place"><MapPin size={16}/> Brottberga Gård 1, Västerås</div>{registrationsEnabled ? <button className="button olive" onClick={()=>open("visit","sunday")}>Jag kommer på söndag</button> : <a className="button olive" href="#hitta-hit">Hitta till gården</a>}</article>
    <article><div className="card-top"><span className="moon-icon"><Moon size={26} strokeWidth={1.4}/></span><span className="next-date">Nästa: {firstThursday?.label.replace("torsdag ","")}</span></div><span className="card-overline">TORSDAGAR KL. 18.30</span><h3>Torsdag på gården</h3><p>Vi fördjupar oss i Bibeln, möts i lovsång och bär varandra i förbön. Mitt i vardagen ger vi rum för det Jesus vill göra.</p><div className="card-place"><MapPin size={16}/> Brottberga Gård 1, Västerås</div>{registrationsEnabled ? <button className="button outline" onClick={()=>open("visit","thursday")}>Jag kommer på torsdag</button> : <a className="button outline" href="#hitta-hit">Hitta till gården</a>}</article>
   </div><p className="gathering-note">Ny hos oss? Du behöver inte vara medlem för att komma.</p></section>
   <section className="pastor section"><div className="pastor-heading"><p className="eyebrow">ETT NÄRVARANDE LEDARSKAP</p><h2>Med ödmjukhet,<br/>frid <em>och nåd.</em></h2></div><div className="pastor-copy"><p className="lead">Pastor John Josephsson leder Brottberga församling med en längtan efter att varje människa ska få leva nära Jesus.</p><p>Vår församling växer, och vi vill fortsätta vara nära varandra. Med öppenhet, nåd och en familjär gemenskap får vi växa i tro och låta Jesus forma våra liv.</p><div className="pastor-signature"><span>John Josephsson</span><small>PASTOR · BROTTBERGA FÖRSAMLING</small></div></div></section>
   <section className="invitation"><p className="eyebrow light">DITT NÄSTA STEG KAN VARA LITET</p><h2>Nyfiken på Jesus?<br/><em>Eller på att hitta hem?</em></h2><p>Oavsett var du är i livet eller tron får du börja här.<br className="desktop"/> {registrationsEnabled ? "Lämna en intresseanmälan så kan vi lära känna varandra." : "Kom och dela lovsången, upptäck Bibeln och lär känna oss."}</p>{registrationsEnabled ? <button className="button cream" onClick={()=>open("interest")}>Jag vill lära känna er</button> : <a className="button cream" href="#traffar">Se när vi möts</a>}<span>Plats för din tro, dina frågor och din längtan.</span></section>
   <section className="section visit" id="hitta-hit"><div><p className="eyebrow">HEMMA PÅ BROTTBERGA GÅRD</p><h2>Vi ses <em>här.</em></h2><p>Vi samlas hemma på gården i Västerås.<br/>Samma plats, två tillfällen i veckan att mötas.</p><div className="address"><MapPin strokeWidth={1.4}/><span><strong>Brottberga Gård 1</strong><br/>Västerås</span></div><a className="button olive" href="https://www.google.com/maps/search/?api=1&query=Brottberga+G%C3%A5rd+1+V%C3%A4ster%C3%A5s" target="_blank" rel="noreferrer">Öppna vägbeskrivning</a></div><div className="questions"><h3>Inför ditt första besök</h3>{[{q:"Behöver jag vara medlem?",a:"Nej. Du är välkommen att besöka en träff och lära känna oss innan du tar ställning till medlemskap."},{q:"Behöver jag vara van vid kyrkan?",a:"Nej. Du får komma med din tro, dina frågor eller din nyfikenhet. Du behöver inte förbereda dig eller känna någon sedan tidigare."},{q:"Vad står i centrum när vi ses?",a:"Jesus står i centrum för vår gemenskap. Vi möts i lovsång, ber om helande och fördjupar oss i Bibeln tillsammans. Här finns plats för både tro, frågor och förnyelse."},{q:"Kan jag ta med någon?",a:"Ja, gärna. Ta med en vän eller någon i familjen. Ni är varmt välkomna att lära känna gemenskapen tillsammans."}].map(item=><details key={item.q}><summary>{item.q}<ChevronDown size={17}/></summary><p>{item.a}</p></details>)}</div></section>
  </main>
  <footer><a className="brand" href="/">brottberga<small>FÖRSAMLING</small></a><p>Jesus i centrum. Livet tillsammans.</p><div><span>Brottberga Gård 1 · Västerås</span><button onClick={()=>open("privacy")}>Om dina uppgifter</button></div></footer>
  <Dialog open={mode!==null} onOpenChange={value=>{if(!value&&!busy)setMode(null)}}>
   <DialogContent className="registration-dialog" showCloseButton={false} onCloseAutoFocus={e=>{e.preventDefault();triggerRef.current?.focus()}}><DialogClose className="dialog-close" aria-label="Stäng" disabled={busy}><X size={20}/></DialogClose>
    <DialogTitle className="dialog-title">{mode==="privacy"?"Om dina uppgifter":success?"Tack, vad fint!":mode==="visit"?"Vi ser fram emot att ses.":"Låt oss lära känna dig."}</DialogTitle>
    <DialogDescription className="dialog-description">{mode==="privacy"?"Så används det du lämnar till Brottberga församling.":success?"Dina uppgifter har sparats.":mode==="visit"?"Anmäl dig till en träff på Brottberga Gård.":"En intresseanmälan är en första kontakt, inte ett medlemskap."}</DialogDescription>
    {mode==="privacy"&&!registrationsEnabled?<div className="privacy-copy"><p>Digitala anmälningar är pausade. Hemsidan samlar därför inte in nya kontaktuppgifter via anmälningsformulär.</p><p>Om du tidigare har lämnat en anmälan kan du fortfarande använda din personliga länk för att ta bort uppgifterna och återkalla ditt samtycke. Du kan också kontakta församlingen vid en träff på Brottberga Gård 1, Västerås.</p></div>:mode==="privacy"?<div className="privacy-copy"><p>Vi sparar ditt namn, din e-postadress och, vid en träff, datum och antal deltagare. Uppgifterna används för att hantera din anmälan eller ta kontakt om din intresseanmälan.</p><p>En anmälan till en församling kan avslöja uppgifter om religiös övertygelse. Därför ber vi om ditt uttryckliga samtycke. Vi använder inte uppgifterna till reklam.</p><p>Efter att du har skickat formuläret får du en personlig länk där du kan ta bort uppgifterna och återkalla ditt samtycke. Spara länken. Du kan också kontakta församlingen vid en träff på Brottberga Gård 1, Västerås.</p><p>Bekräftelsen visas på hemsidan. Inget automatiskt bekräftelsemejl skickas.</p></div>:success?<div className="success-state"><div className="success-mark"><Check size={30}/></div>{success.event?<><h3>Du är anmäld!</h3><p>{success.event.label} kl. {success.event.time.replace(":",".")}<br/>Brottberga Gård 1, Västerås</p><button className="button olive" onClick={()=>downloadCalendar(success.event!)}><CalendarDays size={17}/> Spara i kalendern</button></>:<><h3>Din intresseanmälan är mottagen.</h3><p>Vi ser fram emot att lära känna dig.<br/>Du är också varmt välkommen på nästa träff.</p></>}<div className="deletion-link"><p>Spara din personliga länk om du vill kunna ta bort dina uppgifter senare.</p><a href={`/dina-uppgifter#${success.deleteToken}`} target="_blank" rel="noreferrer">Hantera mina uppgifter</a></div><p className="small-note">Detta är din bekräftelse. Inget automatiskt mejl skickas.</p></div>:<form onSubmit={submit} className="registration-form">
     {mode==="visit"&&<><label htmlFor="event">Vilken träff vill du komma på?</label><Select value={selected} onValueChange={setSelected} disabled={busy}><SelectTrigger id="event" className="form-select"><SelectValue placeholder="Välj en träff"/></SelectTrigger><SelectContent>{events.map(e=><SelectItem key={e.id} value={e.id}>{e.label} kl. {e.time.replace(":",".")}</SelectItem>)}</SelectContent></Select></>}
     <label htmlFor="name">Ditt namn</label><input id="name" name="name" autoComplete="name" required maxLength={100} placeholder="För- och efternamn" disabled={busy}/>
     <label htmlFor="email">E-postadress</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="namn@exempel.se" disabled={busy}/>
     {mode==="visit"&&<><label htmlFor="guests">Hur många blir ni, inklusive dig?</label><input id="guests" name="guests" type="number" min={1} max={12} defaultValue={1} required disabled={busy}/></>}
     <div className="honey" aria-hidden="true"><label htmlFor="website">Lämna detta fält tomt</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
     <div className="consent"><Checkbox id="consent" checked={consent} onCheckedChange={value=>setConsent(value===true)} disabled={busy}/><label htmlFor="consent">Jag samtycker uttryckligen till att Brottberga församling sparar mina uppgifter för denna anmälan och kontakt med mig, även om de kan avslöja religiös övertygelse.</label></div>
     <p className="form-note">Du kan återkalla ditt samtycke och ta bort uppgifterna via den personliga länken i bekräftelsen.</p>
     {error&&<p role="alert" className="form-error">{error}</p>}
     <button className="button olive submit" disabled={busy} type="submit">{busy?"Skickar…":mode==="visit"?"Skicka min anmälan":"Skicka intresseanmälan"}</button>
    </form>}
   </DialogContent>
  </Dialog>
 </>;
}
