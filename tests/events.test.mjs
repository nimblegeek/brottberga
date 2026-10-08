import assert from 'node:assert/strict';
import { test } from 'node:test';
import { upcomingGatherings, eventStart, calendarFile } from '../lib/events.ts';
test('Stockholm summer and winter meeting hours',()=>{assert.equal(eventStart('2026-10-11','11:00'),'2026-10-11T09:00:00.000Z');assert.equal(eventStart('2026-10-25','11:00'),'2026-10-25T10:00:00.000Z');assert.equal(eventStart('2027-03-28','11:00'),'2027-03-28T09:00:00.000Z')});
test('ongoing meetings are excluded and dates roll forward',()=>{assert.equal(upcomingGatherings(new Date('2026-10-08T16:29:00Z'))[0].id,'thursday-2026-10-08');assert.equal(upcomingGatherings(new Date('2026-10-08T16:30:00Z'))[0].id,'sunday-2026-10-11');assert.equal(upcomingGatherings(new Date('2026-12-31T18:00:00Z'))[0].id,'sunday-2027-01-03')});
test('calendar uses a correct UTC timestamp and escaped location',()=>{const event=upcomingGatherings(new Date('2026-10-08T20:00:00Z'))[0];assert.match(calendarFile(event),/DTSTART:20261011T090000Z/);assert.match(calendarFile(event),/LOCATION:Brottberga Gård 1\\, Västerås/);assert.equal(upcomingGatherings().length,8)});
