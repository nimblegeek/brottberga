import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const origin=process.env.TEST_ORIGIN??'http://localhost:5188';
const manifest=JSON.parse(await readFile(new URL('../.next/routes-manifest.json',import.meta.url),'utf8'));
assert.ok(manifest.version,'Next.js routes manifest must exist');

for (const headers of [{},{'oai-authenticated-user-id':'forged-user','oai-authenticated-user-email':'admin@example.com'}]) {
  const response=await fetch(origin+'/admin',{headers});
  assert.equal(response.status,200);
  const html=await response.text();
  assert.match(html,/Administrationen är inte aktiverad/);
  assert.doesNotMatch(html,/Logga in med ChatGPT|Inloggad som|admin@example.com|<table/);
}

const deletion=await fetch(origin+'/api/uppgifter',{
  method:'DELETE',
  headers:{'content-type':'application/json',origin},
  body:JSON.stringify({token:'a'.repeat(72)}),
});
assert.equal(deletion.status,503,'No success response when D1 is unavailable');
assert.equal((await deletion.json()).ok,undefined);

for (const path of ['/images/meadow.webp','/fonts/dm-sans-latin.woff2']) {
  assert.equal((await fetch(origin+path)).status,200,path);
}
console.log('PASS: Next manifest, disabled admin with spoofed headers, unavailable storage and static assets.');
