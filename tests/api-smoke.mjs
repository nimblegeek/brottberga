import assert from 'node:assert/strict';
import {upcomingGatherings} from '../lib/events.ts';
import {registrationsEnabled} from '../lib/features.ts';
const origin='http://127.0.0.1:5187';
const send=(body,headers={})=>fetch(origin+'/api/anmalan',{method:'POST',headers:{'content-type':'application/json',origin,...headers},body:JSON.stringify(body)});
const base={requestId:crypto.randomUUID(),name:'Automatiskt lokalt test',email:'local-test@example.com',kind:'visit',eventId:upcomingGatherings()[0].id,guests:2,consent:true,website:''};
if (!registrationsEnabled) {
  for (const kind of ['visit','interest']) {
    const response=await send({...base,kind,eventId:kind==='visit'?base.eventId:null});
    assert.equal(response.status,503);
    assert.equal((await response.json()).code,'REGISTRATIONS_PAUSED');
  }
  const response=await fetch(origin+'/');
  const html=await response.text();
  assert.equal(response.status,200);
  assert.match(html,/EN VÄXANDE FÖRSAMLING/);
  assert.match(html,/Lovsång/);
  assert.match(html,/Healing/);
  assert.match(html,/Bibelstudier/);
  assert.doesNotMatch(html,/<form[\s>]/i);
  assert.doesNotMatch(html,/Jag kommer på söndag|Jag kommer på torsdag|Skicka intresseanmälan/);
  console.log('PASS: both registration types paused; no registration forms or buttons; updated congregation message and all three focus areas rendered.');
  process.exit(0);
}
assert.equal((await send({...base,consent:false})).status,400);
assert.equal((await send({...base,eventId:'sunday-2020-01-01'})).status,400);
assert.equal((await send(base,{origin:'https://other.invalid'})).status,403);
const created=await send(base);const body=await created.json();assert.equal(created.status,201,JSON.stringify(body));assert.ok(body.deleteToken);
assert.equal((await send(base)).status,409);
const removed=await fetch(origin+'/api/uppgifter',{method:'DELETE',headers:{'content-type':'application/json',origin},body:JSON.stringify({token:body.deleteToken})});assert.equal(removed.status,200);
const interest=await send({...base,requestId:crypto.randomUUID(),kind:'interest',eventId:null});const interestData=await interest.json();assert.equal(interest.status,201,JSON.stringify(interestData));
await fetch(origin+'/api/uppgifter',{method:'DELETE',headers:{'content-type':'application/json',origin},body:JSON.stringify({token:interestData.deleteToken})});
const admin=await fetch(origin+'/admin');assert.match(await admin.text(),/Logga in med ChatGPT/);
console.log('PASS: valid registration, interest, explicit consent, invalid date, cross-origin rejection, duplicate protection, deletion and anonymous admin gate. Test records removed.');
