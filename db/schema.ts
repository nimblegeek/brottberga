import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const registrations=sqliteTable("registrations",{
 id:text("id").primaryKey(),name:text("name").notNull(),email:text("email").notNull(),kind:text("kind").notNull(),eventId:text("event_id"),guests:integer("guests").notNull().default(1),deleteTokenHash:text("delete_token_hash").notNull(),consentVersion:text("consent_version").notNull(),createdAt:integer("created_at").notNull()
},table=>[index("idx_registrations_created").on(table.createdAt),index("idx_registrations_email_created").on(table.email,table.createdAt),index("idx_registrations_delete_token").on(table.deleteTokenHash)]);
export const rateLimits=sqliteTable("rate_limits",{key:text("key").primaryKey(),count:integer("count").notNull(),expiresAt:integer("expires_at").notNull()});
