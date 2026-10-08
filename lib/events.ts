export type Gathering = { id: string; kind: "sunday" | "thursday"; date: string; label: string; title: string; time: string; startsAt: string };
const zone = "Europe/Stockholm";
export function stockholmParts(date: Date) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-GB", {timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(date).map(p=>[p.type,p.value]));
}
export function eventStart(date: string, time: string) {
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = stockholmParts(guess);
  const displayed = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`);
  return new Date(guess.getTime() - (displayed - guess.getTime())).toISOString();
}
export function upcomingGatherings(now = new Date(), count = 8): Gathering[] {
  const local = stockholmParts(now);
  const base = new Date(`${local.year}-${local.month}-${local.day}T12:00:00Z`);
  const gatherings: Gathering[] = [];
  for (let i = 0; gatherings.length < count && i < 70; i++) {
    const day = new Date(base); day.setUTCDate(base.getUTCDate() + i);
    const weekday = day.getUTCDay();
    if (weekday !== 0 && weekday !== 4) continue;
    const kind = weekday === 0 ? "sunday" : "thursday";
    const time = kind === "sunday" ? "11:00" : "18:30";
    const date = day.toISOString().slice(0,10);
    const startsAt = eventStart(date,time);
    if (new Date(startsAt) <= now) continue;
    const label = new Intl.DateTimeFormat("sv-SE",{timeZone:zone,weekday:"long",day:"numeric",month:"long"}).format(day);
    gatherings.push({id:`${kind}-${date}`,kind,date,label,title:kind === "sunday" ? "Söndag tillsammans" : "Torsdag på gården",time,startsAt});
  }
  return gatherings;
}
export function calendarFile(event: Gathering) {
  const stamp = event.startsAt.replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Brottberga//Träffar//SV","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${event.id}@brottberga`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,`DTSTART:${stamp}`,`SUMMARY:${event.title} – Brottberga församling`,"LOCATION:Brottberga Gård 1\\, Västerås","DESCRIPTION:Välkommen till gemenskap kring Jesus på Brottberga Gård.","END:VEVENT","END:VCALENDAR"].join("\r\n")+"\r\n";
}
