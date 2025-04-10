PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_manifests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manifest_id` integer NOT NULL,
	`status` text NOT NULL,
	`assigned_to` integer,
	`company_id` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`completed_on` integer DEFAULT NULL,
	FOREIGN KEY (`assigned_to`) REFERENCES `trucks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_manifests`("id", "manifest_id", "status", "assigned_to", "company_id", "created_at", "completed_on") SELECT "id", "manifest_id", "status", "assigned_to", "company_id", "created_at", "completed_on" FROM `manifests`;--> statement-breakpoint
DROP TABLE `manifests`;--> statement-breakpoint
ALTER TABLE `__new_manifests` RENAME TO `manifests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `manifests_manifest_id_unique` ON `manifests` (`manifest_id`);--> statement-breakpoint
CREATE INDEX `idx_manifest_assigned_to` ON `manifests` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `idx_manifest_company_id` ON `manifests` (`company_id`);