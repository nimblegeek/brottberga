# Brottberga församling

Svensk, responsiv hemsida för en växande lokal församling på Brottberga Gård 1 i Västerås. Byggd med React och TypeScript. Kan köras med Next.js på Vercel eller med Vinext, Cloudflare Workers och D1 via Sites.

## Aktuellt läge

Anmälningar är pausade på användarens begäran. Startsidan visar ingen träff- eller intresseanmälan, WebMCP-anmälningsverktyget registreras inte och servern avvisar nya inskick utan att lagra uppgifter. Tider, adress och vägbeskrivning finns kvar. Budskapet betonar en växande församling med lovsång, healing och bibelstudier.

`registrationsEnabled` i `lib/features.ts` styr pausen för både gränssnitt och server. På Sites finns befintlig databas, skyddad administration och personliga borttagningslänkar kvar. På Vercel är ingen databas eller administratörsinloggning ansluten. Återaktivera först när användaren vill ta anmälningarna i bruk och lagring och inloggning är konfigurerade för vald plattform.

## Vercel

Importera GitHub-repot med projektroten som Root Directory (katalogen som innehåller `package.json`). `vercel.json` väljer Next.js, byggkommandot `npm run build:vercel` och utmatningskatalogen `.next`. Bygget skapar den `routes-manifest.json` som Vercel behöver. Standardkommandot `npm run build` är fortfarande avsett för Sites och producerar `dist/`.

För att prova samma Next.js-bygge lokalt, använd Node.js 22.13 eller senare:

```sh
npm ci
npm run build:vercel
npm run start:vercel -- --hostname 127.0.0.1 --port 5188
```

Använd `npm run dev:vercel` för utveckling med Next.js. Startsidan och svenska typsnitt fungerar utan miljövariabler. Anmälningar förblir pausade. `/admin` visar att administrationen inte är aktiverad, och inkommande ChatGPT-identitetshuvuden godtas inte som inloggning på Vercel. D1-data flyttas inte; tidigare borttagningslänkar ska fortsatt användas på den ursprungliga Sites-adressen.

`lib/server-platform.ts` är standardmiljön för Next.js utan D1 eller Sites-inloggning. Vite ersätter den med `lib/server-platform.sites.ts` vid Sites-byggen, där befintliga bindningar och inloggning används.

## Funktioner (anmälningar förberedda för senare)

- Presentation av gemenskapen och Pastor John Josephsson.
- Kommande söndagar kl. 11.00 och torsdagar kl. 18.30, beräknade i Europe/Stockholm med korrekt sommar- och vintertid.
- Träffanmälan och intresseanmälan med beständig databaslagring.
- Uttryckligt samtycke, servervalidering, begränsning av upprepade försök och skydd mot dubletter.
- Bekräftelse på sidan och kalenderfil. Inga automatiska mejl skickas; ingen e-posttjänst är ansluten.
- Personlig borttagningslänk. Token lagras bara som SHA-256-hash på servern. Länken behöver sparas av besökaren.
- `/admin`: anmälningar och nya kontakter. Kräver inloggning med ChatGPT och en uttrycklig tillåtelselista.
- Mobilmeny, tangentbordsanvändbara dialoger, vanliga frågor, kartlänk och ett WebMCP-verktyg som öppnar anmälningsformuläret utan att skicka uppgifter.

## Utveckling med Sites

Använd Node.js 22.13 eller senare.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 5187
```

Kör `npm run db:generate` när databasschemat ändras. För lokal D1 måste projektet först byggas och migreringen appliceras:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nappy_slayback.sql
```

Applicera varje migrering endast en gång i respektive databas. Produktionsmigreringar hanteras av Sites.

## Administration och lansering

Sätt servervariabeln `ADMIN_EMAILS` via Sites till de ChatGPT-kontons e-postadresser som får se anmälningar, separerade med kommatecken. Om listan är tom är administrationen stängd för alla. Klienten kan aldrig välja sin egen administratörsbehörighet. Använd inte ett klientexponerat miljövariabelprefix.

Nya Sites är privata. Innan allmänheten kan nå hemsidan behöver ägaren ändra målgruppen till offentlig. Privat publicering och offentligt tillgänglig hemsida är olika steg. Valfri egen domän kan kopplas senare.

Personuppgifter exponeras inte i publika läsendpoints. Anmälningar äldre än 90 dagar rensas vid nästa anmälan eller administratörsbesök; ingen separat schemalagd rensning är konfigurerad. Informera ansvariga om denna hantering och bestäm kontaktväg för integritetsfrågor före offentlig lansering.

Träffarna antas återkomma varje vecka enligt briefen. Inget system för inställda träffar eller ändrade tider är tillagt. Medlemsintresse är en kontaktförfrågan, inte automatiskt medlemskap.

## Kontroller

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/events.test.mjs
# Med lokal Sites-server (och migrerad D1 om anmälningar aktiverats):
node --experimental-strip-types tests/api-smoke.mjs
# Med Next.js-produktionsserver på port 5188:
TEST_ORIGIN=http://localhost:5188 node --experimental-strip-types tests/api-smoke.mjs
node tests/vercel-smoke.mjs
```

När anmälningarna är pausade kontrollerar API-provet att båda typerna av inskick avvisas, att inga formulär eller anmälningsknappar visas och att det nya budskapet finns på startsidan. Vid aktiverade anmälningar körs de tidigare validerings- och lagringsproven med påhittade lokala uppgifter som sedan tas bort.

## Bild

`public/images/meadow.webp` är en AI-genererad stämningsbild av svensk landsbygd. Den föreställer inte Brottberga Gård eller församlingens medlemmar. Ersätt gärna med ett autentiskt foto. Inga påhittade foton av pastorn eller medlemmarna används.

## Svenska tecken och typsnitt

Brödtextens DM Sans levereras från `public/fonts/` via `app/fonts.css`, inklusive Latin- och Latin Extended-tecken. Å, ä och ö finns i Latin-filen. Rubriker använder Georgia för tydligare svenska diakritiska tecken. Ingen extern Google Fonts-förfrågan behövs. DM Sans OFL-licens finns i samma katalog. Sidans språk är svenska och texterna är UTF-8.
