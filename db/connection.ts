import { env } from "cloudflare:workers";
export function database(){if(!env.DB)throw new Error("Registration storage unavailable");return env.DB;}
export async function pruneExpired(){const db=database();const now=Date.now();await db.batch([db.prepare("DELETE FROM registrations WHERE created_at < ?").bind(now-90*86400000),db.prepare("DELETE FROM rate_limits WHERE expires_at < ?").bind(now)]);}
export async function hash(value:string){const buffer=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,"0")).join("");}
