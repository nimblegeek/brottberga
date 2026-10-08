CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`event_id` text,
	`guests` integer DEFAULT 1 NOT NULL,
	`delete_token_hash` text NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_registrations_created` ON `registrations` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_registrations_email_created` ON `registrations` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_registrations_delete_token` ON `registrations` (`delete_token_hash`);